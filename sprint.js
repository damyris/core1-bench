/* Sprint setup: pure helpers for the custom sprint (question types, domain mix, time limits).
   No DOM here. The page uses window.SprintSetup; tests require() this file under Node. */
(function(){
const TYPES=["mc","multi","order","input"];
const LABEL={mc:"MC",multi:"multi",order:"ordering",input:"type-in"};

/* question selection */
const validTypes=t=>{const v=Array.isArray(t)?t.filter(x=>TYPES.includes(x)):[];return v.length?v:TYPES};
const filterByTypes=(qs,qTypes)=>{const ok=validTypes(qTypes);return qs.filter(q=>ok.includes(q.type))};
const customOf=(course,st)=>(st.mix&&st.mix[course.id])||{};
const level=(course,st,d)=>{const v=customOf(course,st)[d];return v==null?1:+v};
const allDomainsOff=(course,st)=>Object.keys(course.domains).every(d=>level(course,st,d)===0);
function effectivePreset(course,st){
  const p=st.mixPreset==="even"||st.mixPreset==="custom"?st.mixPreset:"exam";
  return p==="custom"&&allDomainsOff(course,st)?"exam":p;
}
function domainFactor(d,course,st){
  const p=effectivePreset(course,st);
  if(p==="even")return 1;
  if(p==="custom")return level(course,st,d);
  return course.domains[d]?course.domains[d].w/20:1;
}
const matchCount=(qs,course,st)=>filterByTypes(qs,st.qTypes).filter(q=>domainFactor(q.d,course,st)>0).length;
/* drill kinds a mixed sprint may generate: none from a domain the mix turns off */
const keepGen=(kinds,course,st,mixed)=>mixed?kinds.filter(s=>domainFactor(s.d,course,st)>0):kinds;
/* did the setup itself remove questions? (decides whether a short sprint blames "your setup") */
const narrowed=(course,st,mixed)=>validTypes(st.qTypes).length<TYPES.length||
  (mixed&&effectivePreset(course,st)==="custom"&&Object.keys(course.domains).some(d=>level(course,st,d)===0));
const onlyMatchText=n=>n===1?"Only 1 question matches your setup":"Only "+n+" questions match your setup";

function summaryLine(st){
  const parts=[];
  if(st.timeMode==="perQ")parts.push(st.perQSec+"s/q");
  else if(st.timeMode==="perSprint")parts.push(st.perSprintMin+" min sprint");
  if(parts.length)parts.push(st.timeStyle==="strict"?"strict":"gentle");
  const on=validTypes(st.qTypes),off=TYPES.filter(t=>!on.includes(t));
  if(off.length===1)parts.push("no "+LABEL[off[0]]);
  else if(off.length>1)parts.push(on.map(t=>LABEL[t]).join("+"));
  if(st.mixPreset==="even")parts.push("even mix");
  else if(st.mixPreset==="custom")parts.push("custom mix");
  return parts.join(" · ");
}

/* timer: a small state machine the page steps every ~100ms. Time only passes while running and visible. */
const MAX_STEP=1000;
const createTimer=({mode,style,limitMs})=>({mode,style,limitMs,usedMs:0,running:true,warned:{w30:false,w10:false},over:false,done:false});
const timerLeft=t=>t.limitMs-t.usedMs;
function timerStep(t,elapsedMs,visible){
  if(!t.running||t.done||!visible)return {t,events:[]};
  const n=Object.assign({},t,{warned:Object.assign({},t.warned),usedMs:t.usedMs+Math.max(0,Math.min(elapsedMs,MAX_STEP))});
  const left=timerLeft(n),events=[];
  if(n.limitMs>30000&&left<=30000&&!n.warned.w30){n.warned.w30=true;events.push("warn30")}
  if(n.limitMs>10000&&left<=10000&&!n.warned.w10){n.warned.w10=true;events.push("warn10")}
  if(left<=0){
    if(n.style==="gentle"&&n.mode!=="lightning"){if(!n.over){n.over=true;events.push("over")}}
    else{n.done=true;n.running=false;n.usedMs=n.limitMs;events.push("timeout")}
  }
  return {t:n,events};
}
const resetForQuestion=t=>Object.assign({},t,{usedMs:0,warned:{w30:false,w10:false},over:false,done:false,running:true});
const stopTimer=t=>Object.assign({},t,{running:false});
const resumeTimer=t=>Object.assign({},t,{running:!t.done});
function fmtClock(ms){
  const over=ms<0,s=over?Math.floor(-ms/1000):Math.ceil(ms/1000);
  return (over?"+":"")+Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
}
/* what the clock reads: Lightning counts whole seconds, strict stops at 0:00, gentle shows +m:ss over */
function clockText(t){
  const left=timerLeft(t);
  if(t.mode==="lightning")return Math.max(0,Math.ceil(left/1000))+"s";
  return fmtClock(t.style==="gentle"?left:Math.max(0,left));
}

/* bar width %, class and text; a finished strict clock is empty and still */
function timerView(t){
  const left=timerLeft(t),L=t.mode==="lightning";
  return {pct:t.over?100:Math.max(0,left)/t.limitMs*100,cls:t.over?"over":!L&&!t.done&&t.warned.w10?"warn":"",text:clockText(t)};
}
/* questions never shown when a strict sprint clock ran out; queued comebacks were already seen */
const unreachedCount=(queue,i)=>queue.slice(i).filter(x=>!x.comeback).length;
function summaryMsg({right,total,missed,fixed,unreached}){
  if(unreached>0)return total?`Time ran out after ${total} answer${total===1?"":"s"}. ${right} right.`:"Time ran out before the first answer.";
  return right===total?"Clean sweep.":fixed?`You missed ${missed} and fixed ${fixed} on the comeback.`:missed?`${missed} to review below.`:"";
}

const api={TYPES,filterByTypes,effectivePreset,domainFactor,matchCount,allDomainsOff,summaryLine,
  createTimer,timerStep,timerLeft,resetForQuestion,stopTimer,resumeTimer,fmtClock,clockText,
  keepGen,narrowed,onlyMatchText,timerView,unreachedCount,summaryMsg};
if(typeof module!=="undefined"&&module.exports)module.exports=api;else window.SprintSetup=api;
})();
