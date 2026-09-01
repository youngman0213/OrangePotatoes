  for(let f=3.5;f<=8.01;f+=.25){let ss=0,cc=0,sc=0,sy=0,cy=0;for(let i=0;i<points.length;i++){const a=2*Math.PI*f*(points[i].t-t0),sn=Math.sin(a),co=Math.cos(a),y=ys[i]-ym;ss+=sn*sn;cc+=co*co;sc+=sn*co;sy+=sn*y;cy+=co*y}const det=ss*cc-sc*sc;if(Math.abs(det)<1e-9)continue;const A=(sy*cc-cy*sc)/det,B=(cy*ss-sy*sc)/det,amp=Math.sqrt(A*A+B*B);let sse=0;const residuals=[];for(let i=0;i<points.length;i++){const a=2*Math.PI*f*(points[i].t-t0),pred=ym+A*Math.sin(a)+B*Math.cos(a),e=ys[i]-pred;residuals.push(Math.abs(e));sse+=e*e}const r2=1-sse/sst;if(!best||r2>best.r2)best={freq:f,amp,r2,residuals}}
  if(!best||best.r2<.56||best.amp<8||best.amp>90)return null;return best;
}
function segmentNotes(points){
  if(!points.length)return [];const sm=points.map((p,i)=>({...p,sm:smoothMidi(points,i,1)})),segments=[];let start=0;
  const close=end=>{if(end<start)return;const seg=sm.slice(start,end+1);if(seg.length<3)return;const dur=seg.at(-1).t-seg[0].t;if(dur<.12)return;const center=median(seg.map(x=>x.sm));const vib=fitVibrato(seg,center);const edge=.055;let coreIdx=[];for(let i=0;i<seg.length;i++){if(seg[i].t>=seg[0].t+edge&&seg[i].t<=seg.at(-1).t-edge)coreIdx.push(i)}if(coreIdx.length<3)coreIdx=[...seg.keys()];const rawResiduals=coreIdx.map(i=>Math.abs(seg[i].midi-center)*100),adjusted=vib?coreIdx.map(i=>vib.residuals[i]):rawResiduals,residuals=adjusted.filter(x=>x<260);if(residuals.length<3)return;segments.push({start:seg[0].t,end:seg.at(-1).t,center,points:seg,coreIdx,residuals,vibrato:vib,stability:median(residuals),p90:percentile(residuals,.9),weight:Math.max(.12,dur)})};
  for(let i=2;i<sm.length-2;i++){if(sm[i].t-sm[i-1].t>.34){close(i-1);start=i;continue}const left=median([sm[i-2].sm,sm[i-1].sm,sm[i].sm]),right=median([sm[i].sm,sm[i+1].sm,sm[i+2].sm]);const sustained=Math.abs(right-left)>1.05&&Math.abs(sm[i+2].sm-right)<.62;if(sustained&&i-start>=3){close(i-1);start=i}}close(sm.length-1);return segments;
}
function residualsFromSegments(segments){const out=[];for(const s of segments)for(const i of s.coreIdx){const p=s.points[i],r=s.vibrato?s.vibrato.residuals[i]:Math.abs(p.midi-s.center)*100;if(r<260)out.push({t:p.t,midi:p.midi,residual:r,rms:p.rms,conf:p.conf,verify:p.verify,segmentCenter:s.center,vibrato:!!s.vibrato})}return out}

