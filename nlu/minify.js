// conservative minifier: drops full-line comments, block comments at line starts, blank lines and indentation. Keeps strings/regexes intact.
const fs=require('fs');let s=fs.readFileSync(__dirname+'/nlu.js','utf8');
s=s.replace(/\/\*[^*][\s\S]*?\*\/\n?/g,m=>/^\/\*V2/.test(m)?'':'').split('\n').map(l=>l.replace(/^\s+/,'')).filter(l=>l&&!/^\/\//.test(l)).join('\n');
fs.writeFileSync(__dirname+'/nlu.min.js',s);console.log('min',s.length);
