
const UFS={AC:"Acre",AL:"Alagoas",AP:"Amapá",AM:"Amazonas",BA:"Bahia",CE:"Ceará",DF:"Distrito Federal",ES:"Espírito Santo",GO:"Goiás",MA:"Maranhão",MT:"Mato Grosso",MS:"Mato Grosso do Sul",MG:"Minas Gerais",PA:"Pará",PB:"Paraíba",PR:"Paraná",PE:"Pernambuco",PI:"Piauí",RJ:"Rio de Janeiro",RN:"Rio Grande do Norte",RS:"Rio Grande do Sul",RO:"Rondônia",RR:"Roraima",SC:"Santa Catarina",SP:"São Paulo",SE:"Sergipe",TO:"Tocantins"};
const BASE_OFFICES=[
 {id:"depFederal",cargo:"DEPUTADO FEDERAL",digits:4,proportional:true},
 {id:"depEstadual",cargo:"DEPUTADO ESTADUAL",digits:5,proportional:true},
 {id:"senador1",cargo:"SENADOR",label:"SENADOR — 1ª VAGA",digits:3},
 {id:"senador2",cargo:"SENADOR",label:"SENADOR — 2ª VAGA",digits:3},
 {id:"governador",cargo:"GOVERNADOR",digits:2},
 {id:"presidente",cargo:"PRESIDENTE",digits:2}
];
let state="",data=null,offices=[],step=0,input="",blank=false,votes=[],unlock=false,timer=null,audioCtx=null;
const AUDIO_URLS={
 confirm:new URL("./assets/audio/confirmacao.mp3",document.baseURI).href,
 finish:new URL("./assets/audio/fim.mp3",document.baseURI).href
};
const audioCache={
 confirm:new Audio(AUDIO_URLS.confirm),
 finish:new Audio(AUDIO_URLS.finish)
};
audioCache.confirm.preload="auto"; audioCache.finish.preload="auto";
audioCache.confirm.load(); audioCache.finish.load();
window.VOTASIM_PHOTOS=window.VOTASIM_PHOTOS||{};
const $=q=>document.querySelector(q), esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function toast(s){const t=$("#toast");t.textContent=s;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
function isPhone(){
 if(navigator.userAgentData&&typeof navigator.userAgentData.mobile==="boolean")return navigator.userAgentData.mobile;
 return /Android.+Mobile|iPhone|iPod|Windows Phone|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
function isMobilePortrait(){return isPhone()&&window.matchMedia("(orientation: portrait)").matches}
function updateOrientationPrompt(){const p=$("#orientationPrompt");if(!p)return;const phone=isPhone(),show=phone&&window.matchMedia("(orientation: portrait)").matches;document.body.classList.toggle("is-phone",phone);p.classList.toggle("show",show);p.setAttribute("aria-hidden",show?"false":"true");document.body.classList.toggle("mobile-portrait-locked",show)}
window.addEventListener("resize",updateOrientationPrompt);window.addEventListener("orientationchange",()=>setTimeout(updateOrientationPrompt,120));
function loadPhotoBundle(uf){if(window.VOTASIM_PHOTOS[uf])return Promise.resolve();return new Promise(resolve=>{const s=document.createElement("script");s.src=`./assets/photo-data/${uf}.js`;s.onload=resolve;s.onerror=resolve;document.head.appendChild(s)})}
function photoFor(c){return window.VOTASIM_PHOTOS[c.uf]?.[String(c.id)]||null}
function audio(){if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==="suspended")audioCtx.resume();return audioCtx}
function tone(freq=900,duration=.055,delay=0,volume=.045){try{const a=audio(),o=a.createOscillator(),g=a.createGain(),t=a.currentTime+delay;o.type="sine";o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+duration)}catch(e){}}
function keySound(){tone(720,.035,0,.025)}
function playClip(kind,volume=1){
 try{
   const cached=audioCache[kind];
   cached.pause(); cached.currentTime=0; cached.volume=volume;
   const p=cached.play();
   if(p?.catch)p.catch(()=>{
     // Fallback: a fresh media element avoids stale/failed Audio instances on some mobile browsers.
     const a=new Audio(AUDIO_URLS[kind]); a.volume=volume; a.play().catch(()=>{});
   });
 }catch(e){
   try{const a=new Audio(AUDIO_URLS[kind]);a.volume=volume;a.play().catch(()=>{})}catch(_){ }
 }
}
function confirmSound(){playClip("confirm",1)}
function finishSound(){playClip("finish",1)}
function home(){ $("#app").innerHTML=`<section class="card"><h1>🗳️ VotaSim 2026</h1><p class="lead">Simule a sequência da votação de 2026 com dados de candidaturas preparados a partir da base pública do TSE.</p><button class="primary" onclick="chooseUF()">COMEÇAR</button><p class="notice"><b>Projeto independente e educativo.</b> Não é um serviço do TSE ou da Justiça Eleitoral. Nenhum voto é transmitido, registrado ou contabilizado.</p></section>`}
function chooseUF(){const opts=Object.entries(UFS).map(([u,n])=>`<option value="${u}" ${u==="SE"?"selected":""}>${n}</option>`).join("");$("#app").innerHTML=`<section class="card"><h2>Escolha a UF</h2><p>Os cargos estaduais serão carregados para a UF selecionada. Presidente é nacional.</p><select id="uf">${opts}</select><button class="primary" onclick="loadUF()">CARREGAR CANDIDATURAS</button><p class="notice">Os arquivos em <code>/data</code> são gerados pelo importador incluído no projeto.</p></section>`}
async function loadUF(){
 state=$("#uf").value; $("#app").innerHTML=`<section class="card"><h2>Carregando ${esc(UFS[state])}…</h2></section>`;
 try{
   const [local,national]=await Promise.all([
     fetch(`./data/${state}.json`,{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error(`${state}.json não encontrado`);return r.json()}),
     fetch(`./data/BR.json`,{cache:"no-store"}).then(r=>r.ok?r.json():({candidates:[]}))
   ]);
   data={generatedAt:local.generatedAt,candidates:[...(local.candidates||[]),...(national.candidates||[])],parties:[...(local.parties||[]),...(national.parties||[])]};
   await Promise.all([loadPhotoBundle(state),loadPhotoBundle("BR")]);
   offices=BASE_OFFICES.map(o=>({...o,cargo:o.id==="depEstadual"&&state==="DF"?"DEPUTADO DISTRITAL":o.cargo,label:o.id==="depEstadual"&&state==="DF"?"DEPUTADO DISTRITAL":o.label}));
   step=0;input="";blank=false;votes=[];render();
 }catch(e){$("#app").innerHTML=`<section class="card"><h2>Dados ainda não carregados</h2><div class="error">${esc(e.message)}.<br><br>Execute o importador da pasta <code>tools</code> com o ZIP oficial do TSE e envie a pasta <code>data</code> para o repositório.</div><button class="primary" onclick="chooseUF()">VOLTAR</button></section>`}
}
function office(){return offices[step]}
function candidates(){return data.candidates.filter(c=>c.cargo===office().cargo && (office().cargo==="PRESIDENTE"||c.uf===state))}
function cand(){return candidates().find(c=>String(c.numero)===input)}
function party(){return (data.parties||[]).find(p=>String(p.numero)===input.slice(0,2))}
function type(){
 if(blank)return"blank"; const c=cand(); if(c)return"candidate"; const p=party();
 if(office().proportional&&p&&input.length>=2&&input.length<=office().digits)return input.length===office().digits&&!c?"legend":"legend";
 if(input.length===office().digits)return"null"; return"typing";
}
function ready(){return ["blank","candidate","legend","null"].includes(type()) && (type()!=="legend"||input.length>=2)}
function boxes(){return blank?"":Array.from({length:office().digits},(_,i)=>`<span class="box ${input[i]?"":"empty"}">${esc(input[i]||"")}</span>`).join("")}
function details(){
 const t=type(),c=cand(),p=party();
 if(t==="blank")return`<div class="status">VOTO EM BRANCO</div>`;
 if(t==="candidate"){const src=photoFor(c),photo=src?`<img class="photo" src="${src}" alt="Foto de ${esc(c.nomeUrna)}">`:`<div class="photo-placeholder">FOTO<br>indisponível</div>`;return`<div class="candidate"><div><p>Número</p><h2>${esc(c.nomeUrna)}</h2><p>Partido: <b>${esc(c.partido)}</b></p></div>${photo}</div>`}
 if(t==="legend")return`<div class="status" style="font-size:20px">VOTO DE LEGENDA</div><p>Partido: <b>${esc(p?.sigla||input.slice(0,2))}</b></p>`;
 if(t==="null")return`<div class="status">NÚMERO ERRADO</div><p>Se confirmado, o voto será nulo.</p>`;
 return`<p>${input?"Continue digitando.":"Digite o número."}</p>`;
}
function render(){
 clearTimeout(timer);unlock=false;const r=ready();
 $("#app").innerHTML=`<section class="urna-wrap"><div class="progress"><span>1º TURNO • ${esc(state)}</span><span>${step+1}/${offices.length}</span></div><div class="urna"><div class="display"><div>Seu voto para</div><div class="office">${esc(office().label||office().cargo)}</div><div class="digits">${boxes()}</div>${details()}<div class="hint">${r&&!unlock?"<b>Confira seu voto</b>":r?"Confira seu voto e pressione <b>CONFIRMA</b>.":"Use o teclado para informar o número."}<br><b>CORRIGE</b> reinicia este cargo.</div></div><div><div class="keyboard"><div class="brand">TECLADO • SIMULAÇÃO</div><div class="keys">${[1,2,3,4,5,6,7,8,9].map(n=>`<button class="key" onclick="digit('${n}')">${n}</button>`).join("")}<button class="key zero" onclick="digit('0')">0</button></div><div class="actions"><button class="action white" onclick="whiteVote()">BRANCO</button><button class="action correct" onclick="correct()">CORRIGE</button><button id="confirm" class="action confirm" onclick="confirmVote()" ${r?"disabled":""}>CONFIRMA</button></div></div><div class="foot">Nenhum voto é transmitido ou armazenado.</div></div></div></section>`;
 if(r)timer=setTimeout(()=>{unlock=true;const b=$("#confirm");if(b)b.disabled=false;const h=document.querySelector(".hint");if(h)h.innerHTML=`Confira seu voto e pressione <b>CONFIRMA</b>.<br><b>CORRIGE</b> reinicia este cargo.`},1000);
}
function digit(n){if(blank||input.length>=office().digits)return;keySound();input+=n;render()}
function correct(){keySound();input="";blank=false;render()}
function whiteVote(){keySound();input="";blank=true;render()}
function confirmVote(){
 if(!ready()||!unlock)return;
 let t=type(),c=cand();
 // Regra 2026: repetir a mesma candidatura ao Senado torna o segundo voto nulo.
 if(office().id==="senador2"&&c){const first=votes.find(v=>v.office==="senador1");if(first?.candidateId===c.id)t="null"}
 votes.push({office:office().id,type:t,candidateId:c?.id||null});
 if(step===offices.length-1)return finish();
 confirmSound();
 step++;input="";blank=false;render();
}
function finish(){finishSound();$("#app").innerHTML=`<section class="card"><div class="finish">FIM</div><p style="text-align:center">Simulação concluída. <b>Nenhum voto foi enviado ou registrado.</b></p><button class="primary" onclick="home()">NOVA SIMULAÇÃO</button><p class="notice">Dados exibidos são derivados de arquivos públicos e podem mudar conforme a atualização da fonte. Consulte a Justiça Eleitoral para informações oficiais.</p></section>`}
home();updateOrientationPrompt();
