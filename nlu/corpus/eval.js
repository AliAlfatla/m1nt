// usage: node eval.js dev|final [--fails N] [--json out]
const N=require('../nlu.js');const fs=require('fs');
const which=process.argv[2]||'dev';const showN=+(process.argv[process.argv.indexOf('--fails')+1]||0)||0;
const D=JSON.parse(fs.readFileSync(__dirname+'/'+which+'.json'));
const NOW=Date.parse('2026-11-27T23:10:00Z');
function cls(r){if(!r)return 'null';if(r.k==='ask')return 'ask';return r.k+(r.topic?':'+r.topic:'');}
function score(expect,got){
  if(expect==='claude')return got==='null'?'fallback_ok':'wrong';
  if(expect==='ask')return (got==='null'||got==='ask')?'fallback_ok':'wrong';
  if(got===expect)return 'correct';
  if(got==='null'||got==='ask')return 'missed';
  return 'wrong';
}
const Z=()=>({correct:0,fallback_ok:0,missed:0,wrong:0,n:0});const T={single:Z(),dialog:Z()},byGroup={},byOp={},fails=[];
function tally(bucket,key,s){const b=bucket[key]||(bucket[key]={correct:0,fallback_ok:0,missed:0,wrong:0,n:0});b[s]++;b.n++;}
function runSingle(x){
  const r=N.intent(x.text,{nowMs:NOW});const g=cls(r);const s=score(x.expect,g);
  tally(T,'single',s);tally(byGroup,x.group,s);tally(byOp,x.op,s);
  if(s==='wrong'||s==='missed')fails.push({s,text:x.text,expect:x.expect,got:g,grp:x.group});
}
function mk(){return N.newState?N.newState():{prev:null};}
function runDialog(d){
  const st=mk();let t=NOW;let ok=true;
  d.turns.forEach((tn,i)=>{
    t+=25000;
    let r;
    if(N.converse)r=N.converse(st,tn.q,{nowMs:t});
    else{const prev=st.prev?{q:st.prev.q,a:st.prev.a,ageMs:t-st.prev.t}:null;r=N.intent(tn.q,{nowMs:t,prev,lastWasQuestion:!!(st.prev&&/\?\s*$/.test(st.prev.a))});}
    const g=cls(r);const s=score(tn.expect,g);
    tally(T,'dialog',s);tally(byGroup,'dialog_t'+(i===0?'1':'2+'),s);
    if(s==='wrong'||s==='missed'){ok=false;fails.push({s,text:'['+d.id+' t'+(i+1)+'] '+tn.q,expect:tn.expect,got:g,grp:'dialog'});}
    if(!N.converse){st.prev={q:tn.q,a:(r&&r.text)||tn.a||'x',t:t};}
    if(tn.a&&N.converse&&N.noteAssistant)N.noteAssistant(st,tn.a);
  });
  d.ok=ok;
}
D.singles.forEach(runSingle);D.dialogs.forEach(runDialog);
function pct(a,b){return b?(100*a/b).toFixed(1)+'%':'-';}
function line(k,b){return k.padEnd(14)+String(b.n).padStart(5)+'  correct '+pct(b.correct,b.n).padStart(6)+'  fallback_ok '+pct(b.fallback_ok,b.n).padStart(6)+'  missed '+pct(b.missed,b.n).padStart(6)+'  WRONG '+pct(b.wrong,b.n).padStart(5)}
console.log('=== '+which+' (nlu '+(N.VERSION||'v1')+')');
for(const k of ['single','dialog'])console.log(line(k,T[k]));
const tot={correct:0,fallback_ok:0,missed:0,wrong:0,n:0};for(const k in T)for(const f in tot)tot[f]+=T[k][f];
console.log(line('ALL',tot));
const dOk=D.dialogs.filter(d=>d.ok).length;console.log('dialogs fully right:',dOk+'/'+D.dialogs.length,pct(dOk,D.dialogs.length));
// local-handled-correctly rate among items that SHOULD be local
let shouldLocal=0,gotLocal=0;for(const k in byGroup){}
if(process.argv.includes('--groups')){console.log('-- by group');Object.keys(byGroup).sort().forEach(k=>console.log(line(k,byGroup[k])));console.log('-- by operator');Object.keys(byOp).forEach(k=>console.log(line(k,byOp[k])));}
if(showN){console.log('-- sample failures');const seen={};fails.forEach(f=>{const key=f.grp+'|'+f.s;seen[key]=(seen[key]||0)+1;if(seen[key]<=showN)console.log(f.s.toUpperCase().padEnd(7),f.grp.padEnd(13),JSON.stringify(f.text),'want',f.expect,'got',f.got);});}
if(process.argv.includes('--json')){fs.writeFileSync(process.argv[process.argv.indexOf('--json')+1],JSON.stringify({which,T,byGroup,byOp,dOk,nd:D.dialogs.length}));}