let demucsRuntimePromise=null;
const DEMUCS_MODEL='https://huggingface.co/StemSplitio/htdemucs-ft-vocals-onnx/resolve/main/htdemucs_ft_vocals_fp16weights.onnx';
const ORT_CDN='https://cdn.jsdelivr.net/npm/onnxruntime-web@1.29.0/dist/';
async function getDemucsRuntime(onProgress=()=>{}){
  if(!demucsRuntimePromise){
    demucsRuntimePromise=(async()=>{
      onProgress('AI 보컬 분리 엔진을 준비하는 중… 첫 실행은 모델 다운로드 때문에 시간이 걸릴 수 있어.');
      const ort=await import(ORT_CDN+'ort.all.min.mjs');
      try{ort.env.wasm.wasmPaths=ORT_CDN;ort.env.wasm.numThreads=(self.crossOriginIsolated?Math.min(4,navigator.hardwareConcurrency||4):1)}catch{}
      const opts={graphOptimizationLevel:'all'};
      if(navigator.gpu)opts.executionProviders=['webgpu','wasm'];else opts.executionProviders=['wasm'];
      let session;
      try{session=await ort.InferenceSession.create(DEMUCS_MODEL,opts)}catch(e){
        if(navigator.gpu){onProgress('GPU 경로가 맞지 않아 호환 모드로 다시 준비하는 중…');session=await ort.InferenceSession.create(DEMUCS_MODEL,{executionProviders:['wasm'],graphOptimizationLevel:'all'})}else throw e;
      }
      return {ort,session};
    })();
  }
  return demucsRuntimePromise;
}
async function audioBufferToStereo44100(buf){
  const targetRate=44100,targetLen=Math.ceil(buf.duration*targetRate);
  if(buf.sampleRate===targetRate&&buf.numberOfChannels>=2){return [new Float32Array(buf.getChannelData(0)),new Float32Array(buf.getChannelData(1))]}
  const Off=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!Off)throw new Error('이 브라우저에서는 정밀 보컬 분리용 리샘플링을 지원하지 않아.');
  const off=new Off(2,targetLen,targetRate),src=off.createBufferSource();src.buffer=buf;src.connect(off.destination);src.start(0);const rendered=await off.startRendering();
  return [new Float32Array(rendered.getChannelData(0)),new Float32Array(rendered.getChannelData(1))];
}
function transitionWindow(seg,overlap){const w=new Float32Array(seg).fill(1);for(let i=0;i<overlap;i++){const v=i/Math.max(1,overlap);w[i]=v;w[seg-1-i]=v}return w}
async function separateVocalsDemucs(buf,onProgress=()=>{}){
  const {ort,session}=await getDemucsRuntime(onProgress);onProgress('녹음을 보컬과 반주로 분리하는 중…');
  const mix=await audioBufferToStereo44100(buf),N=343980,overlap=Math.floor(N/4),stride=N-overlap,total=mix[0].length,nChunks=Math.ceil(total/stride),outL=new Float32Array(total),outR=new Float32Array(total),weights=new Float32Array(total),win=transitionWindow(N,overlap),chunk=new Float32Array(2*N);
  for(let ci=0;ci<nChunks;ci++){
    const start=ci*stride,end=Math.min(start+N,total),clen=end-start;chunk.fill(0);chunk.subarray(0,clen).set(mix[0].subarray(start,end));chunk.subarray(N,N+clen).set(mix[1].subarray(start,end));
    onProgress(`목소리 분리 중… ${ci+1}/${nChunks}`);
    const result=await session.run({mix:new ort.Tensor('float32',chunk,[1,2,N])}),tensor=result.stems||Object.values(result)[0],data=tensor.data;
    let rowOffset=0;if(data.length>=8*N)rowOffset=6*N;else if(data.length<2*N)throw new Error('보컬 분리 모델 출력 형식을 확인하지 못했어.');
    for(let s=0;s<clen;s++){const ww=win[s];outL[start+s]+=data[rowOffset+s]*ww;outR[start+s]+=data[rowOffset+N+s]*ww;weights[start+s]+=ww}
    await new Promise(r=>setTimeout(r,0));
  }
  const mono=new Float32Array(total);for(let i=0;i<total;i++){const w=Math.max(weights[i],1e-7);mono[i]=((outL[i]/w)+(outR[i]/w))*.5}
  try{if(session.release)await session.release();demucsRuntimePromise=null}catch{}
  return {mono,sampleRate:44100};
}

