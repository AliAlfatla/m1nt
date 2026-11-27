const N=require('./nlu.js');
// fixed "now": Fri Nov 27 2026 6:10 PM ET => 2026-11-27T23:10:00Z
const NOW=Date.parse('2026-11-27T23:10:00Z');
let pass=0,fail=0,fails=[];
function T(q,exp,ctx){
  const r=N.intent(q,Object.assign({nowMs:NOW},ctx||{}));
  let got=r?(r.k+(r.topic?':'+r.topic:'')):'null';
  const ok=exp==='*'?!!r:(Array.isArray(exp)?exp.includes(got):got===exp||(exp==='reply'&&got==='reply'));
  if(ok)pass++;else{fail++;fails.push(q+'  => '+got+' (want '+exp+')'+(r&&r.text?' ['+r.text+']':''));}
}
// ---- greetings/acks/thanks/farewells
['hi','hey','hello','hey mint','yo','heyyy','hiya','good morning','morning','gm','good evening mint','howdy','hello mint how are you','what\'s up','sup','whats up mint','how are you','how\'s it going','how you doing','you good?','how\'s your day','hows everything with you'].forEach(q=>T(q,'reply'));
['thanks','thank you','thx','ty','tysm','thanks mint','appreciate it','much appreciated','awesome','perfect','cool','nice','sounds good','got it','will do','ok','okay','k','kk','alright','roger that','noted','makes sense','no worries','great job','you rock','10-4','copy that','thanks a lot','thank you so much'].forEach(q=>T(q,'reply'));
['goodnight','gn','night','good night mint','talk to you later','ttyl','bye','see ya later','have a good night','heading out','later'].forEach(q=>T(q,'reply'));
['who are you','what can you do','help','what can I say','what are your commands','what do you do','commands'].forEach(q=>T(q,'reply'));
['tell me a joke','got any jokes','make me laugh','dad joke','hit me with a joke','cheer me up','tell me a pun','Mint tell me a funny one'].forEach(q=>T(q,['reply','null']));
['flip a coin','heads or tails','coin flip please','roll a die','roll two dice','roll a d20','pick a random number between 1 and 10'].forEach(q=>T(q,'reply'));
// ---- time/date
['what time is it','what\'s the time','got the time?','time?','whats the time rn','tell me the time','what time is it right now mint'].forEach(q=>T(q,['reply','null']));
['what\'s the date','what day is it','what day is today','today\'s date','what date is it','whats todays date'].forEach(q=>T(q,'reply'));
['what day is Christmas','what day is december 25','how many days until christmas','how many days till thanksgiving','how many days until new years'].forEach(q=>T(q,'reply'));
// ---- math
['what is 12 times 12','whats 12 x 12','12*12','12 times 12','twelve times twelve','what\'s twelve times twelve?','what is 15 percent of 80','15% of 80','whats 20% tip on 84','what is 144 divided by 12','144/12','what is 2 plus 2','2+2','two plus two','what is 100 minus 37','100-37','whats 7 squared','what is the square root of 81','sqrt of 144','what is 3.5 times 4','whats a hundred and twenty five times four','what\'s 18 percent of 250','how much is 1,200 divided by 8','calculate 45 plus 55','what is 1000 minus 15 percent','what is 20 percent off 80','split 120 3 ways','what is 2 to the power of 8','eight times seven','nine times nine mint','what\'s 49 over 7','a thousand minus two hundred','what is 5 percent of 1200','whats 33 plus 67 plus 100','what is 12 times 12 times 2','what\'s 250 times 0.15'].forEach(q=>T(q,'reply'));
['what is 5 divided by 0'].forEach(q=>T(q,'reply'));
// ---- units
['convert 60 f to c','what is 72 fahrenheit in celsius','5 miles in km','how many km is 10 miles','100 pounds to kg','how many ounces in 2 pounds','32 degrees c to f','what is 3 gallons in liters','how many cups is 16 oz','12 inches in cm'].forEach(q=>T(q,['reply','null']));
['60 f to c','72 fahrenheit in celsius','5 miles in km','100 pounds in kg','3 gallons in liters','12 inches in cm'].forEach(q=>T(q,'reply'));
// ---- calendar
['what\'s on my calendar tomorrow','whats on my calendar today','what do I have tomorrow','what do i have on saturday','am I free saturday','am i busy tomorrow','what\'s my schedule for monday','my schedule next week','anything on my calendar this weekend','what do I have this week','whats on the schedule dec 3','what\'s on my calendar on December 8th','calendar for friday','what\'s my day look like tomorrow','what is on my calender tomorrow','whats my schedual tmrw','anything on the books for next monday','do I have anything on thursday','am i free on the 3rd','what\'s happening tonight','what\'s on my plate tomorrow','show me my calendar for next week','schedule tomorrow?','what do i got saturday','any appointments tomorrow','my appts for monday','whats on my cal tomorrow'].forEach(q=>T(q,['cal','null']));
['what\'s on my calendar tomorrow','am I free saturday','what do I have tomorrow','what\'s my schedule for monday','whats my schedual tmrw','what is on my calender tomorrow','do I have anything on thursday','any appointments tomorrow','show me my calendar for next week'].forEach(q=>T(q,'cal'));
// ---- weather
['what\'s the weather','weather today','how\'s the weather tomorrow','whats the weather like tomorrow','weather saturday','is it going to rain tomorrow','will it rain today','do i need an umbrella','should i bring a jacket','is it cold out','how cold is it going to be tonight','forecast for the weekend','what\'s the forecast','weather this weekend','what\'s the temp','how hot is it','whats the wether tmrw','is it gonna snow','weather for monday','will it snow tomorrow','what\'s the weather like on saturday','is it nice out','is it going to be cold tomorrow','whats the forcast for friday','how\'s it looking outside','do I need a coat tomorrow'].forEach(q=>T(q,['weather','null']));
['what\'s the weather','weather today','whats the weather like tomorrow','weather saturday','is it going to rain tomorrow','do i need an umbrella','what\'s the forecast','weather this weekend','whats the wether tmrw','will it snow tomorrow','should i bring a jacket','is it going to be cold tomorrow'].forEach(q=>T(q,'weather'));
// ---- status
[['how is everything looking','status:full'],['how\'s everything looking?','status:full'],['what needs me','status:full'],['give me the rundown','status:full'],['anything I need to know','status:full'],['catch me up','status:full'],['how\'s the business doing','status:full'],['what\'s going on','status:full'],['whats going on with the business','status:full'],['any issues','status:full'],['how are we doing','status:full'],['who needs a follow up','status:followups'],['any follow ups due','status:followups'],['who\'s overdue for a follow-up','status:followups'],['follow ups today?','status:followups'],['what follow ups do I have','status:followups'],['any new leads','status:leads'],['who is waiting on me','status:leads'],['how many open leads do I have','status:leads'],['who\'s booked this week','status:jobs'],['which deposits are unpaid','status:jobs'],['any deposits outstanding','status:jobs'],['what jobs do I have','status:jobs'],['is the system running ok','status:health'],['did anything fail today','status:health'],['are you working','status:health'],['did it recover','status:recovery'],['what\'s low on inventory','status:inventory'],['do we need to order anything','status:inventory'],['are we out of towels','status:inventory']].forEach(([q,e])=>T(q,[e,'null']));
['how is everything looking','what needs me','who needs a follow up','any new leads','which deposits are unpaid','did anything fail today','what\'s low on inventory'].forEach(q=>T(q,'*'));
// ---- must NOT be handled locally (actions, other people, money, open-ended)
['text Marc we are running late','tell Rebecca I will be there at 3','send a text to 502 716 2230','cancel my dentist appointment','move my dermatology appointment to friday','add dentist tomorrow at 3pm','remind me to call Paul','remember I prefer mornings','refund Sheri','delete Sheri\'s info','pause Rebecca','resume Marc','move Marc\'s booking to Tuesday','book Anna for saturday at 10','call Paul back','email the quote to Malik','charge his card','put lunch with Dan on my calendar friday noon','schedule a meeting with the accountant monday at 2','what should I say to Sheri','write me a text for Paul about his quote','explain how ceramic coating works','what is the best way to remove water spots','who won the game last night','tell me about my day','when did Rebecca say that','what did Sheri say','how do I price a Tahoe detail','what do you think about raising prices'].forEach(q=>T(q,'null'));
// ---- follow-ups with context
const prevW={q:'what is the weather tomorrow',a:'Tomorrow: ...',ageMs:120000};
['and saturday though?','what about saturday','how about sunday','saturday?','and monday','what about the weekend','no I meant sunday','actually make it friday','and next week?','tuesday tho','what about dec 3','sunday instead'].forEach(q=>T(q,'weather',{prev:prevW}));
const prevC={q:'what\'s on my calendar tomorrow',a:'...',ageMs:60000};
['and saturday?','what about monday','how about this weekend','and next week','no I meant sunday','what about the 3rd'].forEach(q=>T(q,'cal',{prev:prevC}));
['and saturday?','what about monday'].forEach(q=>T(q,'null',{prev:{q:'text Marc we are late',a:'x',ageMs:1000}}));
['saturday?'].forEach(q=>T(q,'null',{prev:{q:'what is the weather tomorrow',a:'x',ageMs:3600000}}));
// ack/yes after a question goes to Claude
['yes','ok','sure','go ahead','sounds good'].forEach(q=>T(q,'null',{lastWasQuestion:true}));
console.log('pass',pass,'fail',fail);fails.forEach(f=>console.log('FAIL',f));
