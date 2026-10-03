import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd(), read=p=>fs.readFileSync(p,'utf8'), esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

const imageSizes=JSON.parse(read('src/data/image-sizes.json'));
function responsive(markup){return markup.replace(/<img\b[^>]*>/g,tag=>{const source=tag.match(/src="([^"]+)"/)?.[1]?.replaceAll('&amp;','&');const info=imageSizes[source];if(!info)return tag;tag=tag.replace(/\s(?:width|height)="[^"\n]*"/g,'');tag=tag.replace('<img',`<img width="${info.width}" height="${info.height}"`);const variants=(info.variants||[]).filter(v=>fs.existsSync('public'+v.src));if(variants.length){const srcset=[...variants,{src:source,width:info.width}].map(v=>`${esc(v.src)} ${v.width}w`).join(', ');tag=tag.replace('<img',`<img srcset="${srcset}" sizes="${tag.includes('fetchpriority')?'100vw':'(max-width: 600px) 92vw, (max-width: 1000px) 80vw, 1000px'}"`);}return tag;});}

// The Marseille video is added separately by the owner; keep its insertion point.
function optionalVideos(markup){return markup.replace(/<video\b[^>]*src="(\/Images\/[^"]+)"[^>]*>[\s\S]*?<\/video>/g,(tag,src)=>fs.existsSync('public'+src.replaceAll('&amp;','&'))?tag:`<!-- Vidéo à ajouter : ${esc(src)} -->`);}
const pages=JSON.parse(read('src/data/pages.json'));
const sources=JSON.parse(read('src/data/source-paragraphs.json'));
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist',{recursive:true});fs.cpSync('public','dist',{recursive:true});
const menuSource=read('src/components/menu-source.html');
let menuCss=menuSource.match(/<style>([\s\S]*?)<\/style>/)[1];
menuCss=menuCss.slice(menuCss.indexOf('/* ---- generated'));
fs.writeFileSync('dist/assets/menu.css',menuCss);
let menu=menuSource.slice(menuSource.indexOf('<div class="htmlmenu-wrapper">'),menuSource.indexOf('<main class="demo-page">'));
menu=menu.replaceAll('https://www.airea-air.com/airea/','/').replace('class="htmlmenu-logo" href="#"','class="htmlmenu-logo" href="/index.html" aria-label="Airea — accueil"').replace('Toggle menu','Ouvrir le menu').replace('aria-label="Main"','aria-label="Navigation principale"').replaceAll('aria-label="Expand"','aria-label="Déplier le sous-menu"');
// Retain the supplied menu design while making its controls keyboard accessible.
menu=menu.replaceAll(' aria-hidden="true" tabindex="-1"','');
menu=menu.replaceAll('<a href="#">','<button class="nav-group" type="button" aria-expanded="false">').replace(/(<button class="nav-group"[^>]*>[^<]*)<\/a>/g,'$1</button>');
const sectors=[['Aménagements urbains','amenagements-urbains','AME'],['Infrastructures routières','amenagements-routiers','AXE'],['Industries','industries','IND'],['Chantiers','chantiers','CHA'],['Défense et armement','defense-armement','ARM'],['Bâtiments','batiments','BAT'],['Conseil et formation','conseil&formation','FOR']];
function form(kind='devis'){
 const hiring=kind==='recrutement',opts=hiring?['Candidature – Poste d’ingénieur.e','Candidature – Poste de technicien.ne','Candidature spontanée']:["Demande d'informations",'Demande de devis'];
 return `<form class="contact-form" data-disconnected aria-describedby="${kind}-status"><div class="form-grid">${[['Prénom','given-name','text'],['Nom','family-name','text'],['Email','email','email'],['Téléphone','tel','tel']].map(([label,auto,type],i)=>`<div><label for="${kind}-${i}">${label}</label><input id="${kind}-${i}" name="${auto}" type="${type}" autocomplete="${auto}" required></div>`).join('')}</div><label for="${kind}-subject">Objet de la demande</label><select id="${kind}-subject" name="subject">${opts.map(o=>`<option>${o}</option>`).join('')}</select><label for="${kind}-file">${hiring?'Importer votre CV':'Importer une pièce-jointe'}</label><input id="${kind}-file" name="attachment" type="file"><label for="${kind}-message">${hiring?'Rédigez vos motivations (sans IA) ici':'Préciser votre demande ici (contexte, localisation…)'}</label><textarea id="${kind}-message" name="message" rows="6" required></textarea><p id="${kind}-status" class="form-notice">L’envoi de ce formulaire n’est pas encore disponible. Aucune donnée n’est transmise.</p><p class="captcha-note">reCAPTCHA sera activé lors de la connexion du formulaire.</p><button class="button" type="submit" disabled>Envoyer</button></form>`;
}
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const logoDirs=fs.existsSync('public/Images')?fs.readdirSync('public/Images').filter(n=>n.startsWith('Logos_')):[];
const logoData=Object.fromEntries(logoDirs.map(dir=>[dir.split('_').at(-1),files('public/Images/'+dir).filter(p=>/\.webp$/i.test(p)).map(p=>({src:p.replace('public',''),hash:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),name:path.basename(p,'.webp').replaceAll('_',' ')}))]));
const logoLinks=fs.existsSync('src/data/logo-links.json')?JSON.parse(read('src/data/logo-links.json')):{};
function logos(code){
 let list=code==='ALL'?Object.values(logoData).flat():logoData[code]||[];
 if(code==='ALL'){list=[...new Map(list.map(x=>[x.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,''),x])).values()];list=[...new Map(list.map(x=>[x.hash,x])).values()].sort((a,b)=>a.hash.localeCompare(b.hash));}
 const n=code==='ALL'?3:1, rows=Array.from({length:n},(_,i)=>list.filter((_,j)=>j%n===i));
 const tile=(x,dup)=>{const url=logoLinks[path.basename(x.src)];return `<${url?'a':'span'} class="logo-tile" ${url?`href="${esc(url)}" target="_blank" rel="noopener noreferrer"`:''} ${dup?'aria-hidden="true"'+(url?' tabindex="-1"':''):''}><img src="${esc(x.src)}" alt="${dup?'':esc(x.name)}" width="170" height="90" loading="lazy"></${url?'a':'span'}>`};
 return `<div class="logo-wall" aria-label="Clients"><button class="logos-pause" type="button" aria-pressed="false">Mettre le défilement en pause</button>${rows.map((row,i)=>`<div class="logo-row ${i%2?'reverse':''}"><div class="logo-track" style="--logo-duration:${Math.max(40,row.length*196/25)}s"><div class="logo-group">${row.map(x=>tile(x,false)).join('')}</div><div class="logo-group" aria-hidden="true">${row.map(x=>tile(x,true)).join('')}</div></div></div>`).join('')}</div>`;
}
function footer(){return `<footer class="site-footer"><div class="footer-grid"><div><a class="footer-brand" href="/index.html">Airea</a><p>Airea - Siège social :<br>5 rue Edmond Michelet<br>93360 Neuilly-Plaisance</p><p>Téléphone : <a href="tel:+33148719010">01 48 71 90 10</a></p><a class="linkedin" href="https://www.linkedin.com/company/11214316" target="_blank" rel="noopener noreferrer" aria-label="Airea sur LinkedIn">in</a></div><div><h2>Secteurs d’activités</h2>${[['Aménagements urbains','amenagements-urbains'],['Infrastructures routières','amenagements-routiers'],['ICPE','industries'],['Chantiers','chantiers'],['Armement et défense','defense-armement'],['Conseil et formation','conseil&formation'],['Radar pollution','rsd']].map(([t,p])=>`<a href="/expertises/${p}.html">${t}</a>`).join('')}</div><div><h2>Outils numériques</h2><a href="/tools/convertisseur.html">Convertir les concentrations<br>dans l’air ambiant</a><span class="footer-unavailable">Calculer vos réductions d'émissions<br>et vos économies réalisées</span><a href="/tools/vlep-vlct.html">Trouver les VLEP et VLCT<br>associé à un polluant</a></div><div><h2>Informations</h2><a href="/entreprise.html">Entreprise</a><a href="/contact/recrutement.html">Recrutement</a><a href="/contact/demande_devis.html">Contact</a><a href="/mentions-legales.html">Mentions légales</a></div></div><div class="footer-bottom"><p>Airea est un bureau d'études indépendant, spécialisé dans la mesure et la modélisation de qualité de l'air.</p><p>© 2026 Cap Environnement SAS</p></div></footer>`;}
function articles(){
 const order=[14,12,13,11,10,9,8,7,6,5,4,3,2,1];
 return `<div class="article-grid">${order.map(num=>pages.find(p=>p.source.includes(`Article${num}_`))).map(p=>{const paras=sources[p.source.replace('.docx','')];const first=paras.find(x=>x.text!==p.title&&!x.text.startsWith('[')&&x.text.length>110)?.text||'';const excerpt=first.match(/^.*?[.!?](?:\s|$)/)?.[0]||first;return `<a class="article-card" href="/${esc(p.route)}">${p.hero?`<img src="${esc(p.hero)}" alt="" loading="lazy" width="640" height="400">`:''}<div><h2>${esc(p.title)}</h2><p>${esc(excerpt)}</p><span class="read-more">Lire l’article <span aria-hidden="true">↗</span></span></div></a>`}).join('')}</div>`;
}
function home(){
 const ps=sources['Airea.Accueil'];
 const from=ps.findIndex(p=>p.text.startsWith('Airea est un bureau')),to=ps.findIndex(p=>p.text.startsWith('[Triptyque'));
 const contact=ps.find(p=>p.text.startsWith('Nos prestations')).html;
 return `<section class="home-hero"><img src="/Images/Airea_mesure_qualite_air.webp" alt="" fetchpriority="high" width="1800" height="1000"><div><h1>L’expertise de<br>la qualité de l’air</h1><a href="#expertises">Découvrir nos domaines d’expertise <span aria-hidden="true">↓</span></a></div></section><section id="expertises" class="section"><h2>Nos expertises</h2><div class="expertise-grid">${sectors.map(([name,slug,c])=>`<a class="expertise-card" href="/expertises/${slug}.html"><img src="/Images/Secteurs/Airea_secteur_${c}.webp" alt="" loading="lazy" width="600" height="400"><h3>${name}<span aria-hidden="true">↗</span></h3></a>`).join('')}</div></section><section class="section company-intro"><h2>Notre société</h2><div class="prose">${ps.slice(from,to).map(p=>`<p>${p.html}</p>`).join('')}</div><div class="values-links">${['Proximité du client','Technicité','Indépendance'].map(t=>`<a href="/entreprise.html#valeurs">${t}<span aria-hidden="true">↗</span></a>`).join('')}</div></section><section class="section clients-section"><h2>Nos clients</h2><p class="section-intro">+500 entreprises font confiance à Airea</p>${logos('ALL')}</section><section class="section"><h2>Nos références</h2><p class="section-intro">+1500 interventions en France et à l’international</p><div class="embed-map"><iframe title="Références Airea en France et à l’international" loading="lazy" height="500" src="https://umap.openstreetmap.fr/fr/map/references-rincent-air_379048?scaleControl=false&miniMap=false&scrollWheelZoom=true&zoomControl=true&allowEdit=false&moreControl=false&searchControl=null&tilelayersControl=false&embedControl=null&datalayersControl=false&onLoadPanel=undefined&captionBar=true&fullscreenControl=false#6/48.006/2.300" allowfullscreen></iframe></div></section><section class="section contact-section"><h2>Contact</h2><div class="contact-layout"><div><p>${contact}</p><h3>Offres d'emploi :</h3><p>Pour postuler, merci de vous rendre sur la <a href="/contact/recrutement.html">page de recrutement</a></p></div>${form()}</div></section>`;
}
function layout(p,content){
 const nav=menu.replace(`href="/${p.route}"`,`href="/${p.route}" aria-current="page"`);
 const hero=p.route==='index.html'?'':`<header class="page-hero ${p.hero&&!p.article?'with-image':''}">${p.hero&&!p.article?`<img src="${esc(p.hero)}" alt="" fetchpriority="high">`:''}<div class="hero-inner"><a class="breadcrumb" href="${p.article?'/blog.html':'/index.html'}">${p.article?'← Blog':'Accueil'}</a><h1>${esc(p.title)}</h1></div></header>`;
 return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.title)} | Airea</title><meta name="description" content="${esc(p.description)}"><link rel="canonical" href="https://www.airea.fr/${esc(p.route==='index.html'?'':p.route)}"><meta property="og:title" content="${esc(p.title)}"><meta property="og:type" content="${p.article?'article':'website'}"><meta property="og:description" content="${esc(p.description)}">${p.hero?`<meta property="og:image" content="https://www.airea.fr${esc(p.hero)}">`:''}<link rel="stylesheet" href="/assets/fonts/fonts.css"><link rel="stylesheet" href="/assets/menu.css"><link rel="stylesheet" href="/assets/site.css"><script src="/assets/site.js" defer></script></head><body class="${p.article?'article-page':''}"><a class="skip-link" href="#main">Aller au contenu</a>${nav}<main id="main">${hero}${content}</main>${footer()}<a class="back-top" href="#main" aria-label="Retour en haut">↑</a></body></html>`;
}
for(const p of pages){
 let body=p.route==='index.html'?home():read('src/pages/'+p.source.replace('.docx','.html'));
 body=body.replaceAll('{{articles}}',articles()).replace(/\{\{form:(.*?)\}\}/g,(_,k)=>form(k)).replace(/\{\{logos:(.*?)\}\}/g,(_,c)=>logos(c));
 if(p.route!=='index.html')body=`<div class="section page-content ${p.article?'article-content':''}">${body}</div>`;
 body=body.replace('<h2><strong>Nos principales valeurs</strong></h2>','<h2 id="valeurs"><strong>Nos principales valeurs</strong></h2>');
 const dest='dist/'+p.route;fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,responsive(layout(p,optionalVideos(body))));
}
for(const [slug,title] of [['convertisseur','Convertisseur de concentrations'],['vlep-vlct','Base de données VLEP et VLCT']]){
 const p={route:'tools/'+slug+'.html',title,description:title+' — outil numérique Airea'};
 fs.mkdirSync('dist/tools',{recursive:true});fs.writeFileSync('dist/'+p.route,layout(p,`<div class="section tool-section"><iframe class="local-embed tool-frame" title="${title}" src="/embeds/${slug}.html"></iframe></div>`));pages.push(p);
}
fs.writeFileSync('dist/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(p=>`<url><loc>https://www.airea.fr/${esc(p.route==='index.html'?'':p.route)}</loc></url>`).join('')+'</urlset>');
fs.writeFileSync('dist/robots.txt','User-agent: *\nAllow: /\nSitemap: https://www.airea.fr/sitemap.xml\n');
fs.writeFileSync('dist/404.html',layout({title:'Page introuvable',description:'Page introuvable',route:'404.html'},'<section class="section"><p>Cette page n’existe pas.</p><a class="button" href="/index.html">Retour à l’accueil</a></section>'));
console.log(`${pages.length} pages construites dans dist/ (+ page 404).`);

const missingMedia=new Set();
for(const file of files('dist').filter(p=>p.endsWith('.html'))){
 const markup=read(file);
 for(const match of markup.matchAll(/(?:src|href)="(\/Images\/[^"#?]+)"/g)){
  const resource=match[1].replaceAll('&amp;','&');
  if(!fs.existsSync('dist'+resource))missingMedia.add('public'+resource);
 }
}
const video='public/Images/Article_RSD_Marseille_video1.mp4';
if(!fs.existsSync(video))missingMedia.add(video);
fs.writeFileSync('dist/medias-manquants.json',JSON.stringify([...missingMedia].sort(),null,2)+'\n');
if(missingMedia.size)console.log(`${missingMedia.size} médias à ajouter : voir dist/medias-manquants.json. Construction terminée.`);
