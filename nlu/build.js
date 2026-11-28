require('child_process').execSync('node collide.js',{cwd:__dirname});
const fs=require('fs');
let v1=fs.readFileSync(__dirname+'/nlu.v1.bak.js','utf8');
const dev=JSON.parse(fs.readFileSync(__dirname+'/corpus/dev.json','utf8'));
const per={},reg=[];dev.singles.forEach(x=>{if(x.op!=='plain'&&x.op!=='case')return;per[x.group]=(per[x.group]||0)+1;if(per[x.group]<=5&&!/^(?:cal|weather|status_|greet|thanks|bye|joke|coin|time|date|math|units|identity)/.test(x.group)||per[x.group]<=3)reg.push({q:x.text});});
const v2=fs.readFileSync(__dirname+'/v2.part.js','utf8').replace('__COLL__',fs.readFileSync(__dirname+'/coll.txt','utf8')).replace('__REGSET__',JSON.stringify(reg));
v1=v1.replace('function intent(raw,ctx){','function intent1(raw,ctx){');
v1=v1.replace("!/^(the|my|a|an|weather|forecast|morning|afternoon|evening|night|day|week|weekend|case|general)$/.test(inPlace[1].trim())","!/\\b(the|my|a|an|weather|forecast|rain|snow|temperature|temp|morning|afternoon|evening|night|day|week|weekend|case|general|today|tomorrow|tonight|wash|washing|detail|detailing|car|cars)\\b/.test(inPlace[1].trim())");
v1=v1.replace(/var pi=intent\(p\.q,/,'var pi=intent1(p.q,');
const wrapper=`
function intent(raw,ctx){ctx=ctx||{};var st=newState();var nowMs=ctx.nowMs||Date.now();
 if(ctx.prev&&ctx.prev.q){var at=nowMs-(ctx.prev.ageMs||0);var pr=understand(ctx.prev.q,{nowMs:at},null);if(pr)pushTopic(st,ctx.prev.q,pr,at);noteAssistant(st,ctx.prev.a&&ctx.prev.a!=='x'?ctx.prev.a:'',at);if(ctx.lastWasQuestion)st.pendingQ=true;}
 else if(ctx.lastWasQuestion){st.pendingQ=true;st.lastAssistantAt=nowMs;}
 return converse(st,raw,{nowMs:nowMs,name:ctx.name,learned:ctx.learned});}
`;
const marker='var api={';
const i=v1.indexOf(marker);if(i<0)throw new Error('no api');
let head=v1.slice(0,i),tail=v1.slice(i);
tail=tail.replace(/version:1\}/,'version:2,VERSION:"v2",converse:converse,newState:newState,serialize:serialize,restore:restore,noteAssistant:noteAssistant,deriveFromChat:deriveFromChat,contextFor:contextFor,understand:understand,learn:LEARNAPI,understandClean:understandClean,_fix:fixTok,_isAction:isAction,_lite:lite,setLearn:function(l){LEARN=l;}}');
fs.writeFileSync(__dirname+'/nlu.js',head+v2+wrapper+tail);
console.log('built',(head.length+v2.length+wrapper.length+tail.length),'bytes');
