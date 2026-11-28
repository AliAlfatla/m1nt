/*V2-BEGIN*/
/* ============ v2: repair, guards, flexible matching, conversation state ============ */
var VOC=('weather forecast temperature rain raining snow snowing storm storms umbrella jacket windy sunny cloudy outside calendar schedule agenda appointment appointments tomorrow tonight today saturday sunday monday tuesday wednesday thursday friday weekend week month december november january february march april june july august september october next followup leads deposits deposit booked bookings jobs inventory supplies system automation automations errors failures failing broken running restock everything anything looking rundown status report overview thanks thank goodnight night joke jokes funny commands calculate percent divided times plus minus multiply miles kilometers pounds fahrenheit celsius gallons liters ounces inches quarts coin heads tails random number between flip roll throw date time morning evening afternoon waiting inquiries customers quotes outstanding unpaid health check fail failed missing urgent business problems issues summary update catch needs capable abilities introduce yourself follow nudge squared cubed square root refund waive invoice delete block reschedule appreciate appreciated awesome perfect excellent brilliant grateful helpful understood problem worries sounds sound convert how many ounces pounds kilograms liters cups feet miles clear forward smoothly properly peace goodbye signing should could would about think which where there their going doing much many want need know tell give show current today summarize summary order buy appts shall status heading later eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million multiplied multiply subtract anyone anybody waiting reach upcoming customers customer restock products running smoothly smooth healthy failures commands command abilities introduce yourself percent half quarter tip split help what whats where who when how this that need know tell show give call text send move cancel remind tomorrow later again please mint hello morning').split(' ');
var COMMON=('a an the and or but if so to of in on at for with from by is are was were be been am do does did have has had i me my we our you your it its he she they them his her this these those what who when where why how which can could would should will shall may might must not no yes ok please hey hi yo um uh er hmm like just really very too also then than there here out up down over about into off more most some any all each every other much many few lot got get gimme let lemme say said ask show see look need want know think make made take took go going gonna wanna gotta come put set run work works working mint ali boss bro man dude fam bud buddy chief sir now right left good great nice cool sure fine best new old first last long little big small high low early late same different next back away home car cars shop day days year week weeks hour hours minute minutes sec second seconds morning noon night dollar dollars bucks cash card pay paid price cost quote quotes deal job anna marc paul dan sheri rebecca malik alex david tahoe suv truck sedan wax polish coat ceramic interior exterior window wheel tire tires seat seats paint dirty clean wash detail full ceramic package packages phone number numbers name address email thing things stuff way ways kind lol haha ha okay yep yeah nah nope maybe again once twice here there who whom whose says told called texted sent').split(' ');
/* extra unit pairs */
(function(){function U(a,b,f,ta,tb){UNITS.push({a:new RegExp('^(?:'+a+')$'),b:new RegExp('^(?:'+b+')$'),fn:f,ta:ta,tb:tb});}
 var LB='lb|lbs|pounds?',OZ='oz|ounces?',FT='ft|foot|feet',IN='in|inch|inches',MI='mi|miles?',KM='km|kilometers?|kilometres?',M='m|meters?|metres?',CM='cm|centimeters?|centimetres?',KG='kg|kilos?|kilograms?',G='g|grams?',QT='qt|quarts?',GAL='gal|gallons?',CUP='cups?',L='l|liters?|litres?',ML='ml|milliliters?|millilitres?';
 U(LB,OZ,function(x){return x*16;},'lb','oz');U(OZ,LB,function(x){return x/16;},'oz','lb');U(FT,IN,function(x){return x*12;},'ft','in');U(IN,FT,function(x){return x/12;},'in','ft');
 U(MI,FT,function(x){return x*5280;},'mi','ft');U(FT,MI,function(x){return x/5280;},'ft','mi');U(KM,M,function(x){return x*1000;},'km','m');U(M,KM,function(x){return x/1000;},'m','km');
 U(M,CM,function(x){return x*100;},'m','cm');U(CM,M,function(x){return x/100;},'cm','m');U(KG,G,function(x){return x*1000;},'kg','g');U(G,KG,function(x){return x/1000;},'g','kg');
 U(QT,GAL,function(x){return x/4;},'qt','gal');U(GAL,QT,function(x){return x*4;},'gal','qt');U(OZ+'|fluid ounces?|fl oz',CUP,function(x){return x/8;},'oz','cup');U(CUP,ML,function(x){return x*236.588;},'cup','mL');
 U(L,ML,function(x){return x*1000;},'L','mL');U(ML,L,function(x){return x/1000;},'mL','L');U('hours?|hrs?','minutes?|mins?',function(x){return x*60;},'hr','min');U('minutes?|mins?','hours?|hrs?',function(x){return x/60;},'min','hr');U('days?','hours?|hrs?',function(x){return x*24;},'day','hr');U('weeks?','days?',function(x){return x*7;},'week','day');
 U(MI,M,function(x){return x*1609.344;},'mi','m');U(FT,CM,function(x){return x*30.48;},'ft','cm');U(IN,MI,function(x){return x/63360;},'in','mi');U(KG,OZ,function(x){return x*35.274;},'kg','oz');U(LB,G,function(x){return x*453.592;},'lb','g');
})();
var LEARN=null;var REGSET=__REGSET__;
var COLLSET={};'__COLL__'.split(' ').forEach(function(w){COLLSET[w]=1;});
var VSET={},CSET={};VOC.forEach(function(w){VSET[w]=1;});COMMON.forEach(function(w){CSET[w]=1;});
function dl(a,b,max){ /* Damerau-Levenshtein with cutoff */
 if(Math.abs(a.length-b.length)>max)return max+1;
 var la=a.length,lb=b.length,d=[],i,j;
 for(i=0;i<=la;i++){d[i]=[i];}for(j=0;j<=lb;j++)d[0][j]=j;
 for(i=1;i<=la;i++)for(j=1;j<=lb;j++){var c=a[i-1]===b[j-1]?0:1;d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);}
 return d[la][lb];
}
function fixTok(t){
 if(t.length<4||/\d/.test(t)||VSET[t]||CSET[t]||COLLSET[t])return t;
 var best=null,bd=9,tie=false;
 for(var i=0;i<VOC.length;i++){var w=VOC[i];if(w.length<4)continue;var max=(w.length>=7&&!/(?:ing|ed|ly)$/.test(w))?2:1;if(max===2&&t.length<5)max=1;var d=dl(t,w,max);if(d<=max){if(d<bd){bd=d;best=w;tie=false;}else if(d===bd&&w!==best){if(w.length===t.length&&best.length!==t.length){best=w;tie=false;}else if(best.length===t.length&&w.length!==t.length){}else tie=true;}}}
 if(!best||tie)return t;
 if(t[0]!==best[0]&&!(bd===1&&t.length>=6))return t;
 return best;
}
var STTFIX=[[/\bto morrow\b|\btomorrow (?:day|is)\b/g,'tomorrow'],[/\bfull of ups?\b|\bfollow of ups?\b/g,'followup'],[/\bcolor dar\b|\bcalendar is\b/g,'calendar'],[/\bsatur day\b|\bsaturday is\b/g,'saturday'],[/\bwhether\b(?! or\b| to\b| i\b| you\b| we\b| he\b| she\b| they\b| it is (?:a|worth)\b)/g,'weather'],[/\bweather is\b/g,'weather'],[/\btanks\b|\btnks\b/g,'thanks'],[/\bgood night\b/g,'goodnight'],[/\bgood bye\b/g,'bye'],[/\bleeds\b/g,'leads'],[/\bpick a number\b/g,'random number'],[/\bhay\b/g,'hello'],[/\b(?:whas|whts|wats|wuts|whatd)\b/g,'what is'],[/\bsched\b/g,'schedule'],[/\bwhatchu\b|\bwatchu\b/g,'what do you'],[/\byoure\b/g,'you are'],[/\b(\w+) \1\b/g,'$1'],[/\bupdoming\b/g,'upcoming'],[/\bwx\b/g,'weather'],[/\bbiz\b/g,'business'],[/\bwat is\b/g,'what is']];
function repairTokens(n){
 STTFIX.forEach(function(r){n=n.replace(r[0],r[1]);});
 var t=n.split(' ');
 if(t.length>=2){if(/^(?:mince|mind|ment|minte|minth)$/.test(t[0])&&t[1]!=='the')t[0]='mint';if(/^(?:mince|ment|minte|minth)$/.test(t[t.length-1]))t[t.length-1]='mint';}
 t=t.map(fixTok);
 return norm(t.join(' '));
}
var WRAP_PRE=[/^(?:would|do) you mind (?:telling|giving|showing) me /,/^(?:(?:hey |hello |ok |okay )?mint )?(?:could|can|would|will) you (?:please )?(?:just )?(?:tell|give|show|get)? ?me /,/^(?:(?:hey |hello |ok |okay )?mint )?(?:could|can|would|will) you (?:please |kindly )?/,/^(?:would|do) you mind (?:telling|giving|showing) me /,/^i would like to (?:know|see|hear) /,/^i want to (?:know|see) /,/^(?:kindly|excuse me|quick question|question|real quick|yo|hello|hey|ok|okay|so|um+|uh+|er+|like|alright|man|dude|bro|boss|buddy|mint|well|oh|hmm+|mm+|and|please|just|then|now)\b[ ,]*/,/^(?:please )?(?:tell|let) me know (?:if |whether |how |what )?/,/^(?:can|could) i (?:get|have) /,/^(?:you can )?(?:tell|give|show) me (?!a joke|something|the time|the date)/];
var WRAP_SUF=[/\s+(?:please|plz|pls|thanks|thank you|mint|real quick|for me|for us|when you get a chance|if you can|if you could|if possible|asap|right now|rn|tho|though|fam|bud|buddy|bro|man|dude|boss|ya know|yes know|you know|eh|lol|haha|yes|sir|ok|okay|then|too|now|today please)$/];
function strip(n){
 var x=n,prev,guard=0;
 do{prev=x;
  WRAP_PRE.forEach(function(r){var m=x.match(r);if(m&&m[0].length<x.length)x=x.slice(m[0].length);});
  WRAP_SUF.forEach(function(r){var m=x.match(r);if(m&&m[0].length<x.length&&x.slice(0,x.length-m[0].length).trim())x=x.slice(0,x.length-m[0].length);});
  x=x.replace(/\b(?:um+|uh+|er+|erm|hmm+)\b/g,' ').replace(/\s+/g,' ').trim();
 }while(x!==prev&&++guard<6);
 return x||n;
}
function understandClean(raw){var n0=norm(raw);if(!n0)return {n0:'',fixed:'',c:''};var fixed=repairTokens(n0);var c=strip(fixed);return {n0:n0,fixed:fixed,c:c};}

