    catch(e){await ctx.close();throw new Error('정밀 보컬 분리에 실패해서 부정확한 원본 분석은 진행하지 않았어. '+(e?.message||e))}
  }
  onProgress(separated?'분리된 목소리만 정밀 분석하는 중…':'보컬 신호를 전처리하는 중…');
  const filtered=lowPass(highPass(sourceMono,sourceSr,65),sourceSr,1800),sr=16000,mono=resampleLinear(filtered,sourceSr,sr);let clipping=0,totalSamples=0;for(let i=0;i<raw.length;i+=8){if(Math.abs(raw[i])>.985)clipping++;totalSamples++}

  const frameSize=1024,hop=Math.floor(sr*.020),rmsFrames=[];for(let start=0;start+frameSize<mono.length;start+=hop){let sum=0;for(let i=0;i<frameSize;i++){const v=mono[start+i];sum+=v*v}rmsFrames.push(Math.sqrt(sum/frameSize))}
  const quiet=percentile(rmsFrames,.18),mid=median(rmsFrames),noiseFloor=Math.max(.0016,quiet*1.8,mid*.20),maxFrames=7600,stride=Math.max(1,Math.ceil(rmsFrames.length/maxFrames));
  const candidateFrames=[];let eligibleFrames=0,ambiguousRejected=0,secondaryUsed=0,secondaryAgreed=0,neuralUsed=0,neuralAgreed=0,neuralRejected=0;
  const selectedStarts=[];for(let fi=0;fi<rmsFrames.length;fi+=stride){const st=fi*hop;if(rmsFrames[fi]>=noiseFloor&&st+frameSize<mono.length)selectedStarts.push(st)}
  const neural=await crepeTrackSelected(mono,selectedStarts,onProgress);
  onProgress('세 피치 분석기의 결과를 합치는 중…');
  for(let fi=0;fi<rmsFrames.length;fi+=stride){
    const start=fi*hop,rms=rmsFrames[fi];if(rms<noiseFloor)continue;eligibleFrames++;
    const frame=mono.subarray(start,start+frameSize),yc=yinCandidates(frame,sr),cp=neural.get(start);let cs=yc?yc.candidates.filter(c=>c.midi>=38&&c.midi<=86&&c.conf>=.56):[];
    if(cp&&cp.conf>=.42){
      neuralUsed++;let nearest=-1,dist=999;for(let q=0;q<cs.length;q++){const d=Math.abs(cs[q].midi-cp.midi);if(d<dist){dist=d;nearest=q}}
      if(nearest>=0&&dist<.55){const c=cs[nearest],w1=Math.max(.1,c.conf),w2=Math.max(.1,cp.conf)*1.7;c.midi=(c.midi*w1+cp.midi*w2)/(w1+w2);c.freq=440*Math.pow(2,(c.midi-69)/12);c.conf=clamp(Math.max(c.conf,.64+.32*cp.conf),0,1);c.verify=1.35;c.quality=clamp((c.quality||c.conf)+.10+.08*cp.conf,0,1);neuralAgreed++}
      else if(cp.conf>=.58){cs.push({freq:cp.freq,midi:cp.midi,conf:clamp(.62+.35*cp.conf,0,1),tau:0,priorPenalty:0,quality:clamp(.70+.26*cp.conf,0,1),verify:1.15,neural:true})}
    }
    if(!cs.length){neuralRejected++;continue}
    cs=cs.filter(c=>c.midi>=38&&c.midi<=86);
    const sorted=[...cs].sort((a,b)=>(b.quality||b.conf)-(a.quality||a.conf)),margin=Math.max(0,(sorted[0]?.quality||0)-(sorted[1]?.quality||0));
    const octaveAmbiguous=sorted.length>1&&Math.abs(Math.abs(sorted[0].midi-sorted[1].midi)-12)<1.15&&Math.abs((sorted[0].quality||0)-(sorted[1].quality||0))<.07;
    const neuralStrong=cp&&cp.conf>=.58,neuralDisagrees=neuralStrong&&sorted.every(c=>Math.abs(c.midi-cp.midi)>.8);
    const needsSecond=(!neuralStrong&&(margin<.10||octaveAmbiguous))||neuralDisagrees;
    let mp=null;if(needsSecond){secondaryUsed++;mp=mcleodPitch(frame,sr)}
    if(mp&&mp.clarity>=.64){let bestIdx=-1,bestDist=999;for(let q=0;q<cs.length;q++){const d=Math.abs(cs[q].midi-mp.midi);if(d<bestDist){bestDist=d;bestIdx=q}}if(bestDist<.48){cs[bestIdx].verify=Math.max(cs[bestIdx].verify||0,1);cs[bestIdx].quality=clamp((cs[bestIdx].quality||cs[bestIdx].conf)+.055,0,1);secondaryAgreed++}else if(bestDist>1.1&&(!neuralStrong||Math.abs(mp.midi-cp.midi)>.8)){ambiguousRejected++;continue}}
    if(neuralStrong){let near=cs.some(c=>Math.abs(c.midi-cp.midi)<.7);if(!near&&(!mp||Math.abs(mp.midi-cp.midi)>.7)){neuralRejected++;continue}}
    cs.sort((a,b)=>(b.quality-a.quality)||(b.verify-a.verify));const finalMargin=Math.max(0,(cs[0]?.quality||0)-(cs[1]?.quality||0));
    if(octaveAmbiguous&&!neuralStrong&&(!mp||mp.clarity<.68)){ambiguousRejected++;continue}
    candidateFrames.push({t:start/sr,rms,candidates:cs.slice(0,6),margin:finalMargin,bestConf:cs[0]?.conf||0});
  }
  onProgress('시간 흐름을 따라 가장 일관된 피치를 찾는 중…');
  const tracked=viterbiPitchTrack(candidateFrames),pp=postProcessPitch(tracked),pitches=pp.points;await ctx.close();
  if(pitches.length<30)throw new Error('반주나 잡음 때문에 목소리 피치를 충분히 분리하지 못했어. 현재 버전에서는 이 녹음을 점수화하지 않는 게 안전해.');
  onProgress('음표 단위로 나눠 안정성을 확인하는 중…');
  const segments=segmentNotes(pitches),usableSegments=segments.filter(s=>s.points.length>=4&&s.end-s.start>=.16&&s.residuals.length>=3),residuals=residualsFromSegments(usableSegments),residualVals=residuals.map(x=>x.residual);
  if(residualVals.length<24||usableSegments.length<4)throw new Error('안정적으로 이어지는 음표 구간이 충분하지 않아 결과를 보류했어.');
  const rangeItems=usableSegments.filter(s=>s.weight>=.15&&median(s.points.map(p=>p.conf))>=.72).map(s=>({v:s.center,w:s.weight}));
  const low=weightedPercentile(rangeItems,.04),high=weightedPercentile(rangeItems,.96),jitter=median(residualVals),p90=percentile(residualVals,.90),pitchScore=Math.round(clamp(100-(jitter*1.42+p90*.22),20,98));
  const highCut=weightedPercentile(rangeItems,.80),highSeg=usableSegments.filter(s=>s.center>=highCut),highVals=highSeg.flatMap(s=>s.residuals),highJitter=highVals.length?median(highVals):jitter,highP90=highVals.length?percentile(highVals,.90):p90,highScore=Math.round(clamp(100-(highJitter*1.48+highP90*.24),18,98));
  const usableRate=pitches.length/Math.max(1,eligibleFrames),trackConf=median(pitches.map(x=>x.conf)),verifyRate=median(pitches.map(x=>x.verify||0)),margin=median(pitches.map(x=>x.margin||0)),neuralCoverage=neuralUsed/Math.max(1,eligibleFrames),neuralAgreement=neuralAgreed/Math.max(1,neuralUsed),correctionRate=(pp.octaveFixes+pp.rejected+ambiguousRejected)/Math.max(1,tracked.length+ambiguousRejected),clipRate=clipping/Math.max(1,totalSamples),segmentCoverage=residuals.length/Math.max(1,pitches.length);
  const internalQuality=clamp(usableRate*.13+trackConf*.20+verifyRate*.15+clamp(margin*7,0,1)*.08+segmentCoverage*.13+clamp(neuralCoverage*1.6,0,1)*.13+clamp(neuralAgreement*1.45,0,1)*.10+(1-Math.min(1,correctionRate*2.5))*.08-(clipRate>.002?.13:0),0,1);
  const validForCoaching=internalQuality>=.72&&usableRate>=.25&&segmentCoverage>=.36&&correctionRate<.26&&neuralCoverage>=.22&&(environment==='무반주'||separated);
  const buckets=[];for(let t=0;t<buf.duration;t+=5){const seg=residuals.filter(p=>p.t>=t&&p.t<t+5);if(seg.length<5)continue;const vals=seg.map(x=>x.residual);buckets.push({start:t,end:Math.min(buf.duration,t+5),instability:median(vals),p90:percentile(vals,.9),points:seg.length})}buckets.sort((a,b)=>(b.instability+b.p90*.22)-(a.instability+a.p90*.22));const issues=buckets.filter(x=>x.instability>15||x.p90>44).slice(0,4);
  return {duration:buf.duration,low,high,pitchScore,highScore,internalQuality,validForCoaching,issues,separated,debug:{usableRate,trackConf,verifyRate,margin,correctionRate,clipRate,segmentCoverage,jitter,p90,octaveFixes:pp.octaveFixes,rejectedFrames:pp.rejected,eligibleFrames,rawFrames:candidateFrames.length,segmentCount:usableSegments.length,vibratoSegments:usableSegments.filter(s=>s.vibrato).length,ambiguousRejected,secondaryUsed,secondaryAgreed,neuralUsed,neuralAgreed,neuralRejected,neuralCoverage,neuralAgreement,processingMs:performance.now()-t0}};
}
function colorScore(n){return n>=80?'good':n>=60?'warn':'bad'}
function makeCoach(r){if(!r.validForCoaching)return '이번 녹음은 반주·에코 간섭이 커서 코칭을 확정하지 않았어. 부정확한 조언을 내는 것보다 분석을 보류하는 게 맞아.';const lines=[];if(r.pitchScore<65)lines.push('일부 지속음에서 피치 유지가 흔들리는 구간이 반복돼. 아래 표시된 구간을 작은 소리로 짧게 반복해 음을 고정하는 연습부터 해보자.');else if(r.pitchScore<82)lines.push('전체적인 피치 유지력은 보통 이상이지만 몇몇 구간에서 흔들림이 커져. 아래 구간만 좁혀서 반복하는 게 효율적이야.');else lines.push('이번 녹음에서는 지속음의 피치 유지가 비교적 안정적으로 잡혔어.');if(r.highScore+9<r.pitchScore)lines.push('높은 음역에서 전체보다 안정도가 떨어지는 경향이 보여. 고음에 들어갈 때 갑자기 소리를 키우기보다 같은 크기로 진입하는 연습을 해봐.');return lines.join('<br><br>')}
function saveHistory(r){const arr=JSON.parse(localStorage.getItem('vc-history')||'[]');arr.unshift({date:new Date().toISOString(),song:$('#song').value||'제목 미입력',key:$('#key').value,env:$('#env').value,pitchScore:r.pitchScore,highScore:r.highScore,internalQuality:r.internalQuality,validForCoaching:r.validForCoaching,low:r.low,high:r.high});localStorage.setItem('vc-history',JSON.stringify(arr.slice(0,30)));renderHistory()}
function renderHistory(){const arr=JSON.parse(localStorage.getItem('vc-history')||'[]');$('#history').innerHTML=arr.length?arr.map(x=>`<div class="history-item"><b>${escapeHtml(x.song)}</b> <span class="pill">${x.key==='0'?'원키':x.key}</span><span class="pill">${escapeHtml(x.env)}</span><small>${new Date(x.date).toLocaleString('ko-KR')} · 피치 ${x.pitchScore} · 고음 ${x.highScore}</small></div>`).join(''):'<div class="sub">아직 분석 기록이 없어.</div>'}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}