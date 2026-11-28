// builds the list of real English words (and simple inflections) that sit within typo distance of a vocabulary word, so repair never rewrites a valid word
const fs=require('fs');
const src=fs.readFileSync(__dirname+'/v2.part.js','utf8');
const m=src.match(/var VOC=\('([^']+)'\)/);const VOC=[...new Set(m[1].split(' ').filter(w=>w.length>=4))];
const dic=fs.readFileSync('/usr/share/hunspell/en_US.dic','utf8').split('\n').slice(1).map(l=>l.split('/')[0].toLowerCase()).filter(w=>/^[a-z]{4,}$/.test(w));
function dl(a,b,max){if(Math.abs(a.length-b.length)>max)return max+1;const la=a.length,lb=b.length,d=[];for(let i=0;i<=la;i++)d[i]=[i];for(let j=0;j<=lb;j++)d[0][j]=j;for(let i=1;i<=la;i++)for(let j=1;j<=lb;j++){const c=a[i-1]===b[j-1]?0:1;d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1);}return d[la][lb];}
function dels(w,k){let cur=new Set([w]);const all=new Set([w]);for(let r=0;r<k;r++){const nx=new Set();for(const x of cur)for(let i=0;i<x.length;i++){const y=x.slice(0,i)+x.slice(i+1);if(!all.has(y)){all.add(y);nx.add(y);}}cur=nx;}return all;}
const idx=new Map();for(const v of VOC){const k=(v.length>=7&&!/(?:ing|ed|ly)$/.test(v))?2:1;for(const d of dels(v,k)){if(!idx.has(d))idx.set(d,[]);idx.get(d).push(v);}}
const V=new Set(VOC),out=new Set();
const forms=new Set(dic);for(const w of dic){const e=w.endsWith('e'),sib=/(?:s|x|z|ch|sh)$/.test(w);if(!w.endsWith('s'))forms.add(w+(sib?'es':'s'));forms.add(e?w+'d':w+'ed');forms.add(e?w.slice(0,-1)+'ing':w+'ing');forms.add(e?w+'r':w+'er');forms.add(w+'ly');}
for(const w of forms){if(V.has(w)||w.length<4||w.length>14)continue;let hit=false;for(const d of dels(w,2)){const c=idx.get(d);if(!c)continue;for(const v of c){const max=(v.length>=7&&!/(?:ing|ed|ly)$/.test(v))?2:1;if(dl(w,v,max)<=max){hit=true;break;}}if(hit)break;}if(hit)out.add(w);}
['tanks','weather','wether'].forEach(w=>out.delete(w));
fs.writeFileSync(__dirname+'/coll.txt',[...out].sort().join(' '));
console.log(out.size,'collision words');