/* ---- guard: anything that acts on people, money or the calendar is never answered locally ---- */
var DAYW='of|today|tomorrow|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekend|week|month|january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec|this|next|for|on|and|is|my|the|please|now|morning|evening|afternoon|tonite|midnight|noon|[0-9]+(?:st|nd|rd|th)?|a|an|me|us|that|it|then|again|today';
var ACT_ANY=/\b(forward|texts?|texting|txt|dm|ping|forward|email|e mail|refund|refunds|invoice|waive|unsubscribe|resched|reschedule|void|remind|remember|resend|nudge them|nudge him|nudge her)\b/;
var ACT_IMP=new RegExp('^(?:and |then |also |ok |please )?(?:send|tell|message|msg|call|phone|charge|delete|cancel|move|push|pause|resume|remove|add|book|reserve|mark|pay|process|change|update|edit|clear|block|stop|order|buy|fix|give|take|make|flip|shoot|let|set|put|create|follow ?up with|followup with|hit|drop|save|note|log|record|rename|assign|text|reply|respond|answer|write|draft|compose|email|call|transfer|cash|apply|take off|roll over|reschedule|schedule (?!(?:'+DAYW+')\\b)\\w+)\\b');
function isAction(c,fixed){
 c=c.replace(/^(?:(?:ok|and|then|also|please|hello|so|um|uh) )+/,'')||c;
 if(/^(?:tell|give|show|let|lemme|gimme) (?:me|us)\b/.test(c)&&!/\b(?:text|send|email|call|remind)\b/.test(c)){if(/^tell me about\b/.test(c)||/\bsummari[sz]e\b/.test(c))return true;return false;}
 if(/^(?:make me (?:laugh|smile)|hit me (?:with|up with|again))\b/.test(c))return false;
 if(/^(?:set|put) (?:a )?(?:timer|alarm|reminder)/.test(c))return true;
 if(ACT_ANY.test(c))return true;
 if(/^(?:and |then |also |ok |please |hello )?(?:roll|throw|flip)(?: a| an| the| two| some| \d+)? (?:die|dice|d\d+|coin|quarter)\b/.test(c))return false;
 if(ACT_IMP.test(c))return true;
 if(/\b(?:tell|let) (?!me\b|us\b)(?:[a-z]+) (?!know\b)/.test(c)&&/\b(?:tell|let) (?!me\b)/.test(c)&&!/\b(?:tell|let) (?:me|us)\b/.test(c))return true;
 if(/\b(?:tell|let|message|call|text|send) (?!me\b|us\b)(?:marc|anna|paul|dan|sheri|rebecca|malik|alex|david|him|her|them|my customer|the customer|customer)\b/.test(c))return true;
 if(/\bfollowup with\b/.test(c)&&!/^(?:who|which|whom|what|anyone|anybody|any|do i have|are there|is there|list|show|how many)\b/.test(c))return true;
 if(/\b(?:give|get) [a-z]+ (?:a )?(?:discount|credit|free)\b|\btake \d+ percent off\b|\bmark .{0,30} (?:paid|done|complete)\b|\bput .{1,40} on (?:my|the) calendar\b|\bpay the\b|\bchange the (?:price|quote)\b|\bmove .{1,30} to\b|\badd .{1,30} to\b/.test(c))return true;
 return false;
}
/* ---- conversation classes (matched on lightly-cleaned text) ---- */
var LITE=/\b(?:um+|uh+|er+|erm|hmm+|mm+|like|so|well|just|please|pls|plz|quick|real|mint|bro|man|dude|fam|bud|buddy|boss|chief|sir|tho|though|eh|asap|excuse me|yes know|for me|if you can|if you could|when you get a chance|right now|there|big dog|dawg|my friend|friend|kindly|you know|ya know)\b/g;
function lite(n){return n.replace(LITE,' ').replace(/\s+/g,' ').trim();}
var ACKW={};('cheers thanks thank you so much a lot many awesome perfect cool nice great sweet dope excellent brilliant bet word good stuff works work for me that is helpful understood noted roger copy got it gotcha ok alrighty okie dokie dokey right on love sounds sound deal fair enough no worries problem appreciate appreciated grateful job rock one thing sure all yep yes love it thats buddy man mint good lol haha is the this very yup yeah everything works great makes sense').split(' ').forEach(function(w){ACKW[w]=1;});
var ACKA={};('cheers sense thanks thank appreciate appreciated grateful awesome perfect cool nice great sweet dope excellent brilliant bet word works understood noted roger copy gotcha ok alrighty deal enough worries problem helpful love sounds job rock stuff got dokie').split(' ').forEach(function(w){ACKA[w]=1;});
function isAck(L){L=L.replace(/\bwill do\b/,'noted').replace(/\bno prob(?:lem)?\b/,'no problem');var t=L.split(' ').filter(Boolean);if(!t.length||t.length>6)return false;var anchor=false;for(var i=0;i<t.length;i++){if(!ACKW[t[i]])return false;if(ACKA[t[i]])anchor=true;}return anchor&&!/\b(?:what|how|who|when|where|why)\b/.test(L);}
var CONFIRM=/^(?:yes|yep|yup|sure|do it|do that|go ahead|go for it|proceed|yes please|ok do it|ok do that|ok go ahead|ok go for it|yes do it|yes do that|yes go ahead|ok sure|yes sure|absolutely|definitely|of course|correct|that is right|exactly|right|affirmative|send it|confirm|confirmed|approved|approve|no|not yet|no thanks|no thank you|negative)$/;
var ASKFRAG=/^(?:and then|wait|hold on|one sec|one second|hang on|hm+|um+|uh+|er+|erm|well|so|and|then|what|huh|ok so|but)$/;
var PRONCMD=/^(?:cancel|move|send|delete|forward|change|edit|undo|redo|repeat|resend|reply|revert|remove|text|call|book|refund|schedule|charge|message|phone|reschedule|pause|resume|do)(?: it| that| this| them| those| him| her)?(?: again| now| later)?$/;
var REFFRAG=/^(?:the |number |option |item |choice )?(?:first|second|third|fourth|last|other|1st|2nd|3rd|one|two|three|1|2|3|a|b|c)(?: one| option| choice)?$|^(?:this|that|these|those|the other|the same|same) one$|^(?:the )?(?:cheaper|better|bigger|smaller|earlier|later) (?:one|option)$|^(?:same (?:thing|as (?:before|last time|last week|usual))|like last time|as usual|once more|again|do that again|repeat that|redo that|do it again|same again)(?: but (?:cheaper|earlier|later|bigger|smaller))?$|^(?:make|can you make) (?:it|that) (?:earlier|later|cheaper|bigger|smaller)$|^(?:same thing )?but (?:cheaper|earlier|later|bigger|smaller|different)$|^(?:what about|and|how about) (?:him|her|them|that one|the other one)$|^(?:a cheaper|a different|another) one$/;
function ordIdx(c){var m=c.match(/\b(first|1st|one|1|a)\b/);if(m)return 0;m=c.match(/\b(second|2nd|two|2|b)\b/);if(m)return 1;m=c.match(/\b(third|3rd|three|3|c)\b/);if(m)return 2;m=c.match(/\b(fourth|4th|four|4|d)\b/);if(m)return 3;if(/\blast\b/.test(c))return -1;return null;}
var CANON={greet:'hello',howareyou:'how are you',whatsup:'what is up',thanks:'thanks',ack:'ok',bye:'goodnight',ident:'what can you do',joke:'tell me a joke',coin:'flip a coin',date:'what is the date',time:'what time is it'};
function conv(L,fixed,c,ctx,st){
 var nowMs=ctx.nowMs||Date.now(),canon;L=L.replace(/\b(funny|good|another|more|next|silly|dad|cheaper|better|other|same|last|first|this|that|the|number|nice|great|best|which|any) 1\b/g,'$1 one').replace(/^1 (more|please)\b/,'one $1');
 L=L.replace(/\bwhat up\b/g,'what is up');
 if(/^(?:all good|we good|we are good|all is good|everything is good|good to go|all set|good to know|that helps|sounds like a plan|that sounds like a plan|ok that helps)$/.test(L))return say('ack',ctx);
 var rn=fixed.match(/\b(?:random number|pick a number|choose a number|number)\s*(?:between |from )?(\d+)\s*(?:and|to|through|thru|-)\s*(\d+)\b/);if(rn&&/random|pick|choose|number/.test(fixed)){var lo=Math.min(+rn[1],+rn[2]),hi=Math.max(+rn[1],+rn[2]);if(hi-lo<=1000000)return {k:'reply',kind:'coin',text:String(lo+Math.floor(Math.random()*(hi-lo+1)))+'.'};}
 if(/^(?:mm+ ?hm+|uh huh|mhm+|mm+ hm+)$/.test(fixed))return say('ack',ctx);
 if(!L||ASKFRAG.test(L)||/^(?:hm+|um+|uh+|er+|erm|mm+)$/.test(fixed))return {k:'ask',text:'I am here, '+(ctx.name||'Ali')+'. Go ahead.'};
 if(/^(?:haha+|ha ha+|hehe+|lol|lmao|rofl|ha|that is funny|good one|nice joke|that is good|ha that is good|funny|hilarious|ha that is funny|ha good one|haha good one)$/.test(L))return {k:'reply',text:pick(['Ha. Glad that landed, '+(ctx.name||'Ali')+'.','Ha, I try. '+(ctx.name||'Ali')+', I try.','Always here for the comedy side of the business.'],L+Math.floor(nowMs/60000)),kind:'laugh'};
 if(/^(?:brr+|ugh+|ew+|yikes|oof|wow|damn|man|geez|jeez|dang)$/.test(L)){var wt=st&&st.topics&&st.topics.length&&st.topics[st.topics.length-1].kind==='weather';return {k:'reply',text:wt?'Stay warm out there, '+(ctx.name||'Ali')+'.':'I hear you, '+(ctx.name||'Ali')+'.',kind:'remark'};}
 if(/\b(?:never ?mind|forget (?:it|that)|scratch that|disregard|cancel that)\b/.test(L)&&L.split(' ').length<=4&&!/\bone\b/.test(L)&&!(st&&st.pendingQ))return {k:'reply',text:'No problem, '+(ctx.name||'Ali')+'.'};
 if(CONFIRM.test(L)){if(st&&st.pendingQ)return null;return {k:'ask',text:'Yes to what, '+(ctx.name||'Ali')+'? I do not have anything waiting on you.'};}
 if(/\b(?:goodnight|bye|goodbye|ttyl|talk to you later|talk soon|talk to you soon|take care|see you|see ya|catch you|later|peace|cya|until tomorrow|signing off|heading out|heading home|i am out|i am off for the night|i am done for|done for (?:today|the day|the night)|that is all|have a good (?:one|night|day|evening|weekend)|night night|nite|nighty night|good one to you|night|good night|talk to you (?:in the morning|tomorrow|tonight)|going to (?:bed|sleep)|off to (?:bed|sleep)|heading to bed|calling it a night|closing up|closing time|that is it for today)\b/.test(L)&&L.split(' ').length<=8&&!/\b(?:weather|calendar|schedule|what|how many|who|text|tomorrow morning)\b/.test(L)&&!(/\bgood one\b/.test(L)&&!/to you/.test(L))&&!/^tomorrow$/.test(L)){canon=CANON.bye;return say('bye',ctx);}
 if(/^(?:are )?(?:you )?(?:there|around|up|awake|here)$/.test(L))return say('greet',ctx);
 if(/^(?:hello )?what is (?:happening|going on)(?: mint)?$/.test(fixed.replace(/^ok /,''))&&/\b(?:mint|hello)\b/.test(fixed))return say('whatsup',ctx);
 if(/^hello (?:what is (?:going on|up|happening|good|new|crackin|cracking)|how are (?:things|you)|how is (?:it going|life|your day)|how have you been|it is me|its me)(?: today)?$/.test(L))return say(/how are|how is|how have/.test(L)?'howareyou':'whatsup',ctx);
 if(/^(?:hello|hola|ayo|good (?:morning|afternoon|evening|day)|morning|afternoon|evening|top of the morning|howdy|hello hello|hello hello hello|hello good (?:morning|afternoon|evening)|good day|hello again|hello you|hello u|hello yes)(?: (?:hello|good morning|to you|everyone|there))*$/.test(L)||/^(?:hello )?(?:hello )?(?:what is (?:up|good|crackin|cracking|poppin|popping)|what it do|wassup)$/.test(L)||/^hello what is happening$/.test(L)){return say(/what/.test(L)?'whatsup':'greet',ctx,L);}
 if(/^(?:hello )?(?:hello )?(?:how (?:are|r) (?:you|yes|u)(?: doing| today| been| holding up)?|how have you been|how (?:is|are) (?:you|life|your day(?: going)?|yes doing|everything with you|it going)|how you doing|how yes doing|how (?:you|yes) been|how is (?:your day|it) going|(?:you|yes) (?:good|ok|alright|doing ok|doing good)|are you (?:good|ok|alright)|hope (?:you are|your day is)(?: doing| going)?(?: very)? (?:well|good|great)|long time no see|how are you today|how is life)(?: hello)?(?: today)?$/.test(L)||/^hello (?:hello )?hope you are (?:doing )?(?:well|good|great)$/.test(L)){return say('howareyou',ctx);}
 if(/\bwho (?:are|is) (?:you|mint|this)\b|\bwhat (?:are|is) (?:you|mint|this)$|\bwhat (?:can|do) you (?:do|know|understand|help)|\bwhat (?:are|is) your (?:commands|abilities|capabilities|name)|\b(?:list|show) (?:me )?(?:your )?(?:abilities|commands|what you can do)|\bwhat you can do\b|\bintroduce yourself\b|tell me about yourself|^help(?: me)?$|^commands$|what (?:can|should) i (?:say|ask)|how do i use you|what are you (?:able|capable)|what are you good for|what do you do$|what is this$|what commands|how (?:can|could|do) you help|what (?:are )?(?:all )?(?:the )?(?:things|kinds of things) (?:you can|i can)|what can you help|what (?:are )?your features|what (?:do|can) you .{0,12}(?:do for me|help me with)/.test(L)&&!/\b(?:marc|anna|paul|sheri|rebecca)\b/.test(L)||/\bwhat (?:is|are) mint$/.test(fixed))return say('ident',ctx);
 if(/\b(?:joke|joks|jokes|pun|silly one|cheer me up|make me smile|lighten the mood|good one for me|something funny|make me laugh|need a laugh|funny one|crack a)\b/.test(L)&&L.split(' ').length<=9)return say('joke',ctx);
 if(/^(?:another|another one|another one please|one more|one more please|one more joke|another joke|again|more|hit me again)$/.test(L)){if(st&&st.lastKind==='joke'&&nowMs-st.lastAt<600000)return say('joke',ctx);return null;}
 if(/\b(?:coin|heads or tails|flip a quarter|spin the coin|coin toss|toss a|call it in the air)\b/.test(L)&&!/\b(?:ceramic|coating)\b/.test(L))return say('coin',ctx);
 var dm=L.match(/\b(?:roll|throw)\b.*?\b(?:(\d+) )?(?:six sided )?(?:die|dice|d(\d+))\b/);
 if(dm&&!/\b(?:over|my|the job)\b/.test(L)){var cnt=Math.min(10,+dm[1]||(/\btwo\b/.test(L)?2:1)),sides=+dm[2]||6,rl=[],tot=0;for(var i=0;i<cnt;i++){var r=1+Math.floor(Math.random()*sides);rl.push(r);tot+=r;}return {k:'reply',text:cnt>1?rl.join(', ')+' (total '+tot+').':rl[0]+'.',kind:'dice'};}
 var rn=L.match(/(?:random number|any number|a number|number)\D{0,20}(\d+)\D{1,12}(\d+)/);
 if(rn&&/\b(?:random|pick|number)\b/.test(L)&&!/\b(?:phone|text|call)\b/.test(L)){var lo=Math.min(+rn[1],+rn[2]),hi=Math.max(+rn[1],+rn[2]);return {k:'reply',text:String(lo+Math.floor(Math.random()*(hi-lo+1)))+'.',kind:'random'};}
 var t0=L.replace(/^(?:(?:do you (?:know|have)|any idea|i need to know|can you tell me|could you tell me|tell me|give me)(?: what)? ?)?(?:what is |what s |got |do you have |have you got |whats )?/,'').replace(/\b(?:is it|right now|now|at the moment|check|please|today)$/,'').trim();
 if(/^(?:the )?(?:current )?(?:time|hour)(?: it is| we at| check)?$|^what time(?: is it| we at| it is)?$|^time(?: check)?$|^is it past \w+(?: yet)?$|^how late is it$|^the time$|^what is the time$/.test(t0)||/^(?:time|what time is it|what is the time|current time|how late is it|what time we at|is it past \w+ yet|what is the time right now|what time is it right now)$/.test(L))return say('time',ctx);
 var DATE_RE=/^(?:what is )?(?:the )?(?:todays? )?date(?: today| please)?$|^(?:which|what) (?:date|day) (?:is it|is today|are we on)(?: today)?$|^what day is today$|^what is today$|^todays date$|^today is what (?:date|day)$|^what day of the (?:week|month) (?:is it|is today)$|^what is the day(?: today)?$|^which day is it(?: today)?$|^date today$|^what is todays date$|^whats today$|^what day are we on$|^what date is it$|^(?:today |tday )?what (?:date|day)(?: is it| today)?$/;
 if(DATE_RE.test(L)||DATE_RE.test(t0))return say('date',ctx);
 if(isAck(L))return say(/\b(?:thanks|thank|appreciate|appreciated|grateful)\b/.test(L)?'thanks':'ack',ctx);
 return null;
}
function say(kind,ctx){var r=intent1(CANON[kind],{nowMs:ctx.nowMs,name:ctx.name,lastWasQuestion:false});if(r&&r.k==='reply'){r.kind=kind==='joke'?'joke':kind;return r;}return null;}
/* ---- weighted status scorer ---- */
var SC=[
 ['followups',[[/\bfollowups?\b/,3],[/\b(?:who|which) (?:should|do|can|need|needs|to)\b.*\b(?:reach out|check in|call back|contact|nudge|hear from me|call|text|ping)\b/,2.8],[/\b(?:check ins?|nudge|call back|circle back|hear from me)\b/,1.6],[/\b(?:people|customers?) (?:i need|to)\b/,1],[/\b(?:due|overdue|pending)\b/,.8],[/\bhear from me\b/,2.8]]],
 ['leads',[[/\b(?:leads?|inquir\w*|prospects?)\b/,3],[/\bquote requests?|requests? for (?:a )?quotes?\b/,3],[/\bquotes?\b/,1.5],[/\b(?:reach out|reached out|asking about (?:a )?job|waiting (?:on me|for me|for (?:a )?quotes?)|new (?:customers?|people)|anyone new|who texted me|who messaged me)\b/,2.6],[/\b(?:any|anyone|anybody|new|how many|who|did)\b/,.8]]],
 ['jobs',[[/\b(?:deposits?|unpaid|owes?|bookings?)\b/,2.6],[/\bhow many (?:jobs|cars|details|bookings|people)\b/,3],[/\bwho (?:is )?(?:booked|still owes)|who (?:has not|hasnt|has not) paid\b/,3],[/\b(?:jobs?|booked|cars)\b/,1],[/\bbooked jobs\b/,2.6],[/\bwho (?:is )?paid\b/,2.8],[/\b(?:what is booked|who is booked)\b/,2],[/\b(?:upcoming (?:jobs|bookings)|jobs this week|bookings this week)\b/,3],[/\b(?:outstanding|missing|status|this week|paid)\b/,.8]]],
 ['health',[[/\b(?:system|systems|automations?|scenarios?|workflows?|bot|errors?|failures?|failing|failed|fail|fails|broken|break|broke|crash\w*|healthy|health)\b/,2.6],[/\b(?:running|working|ok|fine)\b/,1],[/\b(?:go|went|gone) wrong\b|\banything wrong\b|\bsomething wrong\b/,2.8],[/\b(?:smooth|smoothly|properly)\b/,1.8],[/\bis (?:everything|it|mint|the system|the bot|all) (?:running|working|ok|up)\b/,2.6],[/\b(?:everything|anything|you|things)\b/,.6]]],
 ['inventory',[[/\b(?:inventory|supplies|stock|restock|reorder|towels|polish|chemicals|products?)\b/,2.6],[/\b(?:low|short|running low|running out|out of|need to order|order)\b/,1.4],[/\b(?:need to buy|buy for the shop|need to stock|restock)\b/,3],[/\b(?:low|short|out) (?:on|of) (?:anything|stuff|supplies|products)\b|\brunning (?:low|out)\b/,3]]],
 ['full',[[/\b(?:the story|the scoop|the skinny|the update|on fire|fires|the haps|status|rundown|lowdown|overview|summary|situation|big picture|state of things|where (?:we|things) (?:are|stand)|catch me up|fill me in|brief me|up to speed|what did i miss|what am i missing|what needs me|anything (?:i )?(?:need|should) (?:to )?know|anything urgent|anything on fire|how (?:is|are) (?:everything|things|business|the business|we|it all|we doing)|how is it all looking|how we looking|how are we looking|how is everything looking|what is (?:going on|happening|new|pending)|any (?:problems|issues|trouble)|on track|what do i need to (?:deal|handle|know)|on my plate|the word|quick update|give me an update|business doing|business going|how is business|tell me where we are|run me through|am i on track|whats the word)\b/,3.2],[/\b(?:update|everything|anything)\b/,.7]]]
];
function statusScore(c){
 if(/\b(?:why|explain|draft|write|compose|should i (?!follow|reach|check|call|hit|ping)|should we|recommend|suggest|advice|opinion|what do you think|how do i|how should|help me|what did (?!i miss)|what does|when did|did she|did he|did they|what was|what is the best|compare|what do i owe|how much does \w+ owe|how much do i owe)\b/.test(c)||/\b(?:marc|paul|anna|dan|sheri|rebecca|malik|alex|david)\b/.test(c)||/\b(?:did|does|do|has|is|was|will|can) (?!anything\b|anyone\b|anybody\b|everything\b|any\b|we\b|it\b|i\b|you\b|mint\b|the\b|a\b|my\b|our\b|there\b|something\b|someone\b|all\b)[a-z]+ (?:book|pay|paid|owe|text|call|say|send|come|show|want|get|have|need|coming|ready|there)\b/.test(c))return null;
 var sc=[];SC.forEach(function(s){var v=0;s[1].forEach(function(f){if(f[0].test(c))v+=f[1];});sc.push([s[0],v]);});
 var spec=sc.filter(function(x){return x[0]!=='full';}).sort(function(a,b){return b[1]-a[1];}),fl=sc.filter(function(x){return x[0]==='full';})[0];
 var b,s2;
 if(spec[0][1]>=2.5){b=spec[0];s2=spec[1];if(s2[1]>=2.5&&b[1]-s2[1]<1)return null;}
 else if(fl[1]>=2.5)b=fl;
 else return null;
 return {k:'status',topic:b[0],fresh:/\b(?:right now|check again|refresh|live|latest)\b/.test(c)?'true':'',focus:c.slice(0,200)};
}
/* ---- calendar / weather, relaxed ---- */
var CALFRAME=/\bis (?:(?:my|the|this|next|our) )?(?:today|tomorrow|tonight|week|weekend|month|saturday|sunday|monday|tuesday|wednesday|thursday|friday|sat|sun|mon|tue|wed|thu|fri|\w+ \d+|\d+\w*|dec\w*|jan\w*|feb\w*|mar\w*|apr\w*|may|jun\w*|jul\w*|aug\w*|sep\w*|oct\w*|nov\w*)(?: \w+){0,2} (?:open|free|clear|busy|booked)\b|\bhow (?:does|is|do|are) (?:my |the |our )?[\w ]{0,20}(?:look|looking)\b|\b(?:what|who|am i|do i|do we|we got|any|is my|how busy|how does|read|list|tell me|check|show|anything|are we|how is my|lined up|on the books|is there|i have|i am|what i|am i)\b/;
var CALNOUN=/\b(?:calendar|schedule|agenda|appointments?|plans|on the books|booked|free|open|busy|slammed|clear|lined up|scheduled|working|work|customers?|clients?|jobs?|cars|coming in|seeing|what (?:do )?(?:i|you|we) (?:have|got)|what have i got|what am i doing|what is on|what is happening|who do i have|do i have anything|i have anything|how (?:does|is|do|are) (?:my |the |our )?[\w ]{0,20}(?:look|looking)|how busy|lookin|looking|what is good|whats good)\b/;
var WXSTRONG=/\b(?:weather|forecast|outside|freeze|frost|rain\w*|snow\w*|storm\w*|umbrella|temperature|temp|degrees|sunny|windy|cloudy|humid|outlook|sky|showers?|thunder\w*)\b/;
var WXTEMP=/\b(?:cold|hot|warm|chilly|freezing|cool|dry|wet)\b/;
var WXFRAME=/\b(?:is it|will it|will be|going to be|do i need|should i (?:bring|wear|take|expect)|will i need|how (?:cold|hot|warm)|can i (?:wash|detail)|good day to (?:detail|wash)|detail(?:ing)? outside|weather to|nice out|it be)\b/;
function relaxedCW(c,nowMs,raw,fixed){
 var d=resolveDate(c,nowMs);
 var wx=WXSTRONG.test(c)||(WXTEMP.test(c)&&WXFRAME.test(c))||(/\b(?:jacket|coat|umbrella)\b/.test(c)&&/\b(?:do|will|should|can|shall) (?:i|we)\b|\bbring\b|\bwear\b/.test(c))||(/\b(?:can i (?:wash|detail)|good day to (?:detail|wash)|detail(?:ing)? outside)\b/.test(c)&&d);
 if(wx&&!/\b(?:marc|paul|anna|dan|sheri|rebecca|malik)\b/.test(c)&&!/\b(?:jobs?|customers?|booked|calendar|schedule)\b/.test(c)){var it=wxIntent(c,nowMs);if(it)return it;var dd=d||{start:todayStr(nowMs),end:todayStr(nowMs),single:true};return {k:'weather',start:dd.start,end:dd.end,single:!!dd.single,wants:/\brain|umbrella|wet|dry|shower|storm\b/.test(c)?'rain':/\bsnow|ice\b/.test(c)?'snow':/\bjacket|coat|cold|hot|warm|temp|degrees|cool|chilly|freezing\b/.test(c)?'temp':'',night:!!dd.night};}
 if(d&&(CALFRAME.test(c)||CALFRAME.test(fixed||''))&&CALNOUN.test(c)&&!/\b(?:how many|what is booked|who is booked|deposits?|unpaid|owes?|leads?|followup)\b/.test(c)&&!/\b(?:weather|forecast|on fire|fires?)\b/.test(c)){return {k:'cal',start:d.start,end:d.end,single:!!d.single,free:/\b(?:free|busy|open|available|clear|slammed)\b/.test(c)};}
 return null;
}
/* ---- main v2 understanding (stateless) ---- */
function aliasC(c,nowMs){
 var m,rest;
 if(/^what is happening(?: mint| mind| man| bro)(?: ya know| eh| tho)?$/.test(c))return 'what is up';
 if(/^what is up with the business$|^what is the story$|^what is new with the business$/.test(c))return 'give me the rundown';
 if(/^who is new$/.test(c))return 'any new leads';
 if(/^(?:do you know )?what time it is$/.test(c))return 'what time is it';
 if(/^anything low(?: in the shop)?$/.test(c))return 'what is low on inventory';
 if(/^is everything (?:working|running|ok|okay|good)$/.test(c))return 'is the system running ok';
 if(/^what kinds? of things can i ask$/.test(c))return 'what can you do';
 if(/^who have i not (?:talked|spoken|texted) to in a while$/.test(c))return 'who needs a follow up';
 if(/^any new quote requests?$/.test(c))return 'any new leads';
 if(/^(?:any )?news$|^(?:give me |gimme )?(?:an? )?update$|^(?:is there )?anything (?:i should|to|i need to) worry about$|^what needs my attention$|^(?:is there )?anything i need to (?:handle|know|deal with)$|^any fires?(?: to put out)?$|^where are we at$|^how did we do$|^what is the word$|^what is the latest$/.test(c))return 'give me the rundown';
 if((m=/^(?:anybody|anyone|anything|got anything|have anything|is there anything|any(?:thing)? ?else) (?:scheduled|happening|going on|on|planned|booked|on the books)(?: (?:for|on))? (.+)$/.exec(c))||(m=/^(?:got|have|you got) anything (.+)$/.exec(c))||(m=/^show me (.+)$/.exec(c))||(m=/^what is my (.+) like$/.exec(c))||(m=/^pull up my (?:schedule|calendar|agenda)(?: for| on)? (.+)$/.exec(c))){
  rest=m[1].replace(/\b(?:please|pls|thanks|asap|real quick|if you can)\b/g,'').replace(/\s+/g,' ').trim();
  try{if(rest&&resolveDate(' '+rest+' ',nowMs))return 'what is on '+rest;}catch(e){}
 }
 if((m=/^what is the (?:high|low|temp|temperature) (.+)$/.exec(c)))return 'what is the weather '+m[1];
 if((m=/^should i (?:dress|bundle up|wear (?:a )?(?:coat|jacket)|dress warm|dress warmly)(?: warm| warmly)? (.+)$/.exec(c)))return 'is it cold '+m[1];
 return c;
}
function understand(raw,ctx,st){
 ctx=ctx||{};var nowMs=ctx.nowMs||Date.now();
 var u=understandClean(raw);if(!u.n0)return null;
 var c=u.c,fixed=u.fixed,L=lite(fixed);
 c=aliasC(c,nowMs);
 if(isAction(c,fixed)||isAction(lite(fixed),fixed)||/\b(?:tell|talk) me about\b|\bsummari[sz]e\b|\bwalk me through\b/.test(fixed))return null;
 var r=null;var cands=[L,lite(c)];if(/^hello /.test(L))cands.push(L.slice(6));if(/^ok /.test(L))cands.push(L.slice(3));if(/^ok hello /.test(L))cands.push(L.slice(9));var Lg=L.replace(/^(?:(?:hello|good morning|good afternoon|good evening|good day|morning|evening|afternoon) )+/,'');if(Lg&&Lg!==L)cands.push(Lg);cands.forEach(function(x){if(!r&&x)r=conv(x,fixed,c,ctx,st);});if(r)return r;
 r=mathUnits(c,raw,ctx,nowMs)||mathUnits(fixed,raw,ctx,nowMs);if(r)return r;
 r=relaxedCW(c,nowMs,raw,fixed);
 if(r)return r;
 var ca=c.replace(/^(?:a )?quick (?:update|rundown|status)(?: please)?$/,'give me the rundown').replace(/^where (?:do )?things (?:stand|at)$/,'how is everything looking').replace(/^(?:any )?open quotes?$/,'any new leads').replace(/^(?:any )?(?:new )?customers? (?:asking|waiting|texting|messaging)$/,'any new leads').replace(/^(?:who|which customers?) (?:do i need to|should i|need to|do i have to) (?:check in with|nudge|circle back with)$/,'who needs a follow up').replace(/^which customers? need(?:s)? (?:a )?(?:nudge|check in|follow up)$/,'who needs a follow up');
 if(ca!==c){r=statusScore(ca);if(r)return r;var r2=intent1(ca,{nowMs:nowMs,name:ctx.name,lastWasQuestion:false});if(r2&&r2.k==='status')return r2;}
 r=statusScore(c);if(r)return r;
 var r1=intent1(c,{nowMs:nowMs,name:ctx.name,lastWasQuestion:false});
 if(r1&&(r1.k==='cal'||r1.k==='weather'||r1.k==='wxplace'))return r1;
 if(r1&&r1.k==='reply'&&/\b(?:days? (?:until|till|to|before)|what (?:day|date) (?:is|will be|falls))\b/.test(c)){r1.kind='date';return r1;}
 return null;
}
function mathUnits(c,raw,ctx,nowMs){
 if(/\b(?:marc|paul|anna|dan|sheri|rebecca|malik|owes?|owe|deposit|invoice|quote|price)\b/.test(c))return null;
 var cc=c.replace(/\bmultipl(?:y|ied) by\b/g,'times').replace(/\b(?:add)\s+(\d+(?:\.\d+)?)\s+and\s+(\d+(?:\.\d+)?)\b/,'$1 plus $2').replace(/\ba quarter of\b/,'25 percent of').replace(/\bhalf of\b/,'50 percent of').replace(/\bwhat is (\d+) cubed\b/,'what is $1 times $1 times $1').replace(/\btip on (\d+(?:\.\d+)?) at (\d+) percent\b/,'$2 percent of $1').replace(/\bwhat is (\d+) (?:in|into) (\d+)\b/,'$1 times $2');
 cc=cc.replace(/^how many ([a-z ]+?) (?:are |is )?(?:in|per|is|are) (?:a |an |one )?(\d+(?:\.\d+)?)? ?([a-z ]+)$/,function(m,x,n,y){return (n||'1')+' '+y.replace(/^(?:a|an|one) /,'')+' in '+x;});
 var u=unitAnswer(cc);if(u)return {k:'reply',text:u.text+'.',kind:'unit',expr:cc};
 var m=mathAnswer(cc);if(m)return {k:'reply',text:m.text+'.',math:true,kind:'math',expr:cc};
 return null;
}
/* ---- conversation state shared by desktop, phone and SMS ---- */
var TOPIC_AGE=25*60000,DATEFU_KINDS={weather:1,cal:1};
function newState(){return {v:2,topics:[],options:null,pendingQ:false,lastQ:'',lastA:'',lastAssistant:'',lastAssistantAt:0,lastKind:'',lastAt:0,at:0,hint:''};}
function serialize(st){try{return JSON.stringify(st);}catch(e){return '';}}
function restore(s){try{var o=typeof s==='string'?JSON.parse(s):s;if(o&&o.v===2){var n=newState();for(var k in n)if(o[k]!==undefined)n[k]=o[k];return n;}}catch(e){}return newState();}
function parseOptions(text){
 var opts=[],m,re=/(?:^|[\s(])(?:(\d)[.)]|([A-Da-d])[.)])\s*([^\n\d)]{3,90}?)(?=\s+(?:\d[.)]|[A-Da-d][.)])\s|[.?!]\s|\n|$)/g;
 while((m=re.exec(text))){opts.push(m[3].trim());}
 return opts.length>=2?opts.slice(0,6):null;
}
function noteAssistant(st,text,nowMs){
 text=String(text||'');nowMs=nowMs||Date.now();
 st.lastAssistant=text.slice(0,600);st.lastAssistantAt=nowMs;st.at=nowMs;
 st.pendingQ=/\?\s*$/.test(text.trim())||/\b(?:reply yes|reply y|confirm|want me to|should i|shall i|would you like me to)\b/i.test(text.slice(-160));
 var o=parseOptions(text);if(o)st.options=o;
}
function deriveFromChat(chat,nowMs){ /* rebuild enough state from owner_chat lines (epoch|src|Q|A) so SMS continues what desktop/phone started */
 var st=newState();nowMs=nowMs||Date.now();
 var lines=String(chat||'').split('\n').filter(Boolean).slice(-12);
 lines.forEach(function(l){var p=l.split('|');if(p.length<4)return;var at=+p[0],q=p[2],a=p.slice(3).join('|');if(!at||!q)return;if(nowMs-at>TOPIC_AGE)return;
  var r=understand(q,{nowMs:at},null);
  if(r&&(r.k==='weather'||r.k==='cal'||r.k==='status'||r.k==='reply')){pushTopic(st,q,r,at);}
  noteAssistant(st,a,at);if(!(r&&r.k==='reply'&&r.kind==='joke'))st.lastKind=r?(r.kind||r.k):'';st.lastQ=q;st.at=at;});
 return st;
}
function pushTopic(st,q,r,at){
 if(!r)return;st.lastAt=at||st.lastAt;st.lastKind=r.kind||r.k;
 if(r.k==='weather'||r.k==='cal'||r.k==='status'||(r.k==='reply'&&(r.kind==='math'||r.kind==='unit'))){
  var t={kind:r.kind||r.k,k:r.k,topic:r.topic,wants:r.wants,start:r.start,end:r.end,single:r.single,free:r.free,night:r.night,expr:r.expr,q:q,at:at};
  st.topics.push(t);if(st.topics.length>8)st.topics.shift();
 }
}
var FU_LEAD2=/^(?:and|so|then|but|ok|now|also|sorry|no|nope|wait|actually|instead|oops|my bad|um|uh|what about|how about|what if|what of|and what about|and how about|how about for|what about for|ok and|and for|for|on|try|check|back to|going back to|returning to|ok back to|same for|same on|same thing for|let me change that to|change (?:it )?to|make it|switch to|i meant|i mean|i said|no i meant|no wait|not|and then)\b[ ,]*(.*)$/;
function lastDated(st,nowMs){for(var i=st.topics.length-1;i>=0;i--){var t=st.topics[i];if(nowMs-t.at>TOPIC_AGE)break;if(DATEFU_KINDS[t.k])return t;}return null;}
function lastTopic(st,nowMs){var t=st.topics[st.topics.length-1];return t&&nowMs-t.at<=TOPIC_AGE?t:null;}
function lastSegmentDate(rest,nowMs){
 var segs=rest.split(/,|\bbut\b|\bi meant\b|\bmeant\b|\bmake it\b|\bsorry\b|\bno wait\b|\bwait\b/).map(function(s){return s.replace(/\bnot [a-z0-9 ]+$/,'').trim();}).filter(Boolean);
 for(var i=segs.length-1;i>=0;i--){var d=resolveDate(' '+segs[i]+' ',nowMs);if(d)return d;}
 return resolveDate(' '+rest+' ',nowMs);
}
var DATEONLY=/^(?:(?:the|on|for|this|next|of|at|in|and|a|am|pm|\d+(?:st|nd|rd|th)?|today|tomorrow|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|sat|sun|mon|tue|wed|thu|fri|jan\w*|feb\w*|mar\w*|apr\w*|may|jun\w*|jul\w*|aug\w*|sep\w*|oct\w*|nov\w*|dec\w*|weekend|week|month|morning|evening|afternoon|noon|night|later|then|though|tho|instead|too) ?)+$/;
function followUp2(st,raw,u,ctx,nowMs){
 var c=lite(strip(u.fixed).replace(/^(?:quick question|real quick|actually),? /,'')||u.fixed);var words=c.split(' ').length;if(words>11)return null;
 var m=FU_LEAD2.exec(u.fixed)||FU_LEAD2.exec(c),rest=m?lite(m[1])||c:c;var lead=!!m;
 rest=rest.replace(/\b(?:though|tho|then|too|instead|please|also|again|right|ya know|you know|eh|like|um|uh)\b/g,' ').replace(/\s+/g,' ').trim();
 var lt=lastTopic(st,nowMs);
 if(!lt)return null;
 /* topic switch by noun: "and leads?" after a status answer */
 if(lt&&lt.k==='status'){
  var tp=null;
  if(/\b(?:leads?|inquir\w+|prospects?|quotes?)\b/.test(rest))tp='leads';else if(/\bfollowups?\b/.test(rest))tp='followups';else if(/\b(?:deposits?|jobs?|bookings?|unpaid)\b/.test(rest))tp='jobs';else if(/\b(?:inventory|supplies|stock)\b/.test(rest))tp='inventory';else if(/\b(?:system|errors?|automations?|failures?)\b/.test(rest))tp='health';
  if(tp&&(lead||/^tell me more|^more on|^what about|^now/.test(c)||words<=4))return {k:'status',topic:tp,fresh:'',focus:rest,follow:true};
  var mm=c.match(/^(?:tell me )?more (?:about|on) (?:the )?(.+)$/);if(mm){var o=statusScore(mm[1]);if(o)return Object.assign(o,{follow:true});}
 }
 /* explicit domain word in a follow-up: "and the weather thursday?" "my calendar saturday" */
 var d=lastSegmentDate(rest,nowMs);
 if(lead||words<=4){
  var wantsW=/\b(?:weather|forecast|rain|snow|temp|temperature)\b/.test(rest),wantsC=/\b(?:calendar|schedule|agenda|appointments?|jobs?|booked|free|busy)\b/.test(rest);
  var base=lastDated(st,nowMs);
  if(wantsW&&!wantsC){var wt=null;for(var i=st.topics.length-1;i>=0;i--)if(st.topics[i].k==='weather'){wt=st.topics[i];break;}var dd=d||(base?{start:base.start,end:base.end,single:base.single}:{start:todayStr(nowMs),end:todayStr(nowMs),single:true});return {k:'weather',start:dd.start,end:dd.end,single:!!dd.single,wants:wt?wt.wants:'',night:!!(d&&d.night),follow:true};}
  if(wantsC&&!wantsW){var dd2=d||(base?{start:base.start,end:base.end,single:base.single}:{start:todayStr(nowMs),end:todayStr(nowMs),single:true});return {k:'cal',start:dd2.start,end:dd2.end,single:!!dd2.single,free:/\b(?:free|busy)\b/.test(rest),follow:true};}
  if(d&&base&&(rest.split(' ').length<=5)&&!/\b(?:times|plus|minus|divided|percent)\b/.test(rest)){
   if(base.k==='weather')return {k:'weather',start:d.start,end:d.end,single:!!d.single,wants:base.wants,night:!!d.night,follow:true};
   if(base.k==='cal')return {k:'cal',start:d.start,end:d.end,single:!!d.single,free:base.free,follow:true};
  }
 }
 /* time/date follow-up after another reply */
 if(/^(?:and )?(?:what about )?(?:the )?(?:time|date|day)$/.test(rest)&&lead){return say(/time/.test(rest)?'time':'date',ctx);}
 /* math chains */
 var mt=null;for(var j=st.topics.length-1;j>=0;j--){if(nowMs-st.topics[j].at>TOPIC_AGE)break;if(st.topics[j].kind==='math'){mt=st.topics[j];break;}if(st.topics[j].kind==='unit'){mt=st.topics[j];break;}}
 if(mt&&lt&&(lt.kind==='math'||lt.kind==='unit')){
  var rr=restCmd(rest,mt,lead);if(rr)return rr;
 }
 return null;
}
function restCmd(rest,mt,lead){
 var ex=mt.expr||'';
 if(mt.kind==='unit'){
  var um=rest.match(/^(\d+(?:\.\d+)?)(?: ([a-z ]+))?\??$/);var pm=ex.match(/^(?:convert )?(\d+(?:\.\d+)?)\s*([a-z ]+?)\s+(?:in|to|into)\s+([a-z ]+)$/);
  if(um&&pm){var fr=(um[2]&&um[2].trim())||pm[2];var o=unitAnswer(um[1]+' '+fr+' in '+pm[3]);if(o)return {k:'reply',text:o.text+'.',kind:'unit',expr:um[1]+' '+fr+' in '+pm[3]};}
  return null;
 }
 var pc=ex.match(/^(?:what is )?(\d+(?:\.\d+)?) percent of (\d+(?:\.\d+)?)$/);
 var m1=rest.match(/^(\d+(?:\.\d+)?)(?: percent)?\??$/);
 if(pc&&m1){var o2=mathAnswer(m1[1]+' percent of '+pc[2]);if(o2)return {k:'reply',text:o2.text+'.',kind:'math',math:true,expr:m1[1]+' percent of '+pc[2]};}
 var op=rest.match(/^(?:that |it )?(times|plus|minus|divided by|multiplied by|x)\s+(\d+(?:\.\d+)?)\??$/);
 var prevAns=(mt.ans!==undefined?mt.ans:(mt.q&&mt.res));
 if(op&&mt.res!==undefined){var o3=mathAnswer(mt.res+' '+op[1].replace('multiplied by','times').replace(/^x$/,'times')+' '+op[2]);if(o3)return {k:'reply',text:o3.text+'.',kind:'math',math:true,expr:mt.res+' '+op[1]+' '+op[2]};}
 return null;
}
var NOFU=/\b(?:text|send|message|tell|cancel|move|add|book|remind|delete|refund|charge)\b/;
function converse(st,raw,opts){
 opts=opts||{};var nowMs=opts.nowMs||Date.now();st=st||newState();
 if(st.at&&nowMs-st.at>TOPIC_AGE*2){st.topics=[];st.options=null;st.pendingQ=false;}
 var ctx={nowMs:nowMs,name:opts.name};
 var u=understandClean(raw);var res=null;
 if(!u.n0)return null;
 var L=lite(u.fixed);
 /* teaching, undoing and listing learned phrases: handled here so every surface behaves the same. Never an action. */
 var _ud=LEARNAPI.parseUndo(raw);if(_ud){var _u=LEARNAPI.undo(opts.learned||[],_ud.target,nowMs);st.at=nowMs;if(!_u.hit.length)return finish(st,raw,{k:'reply',kind:'learn',text:'I do not have a learned phrase to undo.'},nowMs);return finish(st,raw,{k:'reply',kind:'learn',text:'Done. I forgot '+_u.hit.map(function(e){return '"'+e.k+'"';}).join(' and ')+'.',unlearn:_u.hit.map(function(e){return e.id;})},nowMs);}
 if(LEARNAPI.parseList(raw)){var _a=LEARNAPI.active(opts.learned||[]);st.at=nowMs;return finish(st,raw,{k:'reply',kind:'learn',text:_a.length?'I have learned '+_a.length+': '+_a.slice(-6).map(function(e){return '"'+e.k+'" for '+e.m.replace('status:','').replace('cal','calendar');}).join(', ')+'.':'Nothing learned yet.'},nowMs);}
 var _tc=LEARNAPI.teach(raw,nowMs,opts.learned);if(_tc){st.at=nowMs;var _r={k:'reply',kind:'learn',text:_tc.text};if(_tc.ok)_r.learn=_tc.cand;return finish(st,raw,_r,nowMs);}
 /* a pending question from Claude: bare answers, confirmations and option picks belong to Claude (keeps existing confirmations) */
 if(st.pendingQ&&nowMs-st.lastAssistantAt<TOPIC_AGE&&(CONFIRM.test(L)||isAck(L)||/^(?:no|nope|not yet|cancel|stop|never ?mind|forget it|yes|yep|sure|ok|do it)\b/.test(L)||REFFRAG.test(L)||/\b(?:option|number) [a-d1-4]\b/.test(L))){st.at=nowMs;return finish(st,raw,null,nowMs);}
 /* option references against options Claude listed */
 if(st.options&&nowMs-st.lastAssistantAt<TOPIC_AGE&&(/^(?:the |number |option |choice )?(?:first|second|third|fourth|last|1st|2nd|3rd|[a-d]|[1-4])(?: one| option| choice)?$|^(?:the )?(?:cheaper|better|bigger|smaller|other) (?:one|option)$|^(?:option|number) [a-d1-4]$/.test(L)||REFFRAG.test(L))){
  var ix=ordIdx(L);st.hint=ix!==null&&st.options?('Ali is picking option '+(ix<0?st.options.length:ix+1)+': '+st.options[ix<0?st.options.length-1:ix]):'Ali is referring to the options just listed: '+st.options.join(' | ');
  return finish(st,raw,null,nowMs);
 }
 if(!isAction(u.c,u.fixed)&&!isAction(lite(u.fixed),u.fixed)){
  var fu=followUp2(st,raw,u,ctx,nowMs);if(fu){res=fu;}
 }
 if(!res)res=understand(raw,ctx,st);
 /* learned phrases only fill gaps, never override and never grant actions */
 if(!res&&opts.learned&&LEARN)res=LEARN.lookup(opts.learned,u,nowMs,st);
 /* fragments that need a topic we do not have */
 if(!res&&!isAction(u.c,u.fixed)&&!isAction(lite(u.fixed),u.fixed)){
  var recentAssist=st.lastAssistantAt&&nowMs-st.lastAssistantAt<5*60000;
  var bare=lite(u.fixed);
  if(PRONCMD.test(bare)||/^(?:cancel|move|send|delete|change|edit|undo|text|call|book|refund|schedule|charge|message|phone)$/.test(bare)){if(!recentAssist)res={k:'ask',text:'Which one, '+(opts.name||'Ali')+'? Tell me what you want to '+(bare.split(' ')[0])+'.'};}
  else if(REFFRAG.test(bare)||REFFRAG.test(u.c)){if(!recentAssist)res={k:'ask',text:'What are you referring to, '+(opts.name||'Ali')+'? I do not have anything on the table.'};}
  else{var d0=lastSegmentDate(bare.replace(FU_LEAD2,'$1')||bare,nowMs);var leadOnly=FU_LEAD2.exec(u.fixed);var rst=(leadOnly?leadOnly[1]:u.fixed).replace(/\b(?:though|tho|then|too|instead|please|also|again)\b/g,' ').replace(/\s+/g,' ').trim();if(d0&&rst.split(' ').length<=4&&!lastDated(st,nowMs)&&resolveDate(' '+rst+' ',nowMs)&&DATEONLY.test(rst)&&!recentAssist){res={k:'ask',text:'For what, '+(opts.name||'Ali')+'? The weather or your calendar?'};}}
 }

 if(opts.onCandidate&&!(res&&res.learned)){try{var cc=LEARNAPI.fromCorrection({prevQ:st.lastQ,prevAt:st.at},raw,nowMs);if(cc&&cc.ok)opts.onCandidate(cc.cand,st.lastQ);}catch(e){}}
 return finish(st,raw,res,nowMs);
}
function finish(st,raw,res,nowMs){
 st.at=nowMs;st.lastQ=raw;
 if(res&&res.k!=='ask'){
  if(res.k==='reply'&&(res.kind==='math'||res.kind==='unit')){var mm=String(res.text||'').match(/(-?[\d,]*\.?\d+)\.?$/);if(mm)res.res=mm[1].replace(/,/g,'');}
  pushTopic(st,raw,res,nowMs);
  if(res.k==='reply'&&res.text){st.lastA=res.text;st.pendingQ=false;}
  if(st.topics.length&&res.res!==undefined)st.topics[st.topics.length-1].res=res.res;
  if(res.k==='reply')st.lastKind=res.kind||'reply';
  if(res.k==='reply'&&res.kind==='joke')st.lastKind='joke';
 }else if(res&&res.k==='ask'){st.lastKind='ask';st.pendingQ=false;}
 else{ /* going to Claude */
  if(NOFU.test(norm(raw))&&!/^(?:tell|give|show) me\b/.test(norm(raw))){st.topics=[];}
 }
 st.lastAt=nowMs;
 return res;
}
function contextFor(st,raw,nowMs){
 /* the smallest useful context to hand Claude along with an unresolved request */
 var out=[];nowMs=nowMs||Date.now();
 if(st.hint){out.push(st.hint);}
 var lt=lastTopic(st,nowMs);if(lt&&(lt.k==='weather'||lt.k==='cal'||lt.k==='status'))out.push('Last topic: '+lt.k+(lt.topic?' '+lt.topic:'')+(lt.start?' '+lt.start+(lt.end&&lt.end!==lt.start?'..'+lt.end:''):'')+'.');
 if(st.lastAssistant&&nowMs-st.lastAssistantAt<TOPIC_AGE)out.push('Your last message: '+st.lastAssistant.slice(0,300));
 return out.join('\n');
}

