/* Labs: pure helpers for exam-style PBQ labs (buckets, config screen, diagram).
   No DOM here. The page uses window.Labs; tests require() this file under Node.
   An answer is a plain map {key: value}: buckets item index -> bucket index,
   config "row.col" -> select index / text / boolean, diagram slot index -> label index. */
(function(){
const COURSES=["core1","core2","linux"];
const KINDS=["buckets","config","diagram"];

const norm=s=>s==null?"":String(s).trim().replace(/\s+/g," ").toLowerCase();
const emptyAnswer=()=>({});
const place=(answer,key,value)=>Object.assign({},answer,{[key]:value});
function unplace(answer,key){const a=Object.assign({},answer);delete a[key];return a}
const has=(answer,key)=>answer[key]!==undefined&&answer[key]!==null;

function keysOf(part){
  if(part.kind==="buckets")return part.items.map((_,i)=>i);
  if(part.kind==="diagram")return part.slots.map((_,i)=>i);
  const keys=[];part.rows.forEach((row,r)=>row.forEach((_,c)=>keys.push(r+"."+c)));return keys;
}
const fieldAt=(part,key)=>{const [r,c]=key.split(".").map(Number);return part.rows[r][c]};
const ready=(part,answer)=>part.kind==="config"||keysOf(part).every(k=>has(answer,k));

function markFor(part,key,value){
  if(part.kind==="buckets"){const it=part.items[key];return {ok:value===it.b,correct:part.buckets[it.b],x:it.x}}
  if(part.kind==="diagram"){const s=part.slots[key];return {ok:value===s.a,correct:part.labels[s.a],x:s.why}}
  const f=fieldAt(part,key);
  if(f.type==="select")return {ok:value===f.a,correct:f.o[f.a],x:f.x};
  if(f.type==="text")return {ok:norm(value)!==""&&f.ans.some(a=>norm(a)===norm(value)),correct:f.ans[0],x:f.x};
  return {ok:!!(value===undefined?f.init:value)===f.a,correct:f.a?"on":"off",x:f.x};
}
function gradePart(part,answer){
  const marks=keysOf(part).map(key=>Object.assign({key},markFor(part,key,answer[key])));
  return {points:marks.filter(m=>m.ok).length,max:marks.length,marks};
}
function labScore(results){
  const points=results.reduce((s,r)=>s+r.points,0),max=results.reduce((s,r)=>s+r.max,0);
  return {points,max,pct:max?Math.round(points/max*100):0};
}

/* validation: every message starts with the lab id so problems are greppable */
const inRange=(i,arr)=>Number.isInteger(i)&&i>=0&&i<arr.length;
const isObj=o=>!!o&&typeof o==="object"&&!Array.isArray(o);
const nonEmpty=a=>Array.isArray(a)&&a.length>0;
function partProblems(p,diagrams){
  const out=[];
  if(!KINDS.includes(p.kind))return ["unknown kind "+JSON.stringify(p.kind)];
  if(p.kind==="buckets"){
    if(!nonEmpty(p.buckets)||!nonEmpty(p.items))return ["buckets part needs buckets and items"];
    p.items.forEach((it,i)=>{if(!isObj(it)||!it.t)out.push("item "+i+" is malformed");else if(!inRange(it.b,p.buckets))out.push("bucket index out of range on item "+i)});
  }else if(p.kind==="config"){
    if(!nonEmpty(p.rows))return ["config part needs rows"];
    p.rows.forEach((row,r)=>{if(!nonEmpty(row)){out.push("row "+r+" must be a list of fields");return}row.forEach((f,c)=>{
      const at=" at "+r+"."+c;
      if(!isObj(f)||!f.label){out.push("field is malformed"+at);return}
      if(f.type==="select"){if(!Array.isArray(f.o)||!inRange(f.a,f.o))out.push("select answer out of range"+at)}
      else if(f.type==="text"){if(!Array.isArray(f.ans)||!f.ans.length)out.push("text field has no accepted answers"+at)}
      else if(f.type==="check"){if(typeof f.a!=="boolean")out.push("check field needs a true/false answer"+at)}
      else out.push("unknown field type "+JSON.stringify(f.type)+at);
    })});
  }else{
    if(!diagrams||!Object.prototype.hasOwnProperty.call(diagrams,p.art))out.push("unknown art "+JSON.stringify(p.art));
    if(!nonEmpty(p.labels)||!nonEmpty(p.slots))return out.concat("diagram part needs labels and slots");
    p.slots.forEach((s,i)=>{if(!isObj(s)||!Number.isFinite(s.x)||!Number.isFinite(s.y))out.push("slot "+(i+1)+" is malformed");else if(!inRange(s.a,p.labels))out.push("slot "+(s.n||i+1)+" answer out of range")});
  }
  return out;
}
function validateLab(lab,diagrams){
  const id=lab&&lab.id?lab.id:"(no id)",out=[];
  if(!lab||!lab.id)out.push("missing id");
  if(!lab||!lab.title)out.push("missing title");
  if(!lab||!COURSES.includes(lab.c))out.push("unknown course "+JSON.stringify(lab&&lab.c));
  const parts=lab&&Array.isArray(lab.parts)?lab.parts:[];
  if(parts.length<1||parts.length>3)out.push("has "+parts.length+" parts, needs 1-3");
  parts.forEach((p,i)=>{
    let ps;try{ps=isObj(p)?partProblems(p,diagrams):["is malformed"]}catch(e){ps=["is malformed"]}
    ps.forEach(m=>out.push("part "+(i+1)+": "+m));
  });
  return out.map(m=>id+": "+m);
}
function validateAll(labs,diagrams){
  const valid=[],problems=[],seen=new Set();
  (labs||[]).forEach(lab=>{
    const p=validateLab(lab,diagrams);
    if(!p.length&&seen.has(lab.id))p.push(lab.id+": duplicate id");
    if(p.length){problems.push(...p);return}
    seen.add(lab.id);valid.push(lab);
  });
  return {valid,problems};
}

const api={norm,emptyAnswer,place,unplace,keysOf,ready,gradePart,labScore,validateLab,validateAll};
if(typeof module!=="undefined"&&module.exports)module.exports=api;else window.Labs=api;
})();
