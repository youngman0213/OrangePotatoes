const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const noteNames=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
function freqToMidi(f){return 69+12*Math.log2(f/440)}
function midiToNote(m){if(!Number.isFinite(m))return '-'; const n=Math.round(m);return noteNames[(n%12+12)%12]+(Math.floor(n/12)-1)}
function median(a){if(!a.length)return 0;const b=[...a].sort((x,y)=>x-y),h=Math.floor(b.length/2);return b.length%2?b[h]:(b[h-1]+b[h])/2}
function mad(a){if(!a.length)return 0;const m=median(a);return median(a.map(x=>Math.abs(x-m)))}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function fmtTime(s){s=Math.max(0,Math.round(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}
function percentile(a,p){if(!a.length)return 0;const b=[...a].sort((x,y)=>x-y),i=(b.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return lo===hi?b[lo]:b[lo]+(b[hi]-b[lo])*(i-lo)}
function centsDistance(a,b){return Math.abs(a-b)*100}
function highPass(input,sr,cut=65){const out=new Float32Array(input.length),dt=1/sr,rc=1/(2*Math.PI*cut),a=rc/(rc+dt);let py=0,px=input[0]||0;for(let i=1;i<input.length;i++){const x=input[i],y=a*(py+x-px);out[i]=y;py=y;px=x}return out}
function lowPass(input,sr,cut=1800){const out=new Float32Array(input.length),dt=1/sr,rc=1/(2*Math.PI*cut),a=dt/(rc+dt);let y=input[0]||0;for(let i=0;i<input.length;i++){y+=a*(input[i]-y);out[i]=y}return out}
function resampleLinear(input,srcSr,dstSr){if(srcSr===dstSr)return input;const n=Math.max(1,Math.floor(input.length*dstSr/srcSr)),out=new Float32Array(n),ratio=srcSr/dstSr;for(let i=0;i<n;i++){const x=i*ratio,j=Math.floor(x),f=x-j,a=input[Math.min(j,input.length-1)],b=input[Math.min(j+1,input.length-1)];out[i]=a+(b-a)*f}return out}
function weightedPercentile(items,p){if(!items.length)return 0;const xs=[...items].sort((a,b)=>a.v-b.v);let total=xs.reduce((s,x)=>s+x.w,0),target=total*p,run=0;for(const x of xs){run+=x.w;if(run>=target)return x.v}return xs.at(-1).v}

function yinCandidates(frame,sr,minF=70,maxF=850){
  const n=frame.length,maxTau=Math.min(n-3,Math.floor(sr/minF)),minTau=Math.max(2,Math.floor(sr/maxF));
  let mean=0;for(let i=0;i<n;i++)mean+=frame[i];mean/=n;
  const x=new Float32Array(n);let energy=0;for(let i=0;i<n;i++){const v=frame[i]-mean;x[i]=v;energy+=v*v}if(energy/n<8e-7)return null;
  const diff=new Float32Array(maxTau+1);
  for(let tau=1;tau<=maxTau;tau++){let sum=0;const lim=n-tau;for(let i=0;i<lim;i++){const d=x[i]-x[i+tau];sum+=d*d}diff[tau]=sum}
  const cmnd=new Float32Array(maxTau+1);cmnd[0]=1;let run=0;
  for(let tau=1;tau<=maxTau;tau++){run+=diff[tau];cmnd[tau]=run?diff[tau]*tau/run:1}
  const local=[];
  for(let t=minTau+1;t<maxTau;t++){
    if(cmnd[t]<=cmnd[t-1]&&cmnd[t]<cmnd[t+1]&&cmnd[t]<.36){
      let better=t;const s0=cmnd[t-1],s1=cmnd[t],s2=cmnd[t+1],den=2*(2*s1-s2-s0);if(Math.abs(den)>1e-9)better=t+(s2-s0)/den;
      const freq=sr/better,conf=clamp(1-cmnd[t],0,1);if(freq>=minF&&freq<=maxF){
        let divisorPenalty=0;
        for(const div of [2,3]){const td=Math.round(t/div);if(td>=minTau&&cmnd[td]<cmnd[t]+.035)divisorPenalty+=div===2?.075:.035}
        const t2=t*2;let multiplePenalty=0;if(t2<=maxTau&&cmnd[t2]+.055<cmnd[t])multiplePenalty=.045;
        local.push({freq,midi:freqToMidi(freq),conf,tau:t,divisorPenalty,multiplePenalty,cmnd:cmnd[t]});
      }
    }
  }
  if(!local.length){let bestTau=-1,best=1;for(let t=minTau;t<=maxTau;t++){if(cmnd[t]<best){best=cmnd[t];bestTau=t}}if(bestTau<0||best>.31)return null;local.push({freq:sr/bestTau,midi:freqToMidi(sr/bestTau),conf:clamp(1-best,0,1),tau:bestTau,divisorPenalty:0,multiplePenalty:0,cmnd:best})}
  local.sort((a,b)=>a.tau-b.tau);
  const firstStrong=local.find(c=>c.conf>=.80)||local[0],firstTau=firstStrong.tau;
  for(const c of local){const ratio=Math.max(1,c.tau/firstTau);c.priorPenalty=.055*Math.log2(ratio)+(c.divisorPenalty||0)+(c.multiplePenalty||0);c.quality=clamp(c.conf-c.priorPenalty,0,1)}
  local.sort((a,b)=>(b.quality-a.quality)||(a.tau-b.tau));
  const dedup=[];for(const c of local){if(!dedup.some(d=>Math.abs(d.midi-c.midi)<.30))dedup.push(c);if(dedup.length>=5)break}
  const best=dedup[0]?.quality||0,second=dedup[1]?.quality||0;
  return {candidates:dedup,bestConf:dedup[0]?.conf||0,margin:Math.max(0,best-second)};
}

function mcleodPitch(frame,sr,minF=70,maxF=850){
  const n=frame.length,maxTau=Math.min(n-3,Math.floor(sr/minF)),minTau=Math.max(2,Math.floor(sr/maxF));
  let mean=0;for(let i=0;i<n;i++)mean+=frame[i];mean/=n;
  const x=new Float32Array(n);for(let i=0;i<n;i++)x[i]=frame[i]-mean;
  const nsdf=new Float32Array(maxTau+1);let globalMax=0;
  for(let tau=minTau;tau<=maxTau;tau++){let ac=0,e1=0,e2=0,lim=n-tau;for(let i=0;i<lim;i++){const a=x[i],b=x[i+tau];ac+=a*b;e1+=a*a;e2+=b*b}const v=(e1+e2)>1e-12?2*ac/(e1+e2):0;nsdf[tau]=v;if(v>globalMax)globalMax=v}
  if(globalMax<.58)return null;
  const peaks=[];for(let t=minTau+1;t<maxTau;t++){if(nsdf[t]>nsdf[t-1]&&nsdf[t]>=nsdf[t+1]&&nsdf[t]>.55)peaks.push({t,v:nsdf[t]})}
  if(!peaks.length)return null;const cutoff=Math.max(.66,globalMax*.88);let p=peaks.find(x=>x.v>=cutoff)||peaks.reduce((a,b)=>a.v>b.v?a:b);
  let tau=p.t;if(tau>minTau&&tau<maxTau){const y0=nsdf[tau-1],y1=nsdf[tau],y2=nsdf[tau+1],den=2*(2*y1-y2-y0);if(Math.abs(den)>1e-9)tau+=(y2-y0)/den}
  const freq=sr/tau;if(freq<minF||freq>maxF)return null;return {freq,midi:freqToMidi(freq),clarity:clamp(p.v,0,1)};
}
function transitionCost(a,b){const d=Math.abs(a-b);if(d<.6)return d*.045;if(d<2)return .027+(d-.6)*.085;if(d<5)return .146+(d-2)*.105;if(d<9)return .46+(d-5)*.065;return .72+Math.min(.35,(d-9)*.035)}
function trackCandidateSegment(frames){
  if(!frames.length)return [];const costs=[],prev=[];
  for(let i=0;i<frames.length;i++){
    const cs=frames[i].candidates;costs[i]=new Array(cs.length).fill(Infinity);prev[i]=new Array(cs.length).fill(-1);
    for(let j=0;j<cs.length;j++){
      const c=cs[j],verifyBonus=(c.verify||0)*.38,emission=-Math.log(Math.max(.025,c.conf))*4.4+(c.priorPenalty||0)-verifyBonus;
      if(i===0){costs[i][j]=emission;continue}
      for(let k=0;k<frames[i-1].candidates.length;k++){const tc=transitionCost(frames[i-1].candidates[k].midi,c.midi),v=costs[i-1][k]+tc+emission;if(v<costs[i][j]){costs[i][j]=v;prev[i][j]=k}}
    }
  }
  let j=0;for(let k=1;k<costs.at(-1).length;k++)if(costs.at(-1)[k]<costs.at(-1)[j])j=k;
  const chosen=new Array(frames.length);for(let i=frames.length-1;i>=0;i--){chosen[i]=frames[i].candidates[j];j=prev[i][j];if(i>0&&j<0)j=0}
  return frames.map((f,i)=>({t:f.t,midi:chosen[i].midi,conf:chosen[i].conf,rms:f.rms,margin:f.margin,verify:chosen[i].verify||0,candidateCount:f.candidates.length}));
}
function viterbiPitchTrack(frames){if(!frames.length)return [];const out=[];let seg=[];const flush=()=>{if(seg.length)out.push(...trackCandidateSegment(seg));seg=[]};for(const f of frames){if(seg.length&&f.t-seg.at(-1).t>.38)flush();seg.push(f)}flush();return out}
function postProcessPitch(raw){
  if(!raw.length)return {points:[],octaveFixes:0,rejected:0};let octaveFixes=0,rejected=0;const pts=raw.map(p=>({...p}));
  for(let i=1;i<pts.length-1;i++){const p=pts[i],a=pts[i-1],b=pts[i+1];if(p.t-a.t>.30||b.t-p.t>.30)continue;const ab=Math.abs(a.midi-b.midi),da=p.midi-a.midi,db=p.midi-b.midi;if(ab<1.8&&Math.abs(Math.abs(da)-12)<1.15&&Math.abs(Math.abs(db)-12)<1.15){p.midi=(a.midi+b.midi)/2;octaveFixes++}}
  const clean=[];
  for(let i=0;i<pts.length;i++){
    const p=pts[i],a=pts[i-1],b=pts[i+1];
    if(a&&b&&p.t-a.t<.30&&b.t-p.t<.30){const da=Math.abs(p.midi-a.midi),db=Math.abs(p.midi-b.midi),ab=Math.abs(a.midi-b.midi);if(da>6.5&&db>6.5&&ab<1.9&&(p.conf<.91||p.verify<.45)){rejected++;continue}}
    if(p.conf<.67&&p.margin<.028&&p.verify<.6){rejected++;continue}clean.push(p)
  }
  return {points:clean,octaveFixes,rejected};
}
function smoothMidi(points,i,half=1){const vals=[];for(let j=Math.max(0,i-half);j<=Math.min(points.length-1,i+half);j++)if(Math.abs(points[j].t-points[i].t)<.22)vals.push(points[j].midi);return median(vals)}
function fitVibrato(points,center){
  if(points.length<14)return null;const dur=points.at(-1).t-points[0].t;if(dur<.60)return null;const t0=points[0].t,ys=points.map(p=>(p.midi-center)*100),spread=percentile(ys,.90)-percentile(ys,.10);if(spread<18||spread>180)return null;
  let sst=0,ym=ys.reduce((a,b)=>a+b,0)/ys.length;for(const y of ys)sst+=(y-ym)*(y-ym);if(sst<1)return null;let best=null;