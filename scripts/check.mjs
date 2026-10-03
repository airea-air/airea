import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(path.join(d,x.name)):[path.join(d,x.name)]);
const pages=walk('dist').filter(p=>p.endsWith('.html')&&!p.includes('/embeds/'));
let links=0;const missingMedia=new Set();
for(const p of pages){const s=fs.readFileSync(p,'utf8');assert.equal((s.match(/<h1\b/g)||[]).length,1,p+' : h1');assert(!s.includes('{{'),p+' : instruction non résolue');const ids=[...s.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,p+' : identifiants dupliqués');for(const m of s.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g)){const url=new URL(m[1].replaceAll('&amp;','&'),'http://localhost');const target='dist'+decodeURIComponent(url.pathname);if(!fs.existsSync(target)&&url.pathname.startsWith('/Images/')){missingMedia.add(decodeURIComponent(url.pathname));continue;}assert(fs.existsSync(target),`${p} : lien absent ${m[1]}`);links++;}assert(s.includes('name="description"'),p+' : description');}
const home=fs.readFileSync('dist/index.html','utf8'),contact=fs.readFileSync('dist/contact/demande_devis.html','utf8'),recruit=fs.readFileSync('dist/contact/recrutement.html','utf8');
const form=s=>s.match(/<form\b[\s\S]*?<\/form>/)[0];assert.equal(form(home),form(contact),'Formulaires devis identiques');for(const s of [home,contact,recruit]){assert(form(s).includes('data-disconnected'));assert(form(s).includes('type="submit" disabled'));assert(!form(s).includes('action='));}
const blog=fs.readFileSync('dist/blog.html','utf8');assert.equal((blog.match(/class="article-card"/g)||[]).length,14);assert.equal(pages.length,31);assert(fs.readFileSync('dist/embeds/vlep-vlct.html','utf8').includes("'/data/Export_VLEP_VLCT.csv'"));
console.log(`${pages.length} pages HTML (30 + 404), ${links} liens/ressources locaux vérifiés. Blog : 14 articles. Formulaires identiques, envoi désactivé. CSV local.`);

if(missingMedia.size)console.log(`${missingMedia.size} images volontairement absentes. Ajouter les fichiers dans public/Images/, puis reconstruire. Les autres liens et ressources doivent exister.`);
