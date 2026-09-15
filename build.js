/*
 * Fabrique docs/ à partir de src/ et tools/.
 *   node build.js
 *
 * Aucune dépendance : Node seul suffit.
 */
const fs = require('fs');
const path = require('path');

const dir  = __dirname;
const src  = path.join(dir, 'src');
const dist = path.join(dir, 'docs');

function read(p){ return fs.readFileSync(p, 'utf8'); }
function write(p, s){
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s);
  console.log('  ' + path.relative(dir, p).padEnd(34) + (s.length/1024).toFixed(1) + ' Ko');
}

fs.rmSync(dist, { recursive: true, force: true });
console.log('Fabrication de docs/ — c est ce dossier que GitHub Pages publie.');

/* ── 1. L'iframe, données et logo inlinés ─────────────────────────────── */
const data = read(path.join(src, 'data-rcf-liege.json')).trim();
const logo = fs.existsSync(path.join(src, 'logo-b64.txt'))
  ? read(path.join(src, 'logo-b64.txt')).trim() : '';

const iframeHtml = read(path.join(src, 'iframe.html'))
  .replace('/*__DATA__*/', data)
  .replace('/*__LOGO__*/', logo);

write(path.join(dist, 'iframe', 'index.html'), iframeHtml);

/* ── 2. La console de test ────────────────────────────────────────────── */
write(path.join(dist, 'index.html'), read(path.join(src, 'console.html')));

/* ── 3. Le diagnostic CORS ────────────────────────────────────────────── */
write(path.join(dist, 'diagnostic', 'index.html'), read(path.join(dir, 'tools', 'cors-test.html')));

