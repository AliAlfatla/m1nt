/* M1NT shared language layer (v1). Pure functions, no network, no secrets.
   Used inline by the owner-SMS scenario (F) and by the desktop/phone screen.
   Everything here is READ-ONLY or chat. It never grants access: customer texts,
   booking changes and other owner actions stay behind the code unlock elsewhere. */
(function(root){
'use strict';
var TZ='America/New_York';
var DAYS=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
var DAYS3={sun:0,mon:1,tue:2,tues:2,wed:3,weds:3,thu:4,thur:4,thurs:4,fri:5,sat:6};
var MONTHS=['january','february','march','april','may','june','july','august','september','october','november','december'];
var MON3={jan:0,feb:1,mar:2,apr:3,jun:5,jul:6,aug:7,sep:8,sept:8,oct:9,nov:10,dec:11};

/* ---------- time helpers (Eastern) ---------- */
function etParts(ms){
 var f=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false});
 var o={};f.formatToParts(new Date(ms)).forEach(function(p){o[p.type]=p.value;});
 var wd={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[o.weekday];
 return {y:+o.year,m:+o.month,d:+o.day,wd:wd,h:(+o.hour)%24,mi:+o.minute};
}
function pad(n){return (n<10?'0':'')+n;}
function ymd(y,m,d){var t=new Date(Date.UTC(y,m-1,d));return t.getUTCFullYear()+'-'+pad(t.getUTCMonth()+1)+'-'+pad(t.getUTCDate());}
function addDays(s,n){var p=s.split('-');var t=new Date(Date.UTC(+p[0],+p[1]-1,+p[2]));t.setUTCDate(t.getUTCDate()+n);return t.getUTCFullYear()+'-'+pad(t.getUTCMonth()+1)+'-'+pad(t.getUTCDate());}
function wdOf(s){var p=s.split('-');return new Date(Date.UTC(+p[0],+p[1]-1,+p[2])).getUTCDay();}
function pretty(s){var p=s.split('-');var t=new Date(Date.UTC(+p[0],+p[1]-1,+p[2],12));return t.toLocaleDateString('en-US',{timeZone:'UTC',weekday:'long',month:'long',day:'numeric'});}
function prettyShort(s){var p=s.split('-');var t=new Date(Date.UTC(+p[0],+p[1]-1,+p[2],12));return t.toLocaleDateString('en-US',{timeZone:'UTC',weekday:'short',month:'short',day:'numeric'});}
function todayStr(ms){var e=etParts(ms);return ymd(e.y,e.m,e.d);}

/* ---------- normalisation (typos, slang, shorthand, fillers, voice) ---------- */
var SLANG=[
 [/\bwhats\b|\bwhat's\b|\bwhatre\b|\bwut\b|\bwat\b|\bwhts\b/g,'what is'],
 [/\bhows\b|\bhow's\b/g,'how is'],[/\bwheres\b|\bwhere's\b/g,'where is'],[/\bwhos\b|\bwho's\b/g,'who is'],
 [/\bthats\b|\bthat's\b/g,'that is'],[/\bits\b(?=\s+(?:the|a|going|gonna|raining|snowing|cold|hot|time))/g,'it is'],
 [/\bim\b|\bi'm\b/g,'i am'],[/\bive\b|\bi've\b/g,'i have'],[/\bid\b(?=\s+like)/g,'i would'],[/\bi'd\b/g,'i would'],[/\bi'll\b|\bill\b(?=\s+(?:be|need|have|take))/g,'i will'],
 [/\bdont\b|\bdon't\b/g,'do not'],[/\bcant\b|\bcan't\b/g,'cannot'],[/\bwont\b|\bwon't\b/g,'will not'],[/\bdidnt\b|\bdidn't\b/g,'did not'],
 [/\bu\b/g,'you'],[/\bur\b/g,'your'],[/\br\b/g,'are'],[/\by\b(?=\s)/g,'why'],[/\bk\b|\bkk\b|\bkay\b|\bokay\b|\bokey\b|\bokie\b|\bokey dokey\b|\ball right\b|\balright\b|\baight\b|\bayt\b/g,'ok'],[/\bhi\b|\bhey\b|\bheyo\b/g,'hello'],
 [/\bthx\b|\bthnx\b|\bthanx\b|\btnx\b|\bty\b|\btysm\b|\bthank u\b|\bthnks\b|\bthanks a lot\b|\bthank you so much\b|\bthanks so much\b/g,'thanks'],
 [/\bpls\b|\bplz\b|\bplss\b|\bpleeease\b/g,'please'],
 [/\btmrw\b|\btmr\b|\btmw\b|\b2morrow\b|\b2mrw\b|\btomorow\b|\btommorow\b|\btommorrow\b|\btomoro\b|\btmrrw\b|\btomorrow\b/g,'tomorrow'],
 [/\btonite\b|\b2nite\b|\btonigth\b|\btonigt\b/g,'tonight'],[/\bnxt\b/g,'next'],[/\bwknd\b|\bweekend\b/g,'weekend'],
 [/\brn\b/g,'right now'],[/\bidk\b/g,'i do not know'],[/\bbtw\b/g,'by the way'],[/\bimo\b/g,'in my opinion'],
 [/\bgonna\b/g,'going to'],[/\bwanna\b/g,'want to'],[/\bgotta\b/g,'got to'],[/\blemme\b/g,'let me'],[/\bgimme\b/g,'give me'],[/\bkinda\b/g,'kind of'],[/\bya\b|\byah\b|\byeah\b|\byea\b|\byuh\b/g,'yes'],[/\bnah\b|\bnope\b|\bnaw\b/g,'no'],
 [/\by'all\b|\byall\b/g,'you all'],[/\bcal\b(?=\s|$)/g,'calendar'],[/\bcalender\b|\bcalandar\b|\bcalendr\b|\bcalender\b|\bcelendar\b/g,'calendar'],
 [/\bschedual\b|\bshedule\b|\bschedulle\b|\bschedul\b|\bsked\b/g,'schedule'],[/\bapointment\b|\bappointmnt\b|\bappt\b|\bappts\b|\bappointmet\b/g,'appointment'],
 [/\bwether\b|\bweathr\b|\bwheather\b|\bweather\b|\bwhether report\b/g,'weather'],[/\bforcast\b|\bforecast\b/g,'forecast'],
 [/\bfollowup\b|\bfollow up\b|\bfollow-up\b|\bfollowups\b|\bfollow ups\b|\bfollow-ups\b|\bfolow ups?\b|\bfollowp\b/g,'followup'],
 [/\bevrything\b|\beverthing\b|\beverythng\b/g,'everything'],[/\bwhats up\b|\bwazzup\b|\bwassup\b|\bsup\b/g,'what is up'],
 [/\bmorn\b|\bmornin\b|\bmorning\b/g,'morning'],[/\bgn\b/g,'goodnight'],[/\bgm\b/g,'good morning'],[/\bttyl\b/g,'talk to you later'],[/\bbrb\b/g,'be right back'],
 [/\bwhat day is it\b|\bwhat day it is\b|\bwhat day today\b/g,'what day is today'],
 [/\bimma\b|\bimna\b/g,'i am going to'],[/\bholla\b|\bhiya\b|\bhii+\b|\bheyy+\b|\bheya\b|\bhey there\b|\bhowdy\b|\bhullo\b|\bhellooo*\b|\byo\b/g,'hello'],
 [/\bm1nt\b|\bm 1 n t\b|\bmints\b/g,'mint']
];
var FILL=/\b(um+|uh+|uhh+|er+|erm|hmm+|mm+|ah+|oh|like|you know|i mean|sort of|kind of|basically|actually|literally|honestly|just|really|so|well|anyway|anyways|ok so|okay so|alright so|right so|hey mint|hello mint|mint|please|real quick|quick|quickly|for me|for us|if you can|if you could|if possible|when you get a chance|real fast|by the way|one sec|hold on|let me see|let me think|ok|okay|alright|right|yes|hello|hey|hi)\b/g;
var ONES={zero:0,oh:0,one:1,two:2,to:2,too:2,three:3,four:4,for:4,fore:4,five:5,six:6,seven:7,eight:8,ate:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19};
var TENS={twenty:20,thirty:30,forty:40,fourty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
function words2num(s){
 /* turns "twenty five" -> 25, "a hundred and ten" -> 110, "three point five" -> 3.5, keeps digits */
 var t=s.split(/\s+/),out=[],i=0;
 function isNum(w){return ONES.hasOwnProperty(w)&&w!=='to'&&w!=='too'&&w!=='for'&&w!=='fore'&&w!=='oh'&&w!=='ate'||TENS.hasOwnProperty(w)||w==='hundred'||w==='thousand'||w==='million'||w==='half';}
 while(i<t.length){
  var w=t[i];
  if(!isNum(w)&&!(w==='a'&&(t[i+1]==='hundred'||t[i+1]==='thousand'||t[i+1]==='million'))){out.push(w);i++;continue;}
  var total=0,cur=0,used=0,j=i,any=false;
  while(j<t.length){
   var x=t[j];
   if(x==='a'&&(t[j+1]==='hundred'||t[j+1]==='thousand'||t[j+1]==='million')){cur=cur||1;j++;continue;}
   if(x==='and'&&any&&j+1<t.length&&(ONES.hasOwnProperty(t[j+1])||TENS.hasOwnProperty(t[j+1])))  {j++;continue;}
   if(ONES.hasOwnProperty(x)&&x!=='to'&&x!=='too'&&x!=='for'&&x!=='fore'&&x!=='oh'&&x!=='ate'){cur+=ONES[x];any=true;j++;continue;}
   if(TENS.hasOwnProperty(x)){cur+=TENS[x];any=true;j++;continue;}
   if(x==='hundred'){cur=(cur||1)*100;any=true;j++;continue;}
   if(x==='thousand'){total+=(cur||1)*1000;cur=0;any=true;j++;continue;}
   if(x==='million'){total+=(cur||1)*1000000;cur=0;any=true;j++;continue;}
   break;
  }
  if(!any){out.push(w);i++;continue;}
  var val=total+cur;
  if(t[j]==='point'){var dg='';var k=j+1;while(k<t.length&&ONES.hasOwnProperty(t[k])&&ONES[t[k]]<10&&t[k]!=='to'&&t[k]!=='for'){dg+=ONES[t[k]];k++;}if(dg){val=val+'.'+dg;j=k;}}
  out.push(String(val));i=j;
 }
 return out.join(' ');
}
function norm(q){
 var x=String(q||'').toLowerCase().replace(/[\u2018\u2019`]/g,"'").replace(/[\u201c\u201d]/g,'"');
 x=x.replace(/(\d),(\d{3})\b/g,'$1$2');
 x=x.replace(/(\d)\.(\d)/g,'$1\u0001$2');
 x=x.replace(/[\u00d7\u2715\u2716*]/g,' times ').replace(/\u00f7/g,' divided by ').replace(/\^/g,' to the power of ');
 x=x.replace(/(\d)\s*%/g,'$1 percent ').replace(/(\d)\s*x\s*(?=\d)/g,'$1 times ');
 x=x.replace(/(\d)\s*\+\s*(?=\d)/g,'$1 plus ').replace(/(\d)\s*[-\u2212\u2013]\s*(?=\d)/g,'$1 minus ').replace(/(\d)\s*\/\s*(?=\d)(?!\d*\s*(?:am|pm))/g,'$1 divided by ');
 x=x.replace(/[^a-z0-9'\u0001:$ ]+/g,' ').replace(/\u0001/g,'.').replace(/\s+/g,' ').trim();
 SLANG.forEach(function(r){x=x.replace(r[0],r[1]);});
 x=x.replace(/'/g,'');
 x=words2num(x);
 return x.replace(/\s+/g,' ').trim();
}
function core(q){ /* normalised + fillers removed, for matching */
 var x=norm(q);
 var y=x.replace(FILL,' ').replace(/\s+/g,' ').trim();
 return y||x;
}

function nthWd(y,mo,wd,nth){var d=new Date(Date.UTC(y,mo-1,1));var off=(wd-d.getUTCDay()+7)%7;return ymd(y,mo,1+off+7*(nth-1));}
function holiday(nm,y){
 if(/christmas eve/.test(nm))return ymd(y,12,24);if(/christmas|xmas/.test(nm))return ymd(y,12,25);if(/new year/.test(nm))return ymd(y+1,1,1);if(/thanksgiving/.test(nm))return nthWd(y,11,4,4);if(/halloween/.test(nm))return ymd(y,10,31);if(/valentine/.test(nm))return ymd(y,2,14);if(/fourth of july|july 4th|independence/.test(nm))return ymd(y,7,4);if(/labor day/.test(nm))return nthWd(y,9,1,1);if(/memorial day/.test(nm)){var l=new Date(Date.UTC(y,5,0));var back=(l.getUTCDay()+6)%7;return ymd(y,5,31-back);}if(/mlk|martin luther king/.test(nm))return nthWd(y,1,1,3);if(/presidents day/.test(nm))return nthWd(y,2,1,3);if(/black friday/.test(nm))return addDays(nthWd(y,11,4,4),1);
 return null;}
/* ---------- date phrases ---------- */
function monthIdx(w){w=w.slice(0,9);for(var i=0;i<12;i++){if(MONTHS[i]===w||MONTHS[i].slice(0,3)===w.slice(0,3)&&w.length>=3&&MONTHS[i].indexOf(w)===0)return i;}return MON3.hasOwnProperty(w)?MON3[w]:-1;}
function resolveDate(s,nowMs){
 /* returns {start,end,label,single} or null. s is normalised text. */
 var now=etParts(nowMs),today=ymd(now.y,now.m,now.d),m;
 var hm=s.match(/\b(christmas eve|christmas|xmas|new years?(?: day)?|thanksgiving|halloween|valentines?(?: day)?|fourth of july|july 4th|independence day|labor day|memorial day|mlk day|presidents day|black friday)\b/);
 if(hm){var hy=now.y,hd=holiday(hm[1],hy);if(hd&&hd<today)hd=holiday(hm[1],hy+1);if(hd)return {start:hd,end:hd,single:true};}
 if(/\bday after tomorrow\b|\bovermorrow\b/.test(s)){var d=addDays(today,2);return {start:d,end:d,single:true};}
 if(/\btomorrow\b/.test(s)&&!/\btomorrow night\b.*\btomorrow\b/.test(s)){var d1=addDays(today,1);return {start:d1,end:d1,single:true,night:/\bnight\b|\bevening\b/.test(s)};}
 if(/\btonight\b|\bthis evening\b|\bthis afternoon\b|\bthis morning\b|\btoday\b|\bright now\b|\bcurrently\b|\bnow\b/.test(s)&&!/\bnext\b/.test(s)){return {start:today,end:today,single:true,night:/\btonight\b|\bevening\b/.test(s)};}
 if(/\byesterday\b/.test(s)){var y=addDays(today,-1);return {start:y,end:y,single:true,past:true};}
 if(/\bthis weekend\b|\bover the weekend\b|\bweekend\b/.test(s)){var wd=wdOf(today);var sat=wd===0?addDays(today,-1):addDays(today,(6-wd+7)%7);if(wd===0)sat=addDays(today,-1);return {start:sat<today?today:sat,end:addDays(sat,1),single:false};}
 if(/\bnext week\b/.test(s)){var wdn=wdOf(today);var mon=addDays(today,((8-wdn)%7)||7);return {start:mon,end:addDays(mon,6),single:false};}
 if(/\bthis week\b|\bthe week\b|\bfor the week\b|\brest of the week\b/.test(s)){var wdt=wdOf(today);var sun=addDays(today,(7-wdt)%7);return {start:today,end:sun,single:false};}
 if(/\bnext month\b/.test(s)){var nm=now.m%12+1,ny=now.m===12?now.y+1:now.y;return {start:ymd(ny,nm,1),end:addDays(ymd(nm===12?ny+1:ny,nm===12?1:nm+1,1),-1),single:false};}
 if(/\bin (\d+) days?\b/.test(s)){m=s.match(/\bin (\d+) days?\b/);var dd=addDays(today,+m[1]);return {start:dd,end:dd,single:true};}
 /* weekday names */
 var wdm=s.match(/\b(?:(this|next|coming|on)\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tues?|wed|weds|thurs?|thu|fri|sat)\b/);
 if(wdm){var idx=DAYS.indexOf(wdm[2]);if(idx<0)idx=DAYS3[wdm[2]];if(idx!==undefined&&idx>=0){var cur=wdOf(today);var delta=(idx-cur+7)%7;if(wdm[1]==='next'&&delta<=0)delta+=7;else if(wdm[1]==='next'&&delta>0&&idx>cur&&false)delta+=7;var dt=addDays(today,delta);return {start:dt,end:dt,single:true,night:/\bnight\b|\bevening\b/.test(s)};}}
 /* month + day */
 var md=s.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept?|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?\b/);
 var dm=s.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept?|oct|nov|dec)\b/);
 var mm=md||null,day,mon;
 if(md){mon=monthIdx(md[1]);day=+md[2];}else if(dm){mon=monthIdx(dm[2]);day=+dm[1];}
 if(mon!==undefined&&mon>=0&&day>=1&&day<=31){var yr=now.y;var cand=ymd(yr,mon+1,day);if(cand<today)cand=ymd(yr+1,mon+1,day);return {start:cand,end:cand,single:true};}
 var sl=s.match(/\b(\d{1,2})\s*(?:\/)\s*(\d{1,2})\b/)||s.match(/\b(\d{1,2}) (?:slash) (\d{1,2})\b/);
 if(sl&&+sl[1]>=1&&+sl[1]<=12&&+sl[2]>=1&&+sl[2]<=31){var c2=ymd(now.y,+sl[1],+sl[2]);if(c2<today)c2=ymd(now.y+1,+sl[1],+sl[2]);return {start:c2,end:c2,single:true};}
 var th=s.match(/\bthe (\d{1,2})(?:st|nd|rd|th)\b/);
 if(th&&+th[1]>=1&&+th[1]<=31){var c3=ymd(now.y,now.m,+th[1]);if(c3<today){var nm2=now.m===12?1:now.m+1;c3=ymd(now.m===12?now.y+1:now.y,nm2,+th[1]);}return {start:c3,end:c3,single:true};}
 return null;
}

/* ---------- math ---------- */
function fmtNum(n){
 if(!isFinite(n))return null;
 var r=Math.round(n*1e9)/1e9;
 var s=Math.abs(r)>=1e15?r.toExponential(6):String(r);
 if(Math.abs(r)>=1000&&Math.abs(r)<1e15&&/^-?\d+(\.\d+)?$/.test(s)){var p=s.split('.');p[0]=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,',');s=p.join('.');}
 return s;
}
function evalExpr(str){
 /* tiny safe parser: numbers, + - * / ^ ( ) and unary minus. returns number or null */
 var t=[],re=/\s*(\d+(?:\.\d+)?|\*\*|[+\-*\/^()%])/y,i=0,m;
 str=str.replace(/\s+/g,'');
 var pos=0;
 while(pos<str.length){var mm=/^(\d+(?:\.\d+)?|\*\*|[+\-*\/^()])/.exec(str.slice(pos));if(!mm)return null;t.push(mm[1]==='**'?'^':mm[1]);pos+=mm[1].length;}
 var k=0;
 function peek(){return t[k];}
 function next(){return t[k++];}
 function prim(){var x=next();if(x===undefined)throw 0;if(x==='('){var v=add();if(next()!==')')throw 0;return v;}if(x==='-')return -pow();if(x==='+')return pow();if(/^\d/.test(x))return parseFloat(x);throw 0;}
 function pow(){var b=prim();if(peek()==='^'){next();var e=pow();return Math.pow(b,e);}return b;}
 function mul(){var v=pow();while(peek()==='*'||peek()==='/'){var o=next();var r=pow();if(o==='/'){if(r===0)throw 1;v=v/r;}else v=v*r;}return v;}
 function add(){var v=mul();while(peek()==='+'||peek()==='-'){var o=next();var r=mul();v=o==='+'?v+r:v-r;}return v;}
 try{var v=add();if(k!==t.length)return null;return v;}catch(e){return e===1?'div0':null;}
}
function mathAnswer(q){
 var s=core(q).replace(/\b(bucks?|dollars?|usd|bux)\b/g,' ').replace(/\b(what is|calculate|calc|compute|how much is|how many is|figure out|work out|solve|equals?|is equal to|answer|the answer to|do the math|math)\b/g,' ').replace(/\s+/g,' ').trim();
 s=s.replace(/\bhow much (?:is|are)\b/g,' ').replace(/\bto the power of\b/g,' pow ').replace(/\bthe\b/g,' ').replace(/\s+/g,' ').trim();
 var m;
 if((m=s.match(/^(\d+(?:\.\d+)?) (?:minus|less|take away|take off|knock off|subtract) (\d+(?:\.\d+)?) percent$/))){return {text:fmtNum(+m[1]-+m[1]*+m[2]/100)};}
 if((m=s.match(/^(\d+(?:\.\d+)?) (?:plus|add|and|with) (\d+(?:\.\d+)?) percent$/))){return {text:fmtNum(+m[1]+ +m[1]*+m[2]/100)};}
 /* percent forms */
 if((m=s.match(/^(\d+(?:\.\d+)?) percent (?:tip|gratuity) (?:on|of|for) \$?(\d+(?:\.\d+)?)$/))||(m=s.match(/^(?:tip|gratuity) (?:of |at )?(\d+(?:\.\d+)?) percent (?:on|of|for) \$?(\d+(?:\.\d+)?)$/))){var tip=+m[1]*+m[2]/100;return {text:fmtNum(tip)+' tip, '+fmtNum(+m[2]+tip)+' total'};}
 if((m=s.match(/^(\d+(?:\.\d+)?) percent of \$?(\d+(?:\.\d+)?)$/))){return {text:fmtNum(+m[1]*+m[2]/100)};}
 if((m=s.match(/^\$?(\d+(?:\.\d+)?) (?:with|at|less|minus|take away|after) (\d+(?:\.\d+)?) percent (?:off|discount)$/))){return {text:fmtNum(+m[1]-+m[1]*+m[2]/100)+' after '+fmtNum(+m[2])+' percent off'};}
 if((m=s.match(/^(\d+(?:\.\d+)?) percent off (?:of )?\$?(\d+(?:\.\d+)?)$/))){return {text:fmtNum(+m[2]-+m[2]*+m[1]/100)+' after '+fmtNum(+m[1])+' percent off'};}
 if((m=s.match(/^(?:split|divide) \$?(\d+(?:\.\d+)?) (?:between|among|by|into|for|with)? ?(\d+) (?:ways|people|persons|folks|guys)?$/))&&+m[2]>0){return {text:fmtNum(+m[1]/+m[2])+' each'};}
 if((m=s.match(/^(?:square root|sqrt) (?:of )?(\d+(?:\.\d+)?)$/))){return {text:fmtNum(Math.sqrt(+m[1]))};}
 if((m=s.match(/^(\d+(?:\.\d+)?) (?:squared|pow 2)$/))){return {text:fmtNum(+m[1]*+m[1])};}
 if((m=s.match(/^(\d+(?:\.\d+)?) cubed$/))){return {text:fmtNum(Math.pow(+m[1],3))};}
 if((m=s.match(/^(\d+(?:\.\d+)?) (?:is )?what percent of (\d+(?:\.\d+)?)$/))&&+m[2]>0){return {text:fmtNum(+m[1]/+m[2]*100)+' percent'};}
 if((m=s.match(/^(\d+(?:\.\d+)?) percent (?:more than|over|above|plus|added to|on top of) \$?(\d+(?:\.\d+)?)$/))){return {text:fmtNum(+m[2]*(1+ +m[1]/100))};}
 /* operator words -> symbols */
 var e=s.replace(/\bmultiplied by\b|\btimes\b|\binto\b|\bx\b/g,'*').replace(/\bdivided by\b|\bover\b|\bdivide by\b|\bsplit by\b/g,'/').replace(/\bplus\b|\band\b(?=\s*\d)|\badd(?:ed)? to\b|\bpositive\b/g,'+').replace(/\bminus\b|\bless\b|\btake away\b|\bsubtract\b/g,'-').replace(/\bpow\b/g,'^').replace(/\bpercent of\b/g,'*0.01*').replace(/\bfor the\b/g,' ').replace(/\$/g,'');
 if(!/\d/.test(e)||!/[+\-*\/^]/.test(e))return null;
 if(/[a-z]/.test(e.replace(/\s/g,'')))return null;
 var v=evalExpr(e);
 if(v==='div0')return {text:"Can't divide by zero"};
 if(v===null||v===undefined)return null;
 var f=fmtNum(v);return f===null?null:{text:f};
}

/* ---------- units ---------- */
var UNITS=[
 {a:/^(?:f|fahrenheit|degrees f)$/,b:/^(?:c|celsius|centigrade|degrees c)$/,fn:function(x){return (x-32)*5/9;},ta:'F',tb:'C'},
 {a:/^(?:c|celsius|centigrade|degrees c)$/,b:/^(?:f|fahrenheit|degrees f)$/,fn:function(x){return x*9/5+32;},ta:'C',tb:'F'},
 {a:/^(?:mi|mile|miles)$/,b:/^(?:km|kilometers?|kilometres?|ks)$/,fn:function(x){return x*1.609344;},ta:'mi',tb:'km'},
 {a:/^(?:km|kilometers?|kilometres?)$/,b:/^(?:mi|miles?)$/,fn:function(x){return x/1.609344;},ta:'km',tb:'mi'},
 {a:/^(?:lb|lbs|pounds?)$/,b:/^(?:kg|kilos?|kilograms?)$/,fn:function(x){return x*0.45359237;},ta:'lb',tb:'kg'},
 {a:/^(?:kg|kilos?|kilograms?)$/,b:/^(?:lb|lbs|pounds?)$/,fn:function(x){return x/0.45359237;},ta:'kg',tb:'lb'},
 {a:/^(?:oz|ounces?)$/,b:/^(?:g|grams?)$/,fn:function(x){return x*28.349523;},ta:'oz',tb:'g'},
 {a:/^(?:g|grams?)$/,b:/^(?:oz|ounces?)$/,fn:function(x){return x/28.349523;},ta:'g',tb:'oz'},
 {a:/^(?:gal|gallons?)$/,b:/^(?:l|liters?|litres?)$/,fn:function(x){return x*3.785411784;},ta:'gal',tb:'L'},
 {a:/^(?:l|liters?|litres?)$/,b:/^(?:gal|gallons?)$/,fn:function(x){return x/3.785411784;},ta:'L',tb:'gal'},
 {a:/^(?:in|inch|inches)$/,b:/^(?:cm|centimeters?|centimetres?)$/,fn:function(x){return x*2.54;},ta:'in',tb:'cm'},
 {a:/^(?:cm|centimeters?|centimetres?)$/,b:/^(?:in|inch|inches)$/,fn:function(x){return x/2.54;},ta:'cm',tb:'in'},
 {a:/^(?:ft|foot|feet)$/,b:/^(?:m|meters?|metres?)$/,fn:function(x){return x*0.3048;},ta:'ft',tb:'m'},
 {a:/^(?:m|meters?|metres?)$/,b:/^(?:ft|foot|feet)$/,fn:function(x){return x/0.3048;},ta:'m',tb:'ft'},
 {a:/^(?:oz|fluid ounces?|fl oz)$/,b:/^(?:ml|milliliters?|millilitres?)$/,fn:function(x){return x*29.5735;},ta:'oz',tb:'mL'},
 {a:/^(?:ml|milliliters?|millilitres?)$/,b:/^(?:oz|fluid ounces?)$/,fn:function(x){return x/29.5735;},ta:'mL',tb:'oz'},
 {a:/^(?:mph|miles per hour)$/,b:/^(?:kph|kmh|km per hour|kilometers per hour)$/,fn:function(x){return x*1.609344;},ta:'mph',tb:'km/h'},
 {a:/^(?:cups?)$/,b:/^(?:oz|ounces?|fluid ounces?)$/,fn:function(x){return x*8;},ta:'cup',tb:'oz'},
 {a:/^(?:tbsp|tablespoons?)$/,b:/^(?:tsp|teaspoons?)$/,fn:function(x){return x*3;},ta:'tbsp',tb:'tsp'},
 {a:/^(?:qt|quarts?)$/,b:/^(?:oz|ounces?|fluid ounces?)$/,fn:function(x){return x*32;},ta:'qt',tb:'oz'},
 {a:/^(?:gal|gallons?)$/,b:/^(?:oz|ounces?|fluid ounces?)$/,fn:function(x){return x*128;},ta:'gal',tb:'oz'}
];
function unitAnswer(q){
 var s=core(q).replace(/\b(what is|convert|how many|how much is|how much|in|equals?)\b/g,function(w){return w==='in'?' in ':' ';}).replace(/\s+/g,' ').trim();
 var m=s.match(/^(\d+(?:\.\d+)?)\s*(?:degrees? )?([a-z ]+?)\s+(?:to|in|into|as)\s+(?:degrees? )?([a-z ]+)$/);
 if(!m){m=s.match(/^(\d+(?:\.\d+)?)\s*(?:degrees? )?([a-z ]+?)\s+(?:is|are)\s+(?:how many|what)\s+([a-z ]+)$/);}
 if(!m)return null;
 var val=+m[1],from=m[2].trim(),to=m[3].trim();
 for(var i=0;i<UNITS.length;i++){var u=UNITS[i];if(u.a.test(from)&&u.b.test(to)){var r=u.fn(val);return {text:fmtNum(Math.round(r*100)/100)+' '+u.tb};}}
 return null;
}

/* ---------- small talk ---------- */
var JOKES=[
 'Why did the detailer bring a ladder to the car wash? To reach the high-level shine.',
 'I told my microfiber towel a secret. It soaked it right up.',
 'Why don\'t clay bars ever get invited to parties? They always pull things out of people.',
 'What do you call a car that never gets dirty? A myth.',
 'My pressure washer and I have a great relationship. There is a lot of pressure, but we get through it.',
 'Why did the wax go to therapy? It had too many layers to work through.',
 'I would tell you a ceramic coating joke, but it takes 24 hours to cure.',
 'What is a detailer\'s favorite kind of music? Anything with a good buff.',
 'Why was the foam cannon so confident? It always knew how to make an entrance.',
 'How do you know a detailer is happy? They are always beaming, mostly from the reflection.'
];
var FACTS=[
 'Quick one: Dawn soap strips wax, so keep it away from paint you want to protect.',
 'Tip: always wash wheels first so brake dust does not get splashed onto a clean car.',
 'Fun fact: a clay bar removes bonded contamination that washing alone will not touch.'
];
function pick(arr,seed){var h=0,s=String(seed||'');for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return arr[h%arr.length];}
function dayPart(nowMs){var h=etParts(nowMs).h;return h<5?'night':h<12?'morning':h<17?'afternoon':'evening';}

/* ---------- status topics ---------- */
var STATUS_TOPICS=[
 ['full',/\b(on fire|fire drill|what am i missing|am i missing|word on the business|word on the shop|how we looking|how are we looking|how is it looking|hit me with the rundown|bring me up to speed|up to speed|anything for me|what have i missed|what did i miss|everything|rundown|run down|status|report|overview|big picture|state of (?:things|the business)|what needs me|what needs to be done|anything (?:i )?need to|what do i need to (?:do|handle|know)|what should i (?:do|handle)|what is (?:going on|happening|new)(?: with)? (?:the )?(?:business|mint|shop|today)?|how is (?:the )?(?:business|mint|shop|day)|how are we doing|how is it (?:looking|going)|anything (?:going on|wrong|urgent|new)|fires|issues|problems|catch me up|brief me|summary)\b/],
 ['followups',/\b(who should i (?:hit up|reach out to|ping|check in with|circle back with)|who to (?:hit up|follow up with|ping)|who do i (?:hit up|ping)|followup|owed a text|who (?:do i|should i|needs? to be) (?:text|follow|call|reach)|who is due|due today|overdue|who haven t i|going cold|gone cold|nudge)\b/],
 ['leads',/\b(anybody waiting|anyone waiting|anybody (?:reply|replied|text|texted)|anyone (?:reply|replied|text|texted)|any (?:replies|responses)|who replied|who responded|leads?|prospects?|handoffs?|who is waiting|waiting on me|waiting for me|needs me|who texted|who messaged|pipeline|quotes? out|open quotes?|hot leads?|new leads?)\b/],
 ['jobs',/\b(how many (?:jobs|cars|details|appointments|bookings)|jobs?|bookings?|booked|deposits?|who is booked|who do i have|payments? status|paid|unpaid|owe|owes|balance|schedule for the shop|how many (?:jobs|cars|details))\b/],
 ['health',/\b(did anything break|anything break|anything broken|anything down|everything running|everything working|running right|running ok|system|workflows?|scenarios?|automations?|make|errors?|fail|fails|failed|failing|failures?|broken|crash|crashed|down|working ok|running ok|is everything running|health|uptime|are you (?:ok|working|up|running)|you alive|you up|you there)\b/],
 ['recovery',/\b(recover|recovered|retry|retries|fixed itself|self heal)\b/],
 ['inventory',/\b(inventory|supplies|stock|running low|low on|out of|reorder|need to order|chemicals|towels)\b/]
];
var STATUS_ASK=/\b(how|what|who|which|any|anything|show|give|tell|check|list|status|report|update|where|did|is|are|do|does|have|has|got|need|am i|should)\b/;
var PRONOUN=/\b(it|that|this|he|she|they|them|him|her|his|hers|those|these|there|the same|that one|this one|the last one|what about|and then|also)\b/;
/* a status question is only handled locally when it is self-contained */
function statusIntent(c,raw){
 if(/\b(why|explain|draft|write|compose|should i|should we|recommend|suggest|advice|opinion|think about|what do you think|how do i|how should|help me (?:write|decide|figure)|what did|what does|when did|did she|did he|did they)\b/.test(c))return null;
 if(!STATUS_ASK.test(c)&&c.split(' ').length>3)return null;
 if(/\b(running|working|broke|broken|break|down|failing|fail|failed|crash)\b/.test(c)&&/\b(everything|anything|system|workflows?|you)\b/.test(c)&&!/\b(business|leads|jobs)\b/.test(c)){return {k:'status',topic:'health',fresh:'',focus:String(raw||c).slice(0,200)};}
 for(var i=0;i<STATUS_TOPICS.length;i++){
  if(STATUS_TOPICS[i][1].test(c)){
   var ws=c.split(' ').length;
   if(PRONOUN.test(c)&&!/\b(what is going on|what is happening)\b/.test(c)&&ws<7&&STATUS_TOPICS[i][0]!=='full')return null;
   return {k:'status',topic:STATUS_TOPICS[i][0],fresh:/\b(right now|check again|refresh|live|latest|again)\b/.test(c)?'true':'',focus:String(raw||c).slice(0,200)};
  }
 }
 return null;
}

/* ---------- calendar + weather intents ---------- */
var CAL_WORDS=/\b(calendar|what do i got going on|what is going on (?:on|this|next|for)|going on (?:on|this|next|for)|anything scheduled|scheduled for|what is on deck|on deck|is (?:today|tomorrow|tonight|saturday|sunday|monday|tuesday|wednesday|thursday|friday|this weekend) (?:open|free|clear|busy|booked)|schedule|agenda|appointments?|what do i have|what have i got|what is on|what is happening|anything on|am i free|am i busy|do i have anything|am i booked|what is my day|what is my week|my day|my week|plans|free time|open slot|open spot|open day|availability|available)\b/;
var CAL_ACTION=/\b(add|put|schedule (?:a|an|my|the|me)|set up|book|create|make|move|push|resched|cancel|delete|remove|change|text|tell|remind|remember|forget|save|note)\b/;
function calIntent(c,nowMs,raw){
 if(!CAL_WORDS.test(c))return null;
 if(CAL_ACTION.test(c)&&!/\bwhat\b|\bshow\b|\bany\b|\bam i\b|\bdo i have\b/.test(c))return null;
 if(/\b(customers?|clients?|jobs?|details?|deposits?|booked jobs|bookings?)\b/.test(c)&&!/\bcalendar\b/.test(c))return null;
 var d=resolveDate(c,nowMs);
 if(!d)d=/\b(calendar|schedule|agenda|what do i have|what is my day|my day)\b/.test(c)&&!/\bnext\b/.test(c)?{start:todayStr(nowMs),end:todayStr(nowMs),single:true}:null;
 if(!d)return null;
 return {k:'cal',start:d.start,end:d.end,single:!!d.single,free:/\b(free|busy|open|available|availability|slot|spot)\b/.test(c)};
}
var WX_WORDS=/\bis it (?:going to be |gonna be |still |getting |supposed to be )?(?:cold|hot|warm|chilly|cool|freezing|nice|windy|rainy|snowy|sunny|cloudy|icy|humid)\b|\b(weather|forecast|temperature|temp|degrees|how (?:hot|cold|warm|chilly|cool) (?:is|will|does)|rain(?:ing|y)?|snow(?:ing|y)?|storm(?:s|y)?|thunder|windy|wind|umbrella|jacket|coat|sunny|cloudy|humid|humidity|freezing|frost|ice|icy|hot out|cold out|warm out|cool out|nice out|bad out|outside)\b/;
function wxIntent(c,nowMs){
 if(!WX_WORDS.test(c))return null;
 if(/\b(add|put|schedule|text|remind|cancel|move)\b/.test(c)&&!/\b(weather|forecast|rain|snow)\b/.test(c))return null;
 if(/\b(wash|detail|coat|ice cream|cold call|hot lead|cold lead|warm lead)\b/.test(c)&&!/\b(weather|forecast|temperature|rain|snow|outside)\b/.test(c))return null;
 var inPlace=c.match(/\b(?:in|at|for)\s+([a-z][a-z .]{2,30}?)(?:\s+(?:today|tomorrow|tonight|this|next|on|the|and)\b|$)/);
 var plc=inPlace&&!/^(the|my|a|an|weather|forecast|morning|afternoon|evening|night|day|week|weekend|case|general)$/.test(inPlace[1].trim())&&!resolveDate(' '+inPlace[1]+' ',nowMs)?inPlace[1].trim():'';
 if(plc&&!/louisville|ky|kentucky|here|home|the shop/.test(plc))return {k:'wxplace',place:plc,d:resolveDate(c,nowMs)};
 var d=resolveDate(c,nowMs)||{start:todayStr(nowMs),end:todayStr(nowMs),single:true};
 var wants='';
 if(/\brain|umbrella|wet|shower|storm|thunder\b/.test(c))wants='rain';else if(/\bsnow|ice|icy|frost|freez/.test(c))wants='snow';else if(/\bjacket|coat|cold|chilly|freezing|warm|hot|temperature|temp|degrees|cool\b/.test(c))wants='temp';else if(/\bwind\b/.test(c))wants='wind';
 return {k:'weather',start:d.start,end:d.end,single:!!d.single,wants:wants,night:!!d.night};
}

/* ---------- main routers ---------- */
var YESNO=/^(?:yes|no|ok|sure|yep|yup|nope|please|do it|go ahead|go for it|send it|sounds good|thats right|that is right|correct|exactly|right|negative|affirmative|absolutely|definitely|of course|fine|cancel|stop|never mind|nevermind|forget it)$/;
function intent(raw,ctx){
 /* ctx: {nowMs, prev:{q,a,ageMs}, lastWasQuestion:bool}. Returns null when Claude is needed. */
 ctx=ctx||{};var nowMs=ctx.nowMs||Date.now();
 var n=norm(raw),c=core(raw);
 if(!n)return null;
 var words=c.split(' ').filter(Boolean).length;
 var N=ctx.name||'Ali';
 /* never touch anything that looks like a command that affects other people or money */
 if(/\b(text|message|msg|sms|tell(?! me\b)|let .{1,20} know|send|email|call|refund|charge|invoice|delete|cancel|reschedule|resched|move|push|pause|resume|unlock|lock|waive|remove|add|book|put on|schedule (?:a|an|me|my)|remind|remember|forget|note that)\b/.test(n)&&!/\b(what|show|any|how|who|which)\b.*\b(cancel|move|add|book|schedule)\w*\b/.test(n)&&!CAL_WORDS.test(c)&&!WX_WORDS.test(c))return null;
 /* follow-ups that depend on the previous local answer (weather, calendar, status) */
 var fu=followUp(n,c,ctx,nowMs);if(fu)return fu;
 /* acknowledgements */
 if(YESNO.test(c)||YESNO.test(n)){return ctx.lastWasQuestion?null:{k:'reply',text:pick(['Got it, '+N+'.','Okay, '+N+'.','You got it, '+N+'.','Sounds good.'],n+Math.floor(nowMs/60000))};}
 if(/^(?:thanks|thank you|thanks mint|appreciate (?:it|you|that)|much appreciated|you are the best|good job|nice work|great job|well done|you rock|nice one|awesome|perfect|great|cool|nice|sweet|love it|good|got it|will do|noted|roger|10 4|copy|copy that|roger that|roger roger|understood|will do boss|you got it|bet|word|facts|true|fair|fair enough|that works|works for me|sounds right|that is fine|that is good|i see|i get it|gotcha|ah ok|oh ok|oh nice|oh cool|oh good|ok cool|ok great|ok thanks|ok perfect|ok good|ok nice|ok sounds good|ok got it|ok will do|ok sweet|sweet|nice one|lol|haha|haha nice|ha ha|lmao|hehe|funny|good one|cool beans|alrighty|right on|appreciate ya|awesome sauce|sweet deal|bet that works|that is what i thought|exactly|i figured|makes sense to me|ok alright|ok deal|deal|done|good deal|fair enough|true that|word up|ten four|affirmative|okey dokey|that is funny|nice joke|understood|makes sense|all good|no worries|no problem|np)(?: thanks| mint| man| bro| dude| buddy| boss)?$/.test(c)||/^thanks\b/.test(n)&&words<=5){return {k:'reply',text:pick(['Anytime, '+N+'.','You got it, '+N+'.','Of course, '+N+'.','Happy to help, '+N+'.','No problem, '+N+'.'],n+Math.floor(nowMs/60000))};}
 if(/^(?:good )?(?:night|goodnight|nite)(?: mint)?$/.test(c)||/\b(goodnight|talk to you later|talk later|see you (?:later|tomorrow|soon)|catch you later|have a good (?:night|one|day|evening|weekend)|signing off|heading out|heading home|going home|im out|i am out|nite nite|night night|have a good one|peace out|see ya|see you|catch ya|talk to ya|bye|goodbye|later|peace|take care)\b/.test(n)&&words<=6&&!CAL_WORDS.test(c)){
  var dp=dayPart(nowMs);return {k:'reply',text:/night|evening/.test(n)||dp==='evening'||dp==='night'?'Goodnight, '+N+'.':'Talk soon, '+N+'.'};}
 var _sm=/^(?:well )?(?:hello|howdy|evenin|evening|ello|mornin|morning|hey)(?:\s+(?:there|partner|friend|boss|bro|man|mint|everyone|buddy|chief|big dog|dawg))*(?:\s+(?:what is up|what it do|how are you|how you doing|how ya doing|how is it going))?$/;
 var gt=n.match(/^(?:hello|good (morning|afternoon|evening)|morning|afternoon|evening)(?:\s+(?:mint|there|everyone|man|boss|bro|buddy))?$/);
 if(gt||_sm.test(n)||/^(?:what it do|how ya doin|how ya doing|how you been|how have you been|hope your day is going (?:good|well|great)|hope you are (?:doing )?(?:good|well|great)|you doing alright|you holding up|how are we|how is life|hello (?:mint )?(?:what is up|what up)|hello what up|what up)(?: mint| man)?$/.test(n)||/^(?:hello)(?: mint)?(?: how are you| how is it going| how are things| what is up)?$/.test(n)||/^(?:what is up|what is new|how is it going|how are you|how are you doing|how you doing|how is your day|how is your day going|how have you been|you good|you ok|you doing ok|whats good|how are things|how is everything with you|are you ok|are you good)(?: today| mint| man| bro| tonight)?$/.test(n)||/^what is up mint$/.test(n)){
  var part=gt&&gt[1]?gt[1]:dayPart(nowMs);part=part==='night'?'evening':part;
  if(/how are you|how is it going|how you doing|how have you been|you good|you ok|how is your day|how are things|are you ok|are you good|how is everything with you/.test(n))return {k:'reply',text:pick(['Doing great, '+N+'. Ready when you are.','All good here, '+N+'. What do you need?','Running smooth, '+N+'. What can I do for you?'],n+Math.floor(nowMs/3600000))};
  if(/what is up|what is new|whats good/.test(n))return {k:'reply',text:pick(['Not much, '+N+'. Everything is running. What do you need?','All quiet on my end, '+N+'. What is up with you?'],n+Math.floor(nowMs/3600000))};
  return {k:'reply',text:'Good '+part+', '+N+'. What can I do for you?'};
 }
 if(/^(?:who are you|what are you|what is your name|what do you do|what can you do|help|help me|what can i ask you|what can i say|what do you know|how do you work|what are your commands|commands|menu|options|what are you good for|what are you capable of)(?: mint)?$/.test(c)||/^(?:what can you|what do you)\b.*\b(do|help)\b/.test(n)&&words<=8){
  return {k:'reply',text:'I am M1NT, your assistant, '+N+'. I can check your calendar, add or move things, run status reports on leads, follow-ups, jobs and deposits, and answer quick things like weather, time, math and conversions. Customer texts and booking changes need your code.'};}
 if(/\b(joke|funny|make me laugh|cheer me up|got any (?:jokes|puns)|dad joke|pun)\b/.test(n)&&words<=9)return {k:'reply',text:pick(JOKES,String(Math.floor(nowMs/1000)))};
 if(/\b(fun fact|random fact|tell me something|detailing tip|give me a tip|pro tip|teach me something)\b/.test(n)&&words<=8)return {k:'reply',text:pick(FACTS,String(Math.floor(nowMs/1000)))};
 if(/\b(flip a coin|heads or tails|coin flip|toss a coin|flip coin|coin toss)\b/.test(n))return {k:'reply',text:(Math.random()<0.5?'Heads':'Tails')+'.'};
 var dr=n.match(/\b(?:roll|throw)(?: a| an| some)? (?:(\d+) )?(?:die|dice|d(\d+))\b/)||n.match(/\b(?:roll|throw) (\d+) (?:dice|die)\b/);
 if(dr){var cnt=Math.min(10,+dr[1]||1),sides=+dr[2]||6,rolls=[],tot=0;for(var i=0;i<cnt;i++){var r=1+Math.floor(Math.random()*sides);rolls.push(r);tot+=r;}return {k:'reply',text:cnt>1?rolls.join(', ')+' (total '+tot+').':String(rolls[0])+'.'};}
 var rn=n.match(/\b(?:random number|pick a number|number between)\b.*?(\d+)\s*(?:and|to|through|-)\s*(\d+)/);
 if(rn){var lo=Math.min(+rn[1],+rn[2]),hi=Math.max(+rn[1],+rn[2]);return {k:'reply',text:String(lo+Math.floor(Math.random()*(hi-lo+1)))+'.'};}
 /* time and date */
 if(/\b(what time is it|what is the time|current time|time is it|time now|got the time|what time|the time)\b/.test(n)&&!/\b(open|close|closes|opens|appointment|arrive|get there|leave|start|end|ready|done|due|set|at)\b/.test(n.replace(/what time is it/,''))&&words<=7){
  var e=etParts(nowMs);var hh=e.h%12||12;return {k:'reply',text:'It is '+hh+':'+pad(e.mi)+' '+(e.h<12?'AM':'PM')+', '+N+'.'};}
 if(/\b(what is the date|today s date|todays date|the date|date today|what is today|what is todays date|what date is it|what day is (?:it|today)|what is the day|date today|what day of the week|day is it|what is today s date)\b/.test(n)&&words<=8){return {k:'reply',text:'Today is '+pretty(todayStr(nowMs))+'.'};}
 var dq=n.match(/^what (?:day|date) (?:is|will be|falls on) (.+)$/);
 if(dq){var rd=resolveDate(dq[1],nowMs);if(rd&&rd.single)return {k:'reply',text:pretty(rd.start)+'.'};}
 var du=n.match(/\bhow many days (?:until|till|to|before) (?:the )?(christmas|new year|new years|thanksgiving|halloween|valentines day|easter|memorial day|labor day|fourth of july|july 4th|independence day)\b/);
 if(du){var np=etParts(nowMs),T=ymd(np.y,np.m,np.d),tgt;var nm=du[1];
  function nthWd(y,mo,wd,nth){var d=new Date(Date.UTC(y,mo-1,1));var off=(wd-d.getUTCDay()+7)%7;return ymd(y,mo,1+off+7*(nth-1));}
  function tg(y){if(/christmas/.test(nm))return ymd(y,12,25);if(/new year/.test(nm))return ymd(y+1,1,1);if(/thanksgiving/.test(nm))return nthWd(y,11,4,4);if(/halloween/.test(nm))return ymd(y,10,31);if(/valentine/.test(nm))return ymd(y,2,14);if(/fourth|july|independence/.test(nm))return ymd(y,7,4);if(/labor/.test(nm))return nthWd(y,9,1,1);if(/memorial/.test(nm)){var l=new Date(Date.UTC(y,5,0));var back=(l.getUTCDay()+6)%7;return ymd(y,5,31-back);}return null;}
  tgt=tg(np.y);if(tgt&&tgt<T)tgt=tg(np.y+1);if(tgt){var days=Math.round((Date.UTC(+tgt.slice(0,4),+tgt.slice(5,7)-1,+tgt.slice(8))-Date.UTC(np.y,np.m-1,np.d))/86400000);return {k:'reply',text:days+(days===1?' day':' days')+' until '+nm+' ('+prettyShort(tgt)+').'};}}
 /* units and math */
 var u=unitAnswer(raw);if(u)return {k:'reply',text:u.text+'.'};
 var m=mathAnswer(raw);if(m)return {k:'reply',text:m.text+'.',math:true};
 /* intents that need a fetch */
 var cal=calIntent(c,nowMs,raw);if(cal)return cal;
 var wx=wxIntent(c,nowMs);if(wx)return wx;
 var st=statusIntent(c,raw);if(st)return st;
 return null;
}

/* ---------- follow-ups ("and Saturday though?", "no I meant Sunday") ---------- */
var FU_LEAD=/^(?:and|so|then|ok|but|what about|how about|what if|what of|and what about|and how about|how about for|what about for|same (?:for|on|thing for|but for)|now|try|check|ok and|and for|for|on|actually|no|nope|no wait|wait|sorry|i meant|i mean|i said|make it|change (?:it )?to|switch to|instead|scratch that|never mind|nevermind|forget that|my bad|oops|um|uh)\b[ ,]*(.*)$/;
function followUp(n,c,ctx,nowMs){
 var p=ctx.prev;if(!p||!p.q||(p.ageMs!==undefined&&p.ageMs>1500000))return null;
 if(c.split(' ').length>8)return null;
 var m=FU_LEAD.exec(c),rest=m?m[1]:c;
 var bareDate=resolveDate(' '+rest+' ',nowMs);
 if(!bareDate)return null;
 if(!m&&c.split(' ').length>4)return null;
 var rest2=rest.replace(/\b(though|tho|then|too|instead|please|also|again)\b/g,'').trim();
 if(rest2.split(' ').length>6)return null;
 var pi=intent(p.q,{nowMs:nowMs-(p.ageMs||0),prev:null,lastWasQuestion:false,name:ctx.name,_noFollow:true});
 if(!pi)return null;
 if(pi.k==='weather')return {k:'weather',start:bareDate.start,end:bareDate.end,single:!!bareDate.single,wants:pi.wants,night:!!bareDate.night,follow:true};
 if(pi.k==='cal')return {k:'cal',start:bareDate.start,end:bareDate.end,single:!!bareDate.single,free:pi.free,follow:true};
 if(pi.k==='status'&&(pi.topic==='jobs'||pi.topic==='full'||pi.topic==='followups'))return {k:'status',topic:/\btomorrow\b/.test(rest)?'tomorrow':pi.topic,fresh:'',focus:String(p.q+' -> '+rest).slice(0,200),follow:true};
 return null;
}

/* ---------- weather formatting (Open-Meteo JSON) ---------- */
var WMO={0:'clear',1:'mostly clear',2:'partly cloudy',3:'cloudy',45:'foggy',48:'foggy',51:'light drizzle',53:'drizzle',55:'heavy drizzle',56:'freezing drizzle',57:'freezing drizzle',61:'light rain',63:'rain',65:'heavy rain',66:'freezing rain',67:'freezing rain',71:'light snow',73:'snow',75:'heavy snow',77:'snow grains',80:'light showers',81:'showers',82:'heavy showers',85:'snow showers',86:'heavy snow showers',95:'thunderstorms',96:'thunderstorms with hail',99:'thunderstorms with hail'};
function wxText(data,it,nowMs,name){
 if(!data||!data.daily||!data.daily.time)return null;
 var D=data.daily,i,days=[];
 for(i=0;i<D.time.length;i++){if(D.time[i]>=it.start&&D.time[i]<=it.end)days.push(i);}
 var N=name||'Ali';
 if(!days.length)return "I can only see about a week of forecast, "+N+'. Try a closer day.';
 function lab(s){return s===todayStr(nowMs)?'Today':s===addDays(todayStr(nowMs),1)?'Tomorrow':DAYS[wdOf(s)].replace(/^./,function(x){return x.toUpperCase();});}
 function one(ix){
  var hi=Math.round(D.temperature_2m_max[ix]),lo=Math.round(D.temperature_2m_min[ix]);
  var pr=D.precipitation_probability_max?D.precipitation_probability_max[ix]:null;
  var cond=WMO[D.weather_code[ix]]||'mixed';
  var wind=D.wind_speed_10m_max?Math.round(D.wind_speed_10m_max[ix]):null;
  var s=lab(D.time[ix])+': '+cond+', high '+hi+', low '+lo;
  if(pr!==null&&pr>=20)s+=', '+pr+'% chance of precip';
  if(wind!==null&&wind>=15)s+=', winds to '+wind+' mph';
  return s+'.';
 }
 if(it.wants==='rain'&&days.length===1){var ix=days[0],pr=D.precipitation_probability_max[ix];return (pr>=50?'Likely, ':pr>=20?'Possibly, ':'Probably not, ')+N+'. '+lab(D.time[ix])+' shows '+pr+'% chance of precipitation, '+(WMO[D.weather_code[ix]]||'mixed')+'.';}
 if(days.length===1){var s1=one(days[0]);if(it.single&&D.time[days[0]]===todayStr(nowMs)&&data.current){s1='Right now it is '+Math.round(data.current.temperature_2m)+' and '+(WMO[data.current.weather_code]||'mixed')+'. '+s1;}return s1;}
 return days.slice(0,7).map(one).join('\n');
}

var api={norm:norm,core:core,words2num:words2num,resolveDate:resolveDate,mathAnswer:mathAnswer,unitAnswer:unitAnswer,intent:intent,wxText:wxText,etParts:etParts,todayStr:todayStr,addDays:addDays,prettyShort:prettyShort,pretty:pretty,fmtNum:fmtNum,version:1};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.M1NT_NLU=api;
})(typeof self!=='undefined'?self:this);
