import {readdir,readFile} from 'node:fs/promises';
import {join,extname} from 'node:path';
const failures=[],patterns=[/-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/,/gh[pousr]_[A-Za-z0-9]{30,}/,/github_pat_[A-Za-z0-9_]{30,}/,/AIza[A-Za-z0-9_-]{30,}/,/postgres(?:ql)?:\/\/[^\s]+:[^\s]+@/,/https?:\/\/[^\s]+\/rest\/\d+\/[a-zA-Z0-9]{12,}/];
async function scan(dir){for(const e of await readdir(dir,{withFileTypes:true})){if(['.git','node_modules'].includes(e.name))continue;const p=join(dir,e.name);if(e.isDirectory()){await scan(p);continue;}if(/^\.env/.test(e.name)||/\.(pem|key|p12|sqlite|db|dump|sql\.gz)$/.test(e.name))failures.push(p+': forbidden file');if(['.png','.jpg'].includes(extname(p)))continue;const text=await readFile(p,'utf8');if(patterns.some(re=>re.test(text)))failures.push(p+': credential pattern');}}
await scan('.');if(failures.length){console.error(failures.join('\n'));process.exit(1);}console.log('Public-content check passed');
