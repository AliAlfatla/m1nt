const fs=require('fs'),crypto=require('crypto');
const {P,DAYS}=require('./pools.js');require('./pools_c.js');
const {X,DD1,DD2,DD3}=require('./extra.js');
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const OPS={};
const WP=['could you please ','would you mind telling me ','mint, ','hey mint, ','quick question, ','um ','so ','ok so ','uh ','like ','hey ','yo ','excuse me, ','real quick ','okay mint ','alright, ','man ','dude ','bro ','boss, ','hey mint can you tell me ','mint tell me '];
const wrapSuf=[' please',' thanks',' mint',' real quick',' for me',' when you get a chance',' pls',' tho',' fam',' bud',' ya know',' eh',' right now',' asap',' if you can',' lol',' ?'];
function typo(s,r){const w=s.split(' ');const idx=w.map((x,i)=>i).filter(i=>w[i].length>=5&&/^[a-z]+$/.test(w[i]));if(!idx.length)return s;const i=idx[Math.floor(r()*idx.length)];let x=w[i];const p=1+Math.floor(r()*(x.length-2));const m=Math.floor(r()*4);if(m===0)x=x.slice(0,p)+x[p+1]+x[p]+x.slice(p+2);else if(m===1)x=x.slice(0,p)+x.slice(p+1);else if(m===2)x=x.slice(0,p)+x[p]+x.slice(p);else x=x.slice(0,p)+'qwertyuiopasdfghjklzxcvbnm'[Math.floor(r()*26)]+x.slice(p+1);w[i]=x;return w.join(' ');}
const SLANG=[[/\btomorrow\b/g,['tmrw','tmw','2morrow','tomorow','tommorow']],[/\bwhat is\b/g,['whats',"what's",'wut is','whatis']],[/\bwhats\b/g,['wats','whatsa',"what's"]],[/\byou\b/g,['u']],[/\bplease\b/g,['pls','plz']],[/\bgoing to\b/g,['gonna']],[/\bsaturday\b/g,['sat']],[/\bsunday\b/g,['sun']],[/\bmonday\b/g,['mon']],[/\bfriday\b/g,['fri']],[/\bweather\b/g,['wx','wether','weathr']],[/\bcalendar\b/g,['cal','calender']],[/\bappointments?\b/g,['appts']],[/\bschedule\b/g,['sched','schedual']],[/\bright now\b/g,['rn']],[/\bthank you\b/g,['thank u','thankyou']],[/\bI am\b/gi,['im']],[/\bhow is\b/g,['hows']],[/\bdo i\b/g,['dI','d i']],[/\bbusiness\b/g,['biz']],[/\bnew\b/g,['nu']],[/\bwant to\b/g,['wanna']],[/\bwhat do i\b/g,['whatchu','what dyou']]];
function slang(s,r){let out=s,n=0;const order=SLANG.map((x,i)=>i).sort(()=>r()-.5);for(const i of order){const [re,alts]=SLANG[i];if(re.test(out)){re.lastIndex=0;out=out.replace(re,alts[Math.floor(r()*alts.length)]);if(++n>=2)break;}re.lastIndex=0;}return out;}
const STT=[[/\bweather\b/,['whether','weather is','the weather']],[/\btomorrow\b/,['to morrow','tomorrow is','tomorrow day']],[/\bmint\b/,['mince','mind','ment','minte','meant']],[/\bwhat's\b/,['what is']],[/\bsaturday\b/,['saturday is','satur day']],[/\bcalendar\b/,['calendar is','color dar']],[/\btext\b/,['text to','texts']],[/\bfollow ups?\b/,['follow-ups','follow up','full of ups']],[/\bleads\b/,['leeds','lead']],[/\bfifteen\b|\b15\b/,['fifty','fifteen']],[/\bhey\b/,['hay','a']],[/\bthe\b/,['uh the','the the']]];
function stt(s,r){let o=s.toLowerCase().replace(/[?.!,]/g,'');for(let k=0;k<2;k++){const [re,alts]=STT[Math.floor(r()*STT.length)];if(re.test(o)){if(/\bmint\b/.test(o)&&re.source.indexOf('mint')<0)continue;o=o.replace(re,alts[Math.floor(r()*alts.length)]);}}if(r()<.3)o=o.replace(/(\w+) (\w+)/,'$1 uh $2');return o;}
function caps(s,r){const m=Math.floor(r()*4);if(m===0)return s.toUpperCase();if(m===1)return s[0].toUpperCase()+s.slice(1);if(m===2)return s.replace(/\b\w/g,c=>c.toUpperCase());return s+(r()<.5?'?':'!!');}
const LIGHTPRE=['hey ','yo ','mint, ','hey mint, ','um ','so ','ok so ','uh ','okay mint ','alright, '];
function wrap(s,r,light){const m=r();let o=s;const wrapPre=light?LIGHTPRE:WP;if(m<.45)o=wrapPre[Math.floor(r()*wrapPre.length)]+s;else if(m<.8)o=s+wrapSuf[Math.floor(r()*wrapSuf.length)];else o=wrapPre[Math.floor(r()*wrapPre.length)]+s+wrapSuf[Math.floor(r()*wrapSuf.length)];return o;}
const OPNAMES=['plain','case','typo','slang','wrap','stt','typo+wrap','slang+wrap','stt+wrap'];
const LG=new Set(['greet','thanks','bye','identity','joke','coin']);
function applyOp(op,s,r,group){const lt=LG.has(group);
  if(op==='plain')return s;
  if(op==='case')return caps(s,r);
  if(op==='typo')return typo(s,r);
  if(op==='slang')return slang(s,r);
  if(op==='wrap')return wrap(s,r,lt);
  if(op==='stt')return stt(s,r);
  if(op==='typo+wrap')return wrap(typo(s,r),r,lt);
  if(op==='slang+wrap')return wrap(slang(s,r),r,lt);
  if(op==='stt+wrap')return wrap(stt(s,r),r,lt);
}
function build(set,seed,perBase){
  const r=rng(seed),items=[],seen=new Set();
  function add(o){const k=o.text.toLowerCase().replace(/\s+/g,' ').trim();if(seen.has(k)||!k)return;seen.add(k);o.id=set+items.length;items.push(o);}
  const pool=P[set];
  for(const g in pool){const {expect,arr}=pool[g];
    for(const base of arr){
      const slot=/\{D\}/.test(base);
      const nvar=slot?perBase*2:perBase;
      for(let v=0;v<nvar;v++){
        let t=base;if(slot)t=t.replace('{D}',DAYS[Math.floor(r()*DAYS.length)]);
        // short acks/greetings: avoid wrap that changes meaning
        let ops=OPNAMES.slice();
        const op=v===0?'plain':ops[Math.floor(r()*ops.length)];
        const text=applyOp(op,t,r,g);
        add({kind:'single',group:g,expect,text,op,base});
      }
    }
  }
  X[set].confus.forEach(([t,e])=>{[0,1,2,3].forEach(v=>{const op=['plain','case','wrap','typo'][v];add({kind:'single',group:'confusable',expect:e,text:applyOp(op,t,r),op,base:t});});});
  X[set].ask.forEach(t=>{[0,1].forEach(v=>{const op=['plain','case'][v];add({kind:'single',group:'ask',expect:'ask',text:applyOp(op,t,r),op,base:t});});});
  X[set].dial.forEach(([t,e])=>{[0,1,2,3].forEach(v=>{const op=['plain','typo','wrap','stt'][v];add({kind:'single',group:'dialect',expect:e,text:applyOp(op,t,r),op,base:t});});});
  // dialogs
  const dlg=[];
  X[set].dialogs.forEach((tpl,ti)=>{
    for(let v=0;v<8;v++){
      const slots={D1:DD1[Math.floor(r()*DD1.length)],D2:DD2[Math.floor(r()*DD2.length)],D3:DD3[Math.floor(r()*DD3.length)]};
      const op=v===0?'plain':['plain','typo','slang','wrap','stt','case'][Math.floor(r()*6)];
      const turns=tpl.map((t,i)=>{let q=t[0].replace(/\{(D\d)\}/g,(m,k)=>slots[k]);
        const o=(i===0&&op==='plain')?op:(r()<.6?op:'plain');
        return {q:applyOp(o,q,r),expect:t[1],a:t[2]||null,op:o};});
      dlg.push({id:set+'D'+dlg.length,kind:'dialog',tpl:ti,turns});
    }
  });
  return {set,seed,singles:items,dialogs:dlg};
}
const dev=build('A',1101,8),fin=build('B',7707,9);if(process.argv[2]==='d'){const X2=require('./extra.js').X;X2.D={confus:[],ask:[],dial:[],dialogs:[]};const c=build('D',4404,6);require('fs').writeFileSync('tune_d.json',JSON.stringify(c));console.log('tune_d',c.singles.length);process.exit(0);}if(process.argv[2]==='c'){const X2=require('./extra.js').X;X2.C={confus:[],ask:[],dial:[],dialogs:[]};const c=build('C',3303,8);require('fs').writeFileSync('tune_c.json',JSON.stringify(c));console.log('tune_c',c.singles.length);process.exit(0);}
const devSet=new Set(dev.singles.map(x=>x.text.toLowerCase()));const before=fin.singles.length;fin.singles=fin.singles.filter(x=>!devSet.has(x.text.toLowerCase()));console.log('removed from final (exact dup of dev):',before-fin.singles.length);
fs.writeFileSync('dev.json',JSON.stringify(dev));
fs.writeFileSync('final.json',JSON.stringify(fin));
const h=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
fs.writeFileSync('SEAL.txt','dev.json  '+h('dev.json')+'\nfinal.json '+h('final.json')+'\nfrozen '+new Date().toISOString()+'\nRule: final.json is never used to tune nlu.js. Run eval only for baseline (before) and the last post-tuning measurement.\n');
const cnt=d=>({singles:d.singles.length,dialogs:d.dialogs.length,dialogTurns:d.dialogs.reduce((a,x)=>a+x.turns.length,0)});
console.log('dev',cnt(dev),'final',cnt(fin));
