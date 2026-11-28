const N=require('./nlu.js');const NOW=Date.parse('2026-11-27T23:10:00Z');let ok=0,bad=0;
function T(n,c){if(c){ok++;}else{bad++;console.log('FAIL',n);}}
const L=N.learn;
// 1. candidate from an unfamiliar status wording
let r=L.candidate('whats the haps with the shop','status:full','claude',NOW);console.log(JSON.stringify(r));
T('cand ok',r.ok||/already/.test(r.why));
// pick a wording the base does not understand
const odd='anything cooking around here';console.log('base:',JSON.stringify(N.converse(N.newState(),odd,{nowMs:NOW})));
const c=L.candidate(odd,'status:full','claude',NOW);T('odd cand',c.ok);
const v=L.autoValidate(c.cand,odd,NOW);console.log(JSON.stringify(v));T('validates',v.ok);
const learned=[Object.assign({},c.cand,{st:'validated'})];
let res=N.converse(N.newState(),odd,{nowMs:NOW,learned});console.log(JSON.stringify(res));T('used',res&&res.k==='status'&&res.topic==='full'&&res.learned);
res=N.converse(N.newState(),'hey mint anything cookin around here please',{nowMs:NOW,learned});T('variant',res&&res.k==='status');
// 2. rollback
const rb=L.rollback(learned,c.cand.id);res=N.converse(N.newState(),odd,{nowMs:NOW,learned:rb});T('rollback works',!res);
// 3. never learn actions / secrets
T('no action',!L.candidate('text marc the weather','weather','x',NOW).ok);
T('no secret',!L.candidate('my code is 123456 weather','weather','x',NOW).ok);
T('no secret2',!L.candidate('password for the weather','weather','x',NOW).ok);
T('bad meaning',!L.candidate('do the thing','refund','x',NOW).ok);
// 4. learned phrase never grants permission: a learned status phrase doesn't turn an action into local answer
const evil=[{id:'E1',k:'text marc',m:'status:full',st:'validated'}];
res=N.converse(N.newState(),'text marc',{nowMs:NOW,learned:evil});T('action stays unlocal',!res||res.k==='ask');
// 5. validation rejects an over-broad candidate
const broad=L.candidate('ok','weather','x',NOW);console.log('broad',JSON.stringify(broad));
// 6. correction capture
const st=N.newState();let got=null;
N.converse(st,'whats cooking boss',{nowMs:NOW});
N.converse(st,'no i meant the calendar',{nowMs:NOW+20000,onCandidate:(cd,q)=>{got={cd,q};}});
console.log('correction cand',JSON.stringify(got));T('correction candidate',got&&got.cd.m==='cal');
console.log('ok',ok,'bad',bad);