/* ============ learning loop: owner-only, read-only meanings, validated before use, reversible ============ */
var DATETOK=/^(?:the|on|for|this|next|of|at|in|a|am|pm|\d+(?:st|nd|rd|th)?|today|tomorrow|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|sat|sun|mon|tue|wed|thu|fri|jan\w*|feb\w*|mar\w*|apr\w*|may|jun\w*|jul\w*|aug\w*|sep\w*|oct\w*|nov\w*|dec\w*|weekend|week|month|morning|evening|afternoon|noon|night|later)$/;
var SECRET=/\b(?:code|passcode|password|pass|pin|ssn|social|token|key|secret|otp|login|account number|routing|card number)\b|\d{4,}|@|https?:/;
var LMEAN=/^(?:weather|cal|status:(?:full|followups|leads|jobs|health|inventory)|reply:(?:greet|thanks|bye|joke|time|date|ident|coin|howareyou|whatsup|ack))$/;
function meaningOf(r){if(!r)return null;if(r.k==='weather')return 'weather';if(r.k==='cal')return 'cal';if(r.k==='status'&&r.topic&&/^(?:full|followups|leads|jobs|health|inventory)$/.test(r.topic))return 'status:'+r.topic;if(r.k==='reply'&&r.kind&&/^(?:greet|thanks|bye|joke|time|date|ident|coin|howareyou|whatsup|ack)$/.test(r.kind))return 'reply:'+r.kind;return null;}
function phraseKey(raw){
 var u=understandClean(raw);if(!u.n0)return null;
 var toks=lite(strip(u.fixed)).split(' ').filter(Boolean);
 var hasDate=false;toks=toks.filter(function(t){if(DATETOK.test(t)){if(!/^(?:the|on|for|of|at|in|a|am|pm)$/.test(t))hasDate=true;return false;}return true;});
 return {key:toks.join(' '),hasDate:hasDate,n:toks.length};
}
function tokSim(a,b){var A=a.split(' ').filter(Boolean),B=b.split(' ').filter(Boolean);if(!A.length||!B.length)return 0;var used={},m=0;A.forEach(function(x){for(var j=0;j<B.length;j++){if(used[j])continue;var y=B[j];if(x===y||(x.length>=5&&y.length>=5&&dl(x,y,1)<=1)){used[j]=1;m++;return;}}});return 2*m/(A.length+B.length);}
function jaccard(a,b){var A={},B={},i;a.split(' ').forEach(function(x){if(x)A[x]=1;});b.split(' ').forEach(function(x){if(x)B[x]=1;});var inter=0,uni=0;for(i in A){uni++;if(B[i])inter++;}for(i in B)if(!A[i])uni++;return uni?inter/uni:0;}
function LEADSTRIP(n){n=String(n||'');for(var i=0;i<5;i++){var m=n.replace(/^(?:hey|hi|hello|ok|okay|so|alright|all right|um+|uh+|well|please|mint|m1nt|and|now|actually|listen|just|quick|can you|could you)\s+/,'');if(m===n)break;n=m;}return n.replace(/\s+(?:please|thanks|thank you|ok|okay|mint)$/,'').trim();}
var LEARNAPI={

 /* ---- shared list helpers: used identically by the site and by the owner-SMS router ---- */
 sanitize:function(list){var out=[];(Array.isArray(list)?list:[]).forEach(function(e){if(!e||typeof e.id!=='string'||e.id.length>40||typeof e.k!=='string'||e.k.length>120||!e.k)return;if(!LMEAN.test(e.m||''))return;if(SECRET.test(e.k))return;var st=e.st==='validated'?'validated':'candidate';out.push({id:e.id,k:e.k,m:e.m,d:e.d?1:0,st:st,off:e.off?1:0,offAt:+e.offAt||0,at:+e.at||0,src:String(e.src||'').slice(0,12),hits:+e.hits||0});});return out;},
 merge:function(a,b){
  var by={},order=[];
  LEARNAPI.sanitize((a||[]).concat(b||[])).forEach(function(e){var o=by[e.id];if(!o){by[e.id]=e;order.push(e.id);return;}o.off=(o.off||e.off)?1:0;o.offAt=Math.max(o.offAt||0,e.offAt||0);if(e.st==='validated')o.st='validated';o.at=Math.max(o.at||0,e.at||0);o.hits=Math.max(o.hits||0,e.hits||0);});
  var list=order.map(function(i){return by[i];});
  var tomb={};list.forEach(function(e){if(e.off){var g=e.k+'|'+e.m;tomb[g]=Math.max(tomb[g]||0,e.offAt||e.at||1);}});
  list.forEach(function(e){if(!e.off&&e.at<=(tomb[e.k+'|'+e.m]||0)){e.off=1;e.offAt=tomb[e.k+'|'+e.m];}});
  var seen={},keep=[];list.sort(function(x,y){return (x.at||0)-(y.at||0);}).forEach(function(e){var g=e.k+'|'+e.m;if(!e.off){if(seen[g])return;seen[g]=1;}keep.push(e);});
  var act=keep.filter(function(e){return !e.off;}).slice(-150),offl=keep.filter(function(e){return e.off;}).slice(-150);
  return act.concat(offl);
 },
 active:function(list){return (list||[]).filter(function(e){return e&&e.st==='validated'&&!e.off&&LMEAN.test(e.m||'');});},
 undo:function(list,target,nowMs){
  nowMs=nowMs||Date.now();var act=LEARNAPI.active(list),ids={};
  if(target==='last'){var l=act.slice().sort(function(a,b){return (a.at||0)-(b.at||0);}).pop();if(l)ids[l.id]=1;}
  else if(typeof target==='string'&&/^L[0-9a-z]+$/.test(target)){ids[target]=1;}
  else if(typeof target==='string'){var k=phraseKey(target);k=k&&k.key;act.forEach(function(e){if(k&&(e.k===k||tokSim(e.k,k)>=0.85))ids[e.id]=1;});}
  var hit=[];var out=(list||[]).map(function(e){if(e&&ids[e.id]&&!e.off){hit.push(e);return Object.assign({},e,{off:1,offAt:nowMs});}return e;});
  return {list:out,hit:hit};
 },
 /* "when I say X I mean the weather" / "remember that X means my calendar" */
 parseTeach:function(raw){
  var n=LEADSTRIP(norm(raw));var m=/^(?:mint )?(?:when(?:ever)? i say|if i say|if i ask|when i ask) (.{3,80}?),? (?:i mean|i want|it means|that means|show me|give me|check|pull up|use|treat it as|answer with|that is|that is the same as)\s+(.{3,80})$/.exec(n)||/^(?:mint )?(?:remember|learn|note|teach (?:you|mint)|please remember|please learn)(?: that| this)? (.{3,80}?) (?:means|mean|is the same as|is another way of saying|is code for|equals) (.{3,80})$/.exec(n);
  return m?{phrase:m[1].replace(/^(?:the (?:phrase|words?) )/,'').trim(),target:m[2].trim()}:null;
 },
 targetMeaning:function(t,nowMs){
  t=String(t||'');
  if(/\b(?:weather|forecast|temperature)\b/.test(t))return 'weather';
  if(/\b(?:calendar|schedule|agenda|appointments?)\b/.test(t))return 'cal';
  if(/\bfollow ?ups?\b|\bfollowup\b/.test(t))return 'status:followups';
  if(/\bleads?\b/.test(t))return 'status:leads';
  if(/\b(?:jobs?|deposits?|bookings?)\b/.test(t))return 'status:jobs';
  if(/\binventory|supplies\b/.test(t))return 'status:inventory';
  if(/\b(?:health|system|automations?|workflows?)\b/.test(t))return 'status:health';
  if(/\b(?:rundown|everything|status|briefing|overview|business)\b/.test(t))return 'status:full';
  if(/\bjoke\b/.test(t))return 'reply:joke';
  if(/\btime\b/.test(t))return 'reply:time';
  var r=understand(t,{nowMs:nowMs||Date.now()},null);return meaningOf(r);
 },
 /* full teach pipeline: parse, resolve meaning, refuse unsafe wording, validate. Pure: the host decides where to store. */
 teach:function(raw,nowMs,learned){
  nowMs=nowMs||Date.now();var pt=LEARNAPI.parseTeach(raw);if(!pt)return null;
  var m=LEARNAPI.targetMeaning(pt.target,nowMs);
  if(!m)return {ok:false,text:'I can learn new wording for the weather, your calendar, status reports, jokes and the time. Which of those did you mean?'};
  var c=LEARNAPI.candidate(pt.phrase,m,'teach',nowMs);
  if(!c.ok){
   if(c.why==='already understood')return {ok:false,text:'I already understand "'+pt.phrase+'" that way.'};
   if(c.why==='action wording is never learned')return {ok:false,text:'I can only learn wording for lookups. Texting, booking, cancelling and refunds always need your normal confirmation, so I will not learn those.'};
   return {ok:false,text:'I could not learn that one ('+c.why+'). Try a short plain phrase.'};
  }
  var base=understand(pt.phrase,{nowMs:nowMs},null);var bm=meaningOf(base);
  if(bm&&bm!==m)return {ok:false,text:'I already read "'+pt.phrase+'" as something else, so I will not override it. Pick a different phrase.'};
  var v=LEARNAPI.autoValidate(c.cand,pt.phrase,nowMs);
  if(!v.ok)return {ok:false,text:'That phrase is too close to other things I understand, so I did not save it. Try a more specific one.'};
  c.cand.st='validated';c.cand.q=pt.phrase.slice(0,80);
  return {ok:true,cand:c.cand,text:'Got it. "'+pt.phrase+'" now means '+({weather:'the weather','cal':'your calendar','status:followups':'the follow-ups report','status:leads':'the leads report','status:jobs':'the jobs report','status:inventory':'the inventory report','status:health':'the system check','status:full':'the full rundown','reply:joke':'a joke','reply:time':'the time'}[m]||m)+'. Say "forget that phrase" to undo it.'};
 },
 parseUndo:function(raw){
  var n=LEADSTRIP(norm(raw));
  if(/^(?:mint )?(?:forget|undo|remove|unlearn|delete) (?:that|the last|the latest) (?:phrase|lesson|one i taught you|wording)$|^(?:mint )?unlearn that$|^(?:mint )?forget what i just taught you$/.test(n))return {target:'last'};
  var m=/^(?:mint )?(?:unlearn|forget the phrase|remove the phrase|forget the wording) (.{3,80})$/.exec(n);if(m)return {target:m[1].trim()};
  return null;
 },
 parseList:function(raw){return /^(?:mint )?(?:what (?:phrases )?(?:have|did) (?:you|i) (?:learned?|taught you)|list (?:the )?(?:learned|taught) phrases|show (?:me )?(?:the )?learned phrases|what phrases do you know)$/.test(LEADSTRIP(norm(raw)));},
 /* build a candidate from wording + an existing meaning. Rejects anything that could carry secrets or act on people. */
 candidate:function(raw,meaning,src,nowMs){
  if(!LMEAN.test(meaning||''))return {ok:false,why:'meaning not allowed'};
  var u=understandClean(raw);if(!u.n0)return {ok:false,why:'empty'};
  if(SECRET.test(String(raw)))return {ok:false,why:'looks like it contains a secret or number'};
  if(isAction(u.c,u.fixed)||isAction(lite(u.fixed),u.fixed)||/\b(?:text|send|tell|call|refund|cancel|move|book|charge|pay|delete|forward|email|remind)\b/.test(u.fixed))return {ok:false,why:'action wording is never learned'};
  var k=phraseKey(raw);if(!k||k.n<1||k.n>9||k.key.length<6||(k.n<2&&k.key.length<8))return {ok:false,why:'too short or too long'};
  if((meaning==='weather'||meaning==='cal')&&!k.hasDate&&false)return {ok:false,why:'no date'};
  var base=understand(raw,{nowMs:nowMs||Date.now()},null);
  if(base&&meaningOf(base)===meaning)return {ok:false,why:'already understood'};
  return {ok:true,cand:{id:'L'+(nowMs||Date.now()).toString(36)+Math.floor(Math.random()*1296).toString(36),k:k.key,m:meaning,d:k.hasDate?1:0,src:src||'owner',at:nowMs||Date.now(),st:'candidate',hits:0}};
 },
 /* validate a candidate: should-match paraphrases must resolve; should-not-match negatives must stay unchanged. */
 validate:function(cand,positives,negatives,nowMs){
  var learned=[Object.assign({},cand,{st:'validated'})];nowMs=nowMs||Date.now();
  var pos=0,posOk=0,neg=0,negBad=0,badEx=[];
  (positives||[]).forEach(function(p){pos++;var r=converse(newState(),p,{nowMs:nowMs,learned:learned});if(meaningOf(r)===cand.m)posOk++;});
  (negatives||[]).forEach(function(n){neg++;var base=converse(newState(),n.q,{nowMs:nowMs});var r=converse(newState(),n.q,{nowMs:nowMs,learned:learned});var a=meaningOf(base)||(base&&base.k)||'null',b=meaningOf(r)||(r&&r.k)||'null';if(a!==b){negBad++;if(badEx.length<5)badEx.push(n.q);}});
  var ok=pos>0&&posOk===pos&&negBad===0;
  return {ok:ok,positives:pos,positivesOk:posOk,negatives:neg,negativeChanges:negBad,examples:badEx};
 },
 lookup:function(learned,u,nowMs,st){
  if(!learned||!learned.length)return null;
  if(isAction(u.c,u.fixed)||isAction(lite(u.fixed),u.fixed))return null;
  var k=phraseKey(u.n0);if(!k||!k.key)return null;var best=null,bs=0;
  for(var i=0;i<learned.length;i++){var e=learned[i];if(!e||e.st!=='validated'||e.off||!LMEAN.test(e.m))continue;var sc=e.k===k.key?1:(e.k.split(' ').length>=2?tokSim(e.k,k.key):0);if(sc>=0.85&&sc>bs){best=e;bs=sc;}}
  if(!best)return null;
  var m=best.m,r=null;
  if(m==='weather'||m==='cal'){var d=resolveDate(u.c,nowMs)||resolveDate(u.fixed,nowMs)||{start:todayStr(nowMs),end:todayStr(nowMs),single:true};r=m==='weather'?{k:'weather',start:d.start,end:d.end,single:!!d.single,wants:'',night:!!d.night}:{k:'cal',start:d.start,end:d.end,single:!!d.single,free:false};}
  else if(m.indexOf('status:')===0){r={k:'status',topic:m.slice(7),fresh:'',focus:String(u.n0).slice(0,200)};}
  else if(m.indexOf('reply:')===0){r=say(m.slice(6),{nowMs:nowMs});}
  if(r){r.learned=best.id;}
  return r;
 },
 /* "no, I meant the calendar" right after a wrong or missing answer: previous wording learns the corrected meaning */
 fromCorrection:function(st,raw,nowMs){
  if(!st||!st.prevQ||nowMs-(st.prevAt||0)>TOPIC_AGE)return null;
  var u=understandClean(raw);var m=/^(?:no|nope|wrong|not that|not what i asked|that is not what i asked|thats not it|that is not it|i meant|i mean)\b[ ,]*(?:i (?:meant|mean|want(?:ed)?)|show me|give me|check|the)?\s*(.+)$/.exec(u.fixed);
  if(!m)return null;
  var r=understand(m[1],{nowMs:nowMs},null);var mean=meaningOf(r);if(!mean)return null;
  return LEARNAPI.candidate(st.prevQ,mean,'correction',nowMs);
 },
 autoValidate:function(cand,rawPhrase,nowMs){var pos=[rawPhrase,rawPhrase+' please','hey mint '+rawPhrase,rawPhrase.toUpperCase(),rawPhrase+' tho'];var w=rawPhrase.split(' ').sort(function(a,b){return b.length-a.length;})[0];if(w&&w.length>4){var i=Math.floor(w.length/2);pos.push(rawPhrase.replace(w,w.slice(0,i)+w[i+1]+w[i]+w.slice(i+2)));}if(cand.d)pos.push(rawPhrase+' on saturday');return LEARNAPI.validate(cand,pos,REGSET,nowMs);},
 rollback:function(learned,id){return (learned||[]).map(function(e){if(e&&(e.id===id||id==='last')){if(id==='last'&&e.__skip)return e;return Object.assign({},e,{off:1});}return e;});},
 meaningOf:meaningOf
};
LEARN=LEARNAPI;

/*V2-END*/