let crepeRuntimePromise=null;
const CREPE_MODEL='https://huggingface.co/wok000/vcclient_modules/resolve/main/onnxcrepe/full.onnx';
function crepeBinToFreq(bin){const cents=20*bin+1997.3794084376191;return 10*Math.pow(2,cents/1200)}
async function getCrepeRuntime(onProgress=()=>{}){
  if(!crepeRuntimePromise){
    crepeRuntimePromise=(async()=>{
      onProgress('정밀 피치 신경망을 준비하는 중… 첫 실행은 추가 모델 다운로드가 필요해.');
      const ort=await import(ORT_CDN+'ort.all.min.mjs');
      try{ort.env.wasm.wasmPaths=ORT_CDN;ort.env.wasm.numThreads=(self.crossOriginIsolated?Math.min(4,navigator.hardwareConcurrency||4):1)}catch{}
      const opts={graphOptimizationLevel:'all',executionProviders:navigator.gpu?['webgpu','wasm']:['wasm']};
      let session;try{session=await ort.InferenceSession.create(CREPE_MODEL,opts)}catch(e){if(navigator.gpu)session=await ort.InferenceSession.create(CREPE_MODEL,{executionProviders:['wasm'],graphOptimizationLevel:'all'});else throw e}
      return {ort,session};
    })();
  }
  return crepeRuntimePromise;
}
async function crepeTrackSelected(mono,starts,onProgress=()=>{}){
  if(!starts.length)return new Map();
  const {ort,session}=await getCrepeRuntime(onProgress),B=192,bins=360,outMap=new Map();
  let minBin=0,maxBin=bins-1;while(minBin<bins-1&&crepeBinToFreq(minBin)<70)minBin++;while(maxBin>0&&crepeBinToFreq(maxBin)>850)maxBin--;
  for(let off=0;off<starts.length;off+=B){
    const batchStarts=starts.slice(off,off+B),data=new Float32Array(batchStarts.length*1024);
    for(let bi=0;bi<batchStarts.length;bi++){const st=batchStarts[bi],src=mono.subarray(st,Math.min(st+1024,mono.length));data.set(src,bi*1024)}
    onProgress(`신경망으로 피치를 교차검증하는 중… ${Math.min(off+B,starts.length)}/${starts.length}`);
    const res=await session.run({frames:new ort.Tensor('float32',data,[batchStarts.length,1024])}),ten=Object.values(res)[0],a=ten.data;
    if(a.length<batchStarts.length*bins)throw new Error('피치 신경망 출력 형식을 확인하지 못했어.');
    for(let bi=0;bi<batchStarts.length;bi++){
      const base=bi*bins;let best=-1,bv=-Infinity;for(let k=minBin;k<=maxBin;k++){const v=a[base+k];if(v>bv){bv=v;best=k}}
      if(best<0)continue;let lo=Math.max(minBin,best-4),hi=Math.min(maxBin,best+4),ws=0,cs=0;for(let k=lo;k<=hi;k++){const w=Math.max(0,a[base+k]);ws+=w;cs+=(20*k+1997.3794084376191)*w}
      const cents=ws>1e-7?cs/ws:(20*best+1997.3794084376191),freq=10*Math.pow(2,cents/1200),conf=clamp(Number(bv)||0,0,1);outMap.set(batchStarts[bi],{freq,midi:freqToMidi(freq),conf});
    }
    await new Promise(r=>setTimeout(r,0));
  }
  return outMap;
}

async function analyzeAudio(file,onProgress=()=>{}){
  const t0=performance.now();onProgress('음원을 읽는 중…');
  const ab=await file.arrayBuffer(),ctx=new (window.AudioContext||window.webkitAudioContext)(),buf=await ctx.decodeAudioData(ab.slice(0));
  const srcSr=buf.sampleRate,ch=buf.numberOfChannels,len=buf.length,raw=new Float32Array(len);for(let c=0;c<ch;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)raw[i]+=d[i]/ch}
  const environment=$('#env')?.value||'노래방';let sourceMono=raw,sourceSr=srcSr,separated=false;
  if(environment!=='무반주'){
    try{const stem=await separateVocalsDemucs(buf,onProgress);sourceMono=stem.mono;sourceSr=stem.sampleRate;separated=true}