const N=require('./nlu.js');const NOW=Date.parse('2026-11-27T23:10:00Z');
for(const q of process.argv.slice(2)){const u=N.understandClean?N.understandClean(q):null;console.log(JSON.stringify(q),'=>',JSON.stringify(u),'=>',JSON.stringify(N.converse(N.newState(),q,{nowMs:NOW})));}
