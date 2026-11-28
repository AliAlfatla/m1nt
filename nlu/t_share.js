const N=require('./nlu.js');const L=N.learn;let ok=0,bad=0;
function T(n,c,x){if(c){ok++;}else{bad++;console.log('FAIL',n,x===undefined?'':JSON.stringify(x));}}
const now=Date.now();let st=N.newState();let learned=[];
// teach
let r=N.converse(st,'when i say whats cooking boss i mean the calendar',{nowMs:now,learned});
T('teach ok',r&&r.kind==='learn'&&r.learn&&r.learn.m==='cal',r);
if(r&&r.learn)learned=L.merge(learned,[r.learn]);
let r2=N.converse(N.newState(),'whats cooking boss',{nowMs:now+1000,learned});
T('use learned',r2&&r2.k==='cal',r2);
// teach a weather phrase
let r3=N.converse(N.newState(),'remember that brr check means the weather',{nowMs:now+2000,learned});
T('teach2',r3&&r3.learn&&r3.learn.m==='weather',r3);
// refuse action wording
let r4=N.converse(N.newState(),'when i say text sheri i mean the calendar',{nowMs:now,learned});
T('refuse action',r4&&r4.kind==='learn'&&!r4.learn,r4);
// refuse secret
let r5=N.converse(N.newState(),'when i say my code 123456 i mean the weather',{nowMs:now,learned});
T('refuse secret',r5&&!r5.learn,r5);
// already understood
let r6=N.converse(N.newState(),'when i say whats the weather i mean the weather',{nowMs:now,learned});
T('already',r6&&!r6.learn&&/already/.test(r6.text),r6);
// override attempt
let r7=N.converse(N.newState(),'when i say tell me a joke i mean the calendar',{nowMs:now,learned});
T('no override',r7&&!r7.learn,r7);
// learned phrase never acts: action wording containing learned key
let r8=N.converse(N.newState(),'text sheri whats cooking boss',{nowMs:now,learned});
T('no action via learned',!r8||r8.k!=='cal',r8);
// undo last
let u=N.converse(N.newState(),'forget that phrase',{nowMs:now+3000,learned});
T('undo',u&&u.unlearn&&u.unlearn.length===1,u);
let learned2=learned.map(e=>u.unlearn.includes(e.id)?Object.assign({},e,{off:1,offAt:now+3000}):e);
let r9=N.converse(N.newState(),'whats cooking boss',{nowMs:now+4000,learned:learned2});
T('stops matching',!r9||r9.k!=='cal',r9);
// stale device copy tries to resurrect: merge keeps it off
let stale=learned.slice();
let merged=L.merge(learned2,stale);
T('stale no resurrect',L.active(merged).every(e=>e.k!==learned[0].k),merged);
let merged2=L.merge(stale,learned2);
T('stale other order',L.active(merged2).every(e=>e.k!==learned[0].k),merged2);
// duplicate taught on two devices (different ids) then undo by key
const dupA=Object.assign({},learned[0]),dupB=Object.assign({},learned[0],{id:'Lzzzdup',at:learned[0].at+5});
let md=L.merge([dupA],[dupB]);T('dedupe',L.active(md).length===1,md);
let un=L.undo(md,'whats cooking boss',now+9000);T('undo by phrase',un.hit.length>=1,un);
let md2=L.merge(un.list,[dupB]);T('dup stale stays off',L.active(md2).length===0,md2);
// reteach after undo works
let again=Object.assign({},dupA,{id:'Lnew1',at:now+20000,off:0});
let md3=L.merge(un.list,[again]);T('reteach after undo',L.active(md3).length===1,md3);
// list
let lr=N.converse(N.newState(),'what have you learned',{nowMs:now,learned:learned});T('list',lr&&/learned/.test(lr.text),lr);
// undo with nothing
let un2=N.converse(N.newState(),'forget that phrase',{nowMs:now,learned:[]});T('undo nothing',un2&&!un2.unlearn,un2);
// sanitize drops bad entries
T('sanitize',L.sanitize([{id:'x',k:'my password is x',m:'cal'},{id:'y',k:'ok phrase',m:'text'},{id:'Lok',k:'fine phrase',m:'cal',st:'validated',at:1}]).length===1);
console.log('ok',ok,'bad',bad);