/* ── 4. Le banc d'essai — l'iframe sans console réelle ────────────────── */
// L'iframe est embarquée par srcdoc : pas de réseau, pas de question d'origine.
// Le harnais simule les réponses de Radioplayer pour que le protocole soit
// exerçable avant même d'avoir une vraie console sous la main.
const embedded = JSON.stringify(iframeHtml).replace(/<\//g, '<\\/');

write(path.join(dist, 'banc-essai', 'index.html'), `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Banc d'essai — iframe RCF Liège</title>
<style>
:root{
  --rcf:#E2001A;--bg:#F4F4F6;--panel:#FFFFFF;--ink:#16181D;--muted:#6B7078;
  --line:#E4E4EA;--logbg:#14161B;--logink:#C9CEDA;
}
@media (prefers-color-scheme:dark){
  :root{--bg:#0E1014;--panel:#181B21;--ink:#ECEDF0;--muted:#969BA6;
        --line:#282C35;--logbg:#0A0C10;--logink:#AEB6C4}
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
  font:14px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  padding-block:22px;padding-left:18px;padding-right:18px}
.wrap{max-width:1180px;margin:0 auto}
h1{font-size:19px;margin:0 0 3px;letter-spacing:-.01em}
.sub{color:var(--muted);font-size:13px;margin:0 0 18px;max-width:66ch}
.bar{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px}
.btn{font:inherit;font-size:12.5px;padding:6px 12px;border-radius:7px;
  border:1px solid var(--line);background:var(--panel);color:var(--ink);cursor:pointer}
.btn[aria-pressed="true"]{background:var(--rcf);border-color:var(--rcf);color:#fff}
.btn.ghost{background:transparent}
.grid{display:flex;flex-wrap:wrap;gap:18px;align-items:flex-start}
.stage{background:var(--panel);border:1px solid var(--line);border-radius:12px;
  padding:12px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.stage-h{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);
  margin-bottom:9px;display:flex;justify-content:space-between;gap:10px}
.stage-h b{color:var(--rcf);font-weight:700}
iframe{border:1px solid var(--line);border-radius:8px;background:#fff;display:block;max-width:100%}
.side{flex:1 1 340px;min-width:0;display:flex;flex-direction:column;gap:18px}
.log{background:var(--logbg);color:var(--logink);border-radius:10px;padding:11px 13px;
  font:11.5px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;
  height:330px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere}
.log .t{color:#6E7684}.log .out{color:#7FD1A4}.log .in{color:#8AB6FF}.log .nav{color:#FFC46B}
.note{background:var(--panel);border:1px solid var(--line);border-radius:12px;
  padding:13px 15px;font-size:12.5px;color:var(--muted)}
.note h2{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink);margin:0 0 7px}
.note ul{margin:0;padding-left:17px}.note li{margin-bottom:5px}.note b{color:var(--ink);font-weight:600}
@media (max-width:760px){.stage{width:100%}iframe{width:100%!important}}
</style>
</head>
<body>
<div class="wrap">
  <h1>Banc d'essai — iframe RCF Liège</h1>
  <p class="sub">La console Radioplayer est simulée ici. Le son n'appartient pas à l'iframe :
  chaque commande part en <code>postMessage</code>, et le journal montre ce qui circule
  dans les deux sens.</p>

  <div class="bar">
    <button class="btn" id="bCol" aria-pressed="true">Colonne 300 × 507</button>
    <button class="btn" id="bFull" aria-pressed="false">Pleine largeur × 507</button>
    <button class="btn ghost" id="bReload">Recharger</button>
    <button class="btn ghost" id="bClear">Vider le journal</button>
  </div>

  <div class="grid">
    <div class="stage" id="stage">
      <div class="stage-h"><span id="dim">300 × 507</span><b id="mode">widgetOverrides</b></div>
      <iframe id="fr" width="300" height="507" title="Iframe RCF Liège"></iframe>
    </div>
    <div class="side">
      <div class="log" id="log"></div>
      <div class="note">
        <h2>Ce que le banc vérifie</h2>
        <ul>
          <li><b>La géométrie.</b> 300 × 507 est la fente mesurée sur la console 1RCF en production ; elle ne bouge pas avec la fenêtre. La page défile à l'intérieur.</li>
          <li><b>Le protocole.</b> <code>RequestPlay</code>, <code>RequestPause</code>, <code>RequestSkipToLive</code> partent ; <code>PlayMessage</code>, <code>PauseMessage</code>, <code>NowPlayingMessage</code> reviennent.</li>
          <li><b>La lecture à la demande.</b> Aucun message ne charge un épisode : le journal affiche l'URL <code>?rpOdId=</code> que la console devrait charger.</li>
          <li><b>Le changement de station.</b> Il charge la console de l'autre station, comme le fait Radioplayer.</li>
        </ul>
      </div>
    </div>
  </div>
</div>
<script>
var SRC = ${embedded};
var fr = document.getElementById('fr'), logEl = document.getElementById('log');
function stamp(){var d=new Date();return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+':'+('0'+d.getSeconds()).slice(-2);}
function line(k,t){var s=document.createElement('div');
  s.innerHTML='<span class="t">'+stamp()+'</span> <span class="'+k+'">'+
    t.replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})+'</span>';
  logEl.appendChild(s); logEl.scrollTop=logEl.scrollHeight;}
function load(){ logEl.innerHTML=''; fr.srcdoc=SRC; line('t','iframe chargée'); }
window.addEventListener('message', function(e){
  var m=e.data; if(!m||typeof m!=='object'||!m.type) return;
  var w=fr.contentWindow;
  if(m.type==='__DebugLog'){
    if(/navigation console/.test(m.label||'')) line('nav','⇢ la console devrait charger  '+(m.payload&&m.payload.url));
    if(/changement de station/.test(m.label||'')) line('nav','⇢ '+(m.label)+'  '+JSON.stringify(m.payload));
    return;
  }
  if(m.type==='__IframeReady'){ line('in','← iframe prête  (station '+m.station+', rpId '+m.rpId+')'); return; }
  if(m.type==='__RequestStationChange'){ line('nav','⇢ la fenêtre du dessus devrait charger  '+m.url); return; }
  line('out','→ '+m.type+(m.odId?'  odId='+m.odId:''));
  if(m.type==='RequestPlay'){
    setTimeout(function(){ w.postMessage({type:'PlayMessage'},'*'); line('in','← PlayMessage');
      setTimeout(function(){ w.postMessage({type:'NowPlayingMessage',title:'RCF Liège',artist:'103.0 FM'},'*');
        line('in','← NowPlayingMessage  « RCF Liège — 103.0 FM »'); },700); },450);
  }
  if(m.type==='RequestPause'){
    setTimeout(function(){ w.postMessage({type:'PauseMessage'},'*'); line('in','← PauseMessage'); },120);
  }
  if(m.type==='__RequestOnDemand'){
    line('nav','   (dans la vraie console, la page est rechargée — l\\'iframe repart de zéro)');
  }
});
function setMode(full){
  document.getElementById('bCol').setAttribute('aria-pressed',String(!full));
  document.getElementById('bFull').setAttribute('aria-pressed',String(full));
  document.getElementById('mode').textContent = full ? 'widgets: ["IF"]' : 'widgetOverrides';
  if(full){ fr.removeAttribute('width'); fr.style.width='100%';
    document.getElementById('stage').style.flex='1 1 100%';
    document.getElementById('dim').textContent='pleine largeur × 507';
  } else { fr.style.width='300px'; fr.setAttribute('width','300');
    document.getElementById('stage').style.flex='0 0 auto';
    document.getElementById('dim').textContent='300 × 507'; }
}
document.getElementById('bCol').addEventListener('click',function(){setMode(false)});
document.getElementById('bFull').addEventListener('click',function(){setMode(true)});
document.getElementById('bReload').addEventListener('click',load);
document.getElementById('bClear').addEventListener('click',function(){logEl.innerHTML=''});
load();
</script>
</body>
</html>`);

console.log('Terminé.');

/* ── 5. La console locale — un seul fichier, à ouvrir par double-clic ──── */
// Le lecteur Radioplayer accepte une iframe en "data:text/html,…" : la console
// 1RCF le fait en production. On s'en sert pour embarquer l'habillage dans la
// page, ce qui évite d'avoir besoin d'un hébergement pour regarder le résultat.
const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(iframeHtml);

write(path.join(dist, 'console-locale.html'), read(path.join(src, 'console.html'))
  .replace('<title>RCF Liège — console de test</title>',
           '<title>RCF Liège — console locale</title>')
  .replace('"iframeSrc": base + "iframe/",',
           '"iframeSrc": ' + JSON.stringify(dataUrl).replace(/<\//g, '<\\/') + ',')
);
