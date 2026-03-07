(function(){
const PAT_KEYS=["nursy_patients_v1","nursy_patients_demo_v1"],ACTIVE_PAT_KEY="nursy_active_patient_id",DOC_PREFIX="nursy_documentation_";
const $=(s,e=document)=>e.querySelector(s);
const parse=(r,f)=>{try{return JSON.parse(r)}catch(e){return f}};
const esc=s=>String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const todayISO=()=>new Date().toISOString().slice(0,10);
const nowTime=()=>{const d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")};

function loadPatients(){for(const k of PAT_KEYS){const raw=localStorage.getItem(k);if(!raw)continue;const arr=parse(raw,[]);if(Array.isArray(arr)&&arr.length)return arr}return[]}
function patientId(){return localStorage.getItem(ACTIVE_PAT_KEY)||$("#docPatientSelect")?.value||""}
function docKey(){return DOC_PREFIX+patientId()}
function loadEntries(){return parse(localStorage.getItem(docKey())||"[]",[])}
function saveEntries(v){localStorage.setItem(docKey(),JSON.stringify(v))}
function currentPatient(){return loadPatients().find(p=>String(p.id)===String(patientId()))||null}

function buildPatientSelect(){
 const s=$("#docPatientSelect"); if(!s) return; const pats=loadPatients(); s.innerHTML="";
 if(!pats.length){const o=document.createElement("option");o.value="";o.textContent="Keine Patienten vorhanden";s.appendChild(o); updateMeta(); renderAll(); return;}
 const a=localStorage.getItem(ACTIVE_PAT_KEY)||"";
 pats.forEach((p,i)=>{const o=document.createElement("option");o.value=p.id||("p"+(i+1));o.textContent=p.name||("Patient "+(i+1)); if(a&&String(o.value)===String(a)) o.selected=true; s.appendChild(o);});
 if(!s.value&&s.options.length){s.selectedIndex=0;localStorage.setItem(ACTIVE_PAT_KEY,s.value)}
 s.addEventListener("change",()=>{localStorage.setItem(ACTIVE_PAT_KEY,s.value);updateMeta();renderAll()});
 updateMeta();
}
function updateMeta(){const p=currentPatient(); $("#docPatientName").textContent=p?.name||"—"; $("#docPatientDob").textContent=p?.dob||p?.birthDate||p?.gebDatum||"—"}

function renderLastValues(){
 const e=loadEntries().filter(x=>x&&x.vitals).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time))[0]||{vitals:{}};
 $("#lastRR").textContent=(e.vitals.bpSys&&e.vitals.bpDia)?`${e.vitals.bpSys}/${e.vitals.bpDia}`:"—";
 $("#lastPulse").textContent=e.vitals.pulse||"—"; $("#lastO2").textContent=e.vitals.o2||"—"; $("#lastBZ").textContent=e.vitals.bz||"—"; $("#lastVAS").textContent=e.vitals.vas||"—";
}
function drawChart(){
 const c=$("#vitalsChart"); if(!c) return; const ctx=c.getContext("2d"), dpr=window.devicePixelRatio||1, width=c.clientWidth||900, height=280;
 c.width=width*dpr; c.height=height*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,width,height);
 const entries=loadEntries().filter(e=>e?.vitals?.bpSys&&e?.vitals?.bpDia).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(-8);
 const pad={top:22,right:20,bottom:38,left:44}, w=width-pad.left-pad.right, h=height-pad.top-pad.bottom, minY=20, maxY=160;
 ctx.fillStyle="#fff"; ctx.fillRect(0,0,width,height); ctx.strokeStyle="rgba(63,111,232,.35)"; ctx.lineWidth=1;
 for(let i=0;i<=7;i++){const y=pad.top+(h/7)*i; ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(width-pad.right,y); ctx.stroke();}
 ctx.fillStyle="rgba(15,26,51,.6)"; ctx.font="12px Georgia";
 for(let i=0;i<=7;i++){const val=maxY-((maxY-minY)/7)*i; const y=pad.top+(h/7)*i+4; ctx.fillText(String(Math.round(val)),8,y)}
 if(!entries.length){ctx.fillStyle="rgba(15,26,51,.45)"; ctx.font="16px Georgia"; ctx.fillText("Noch keine Vitalwerte vorhanden.",pad.left,height/2); return;}
 const xFor=i=>pad.left+(entries.length===1?w/2:(w/(entries.length-1))*i), yFor=v=>pad.top+h-((Number(v)-minY)/(maxY-minY))*h;
 const draw=(key,dashed)=>{ctx.save(); ctx.strokeStyle="#3f6fe8"; ctx.fillStyle="#3f6fe8"; ctx.lineWidth=2; if(dashed) ctx.setLineDash([7,5]); ctx.beginPath();
 entries.forEach((e,i)=>{const x=xFor(i), y=yFor(e.vitals[key]); if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y)}); ctx.stroke(); ctx.setLineDash([]);
 entries.forEach((e,i)=>{const x=xFor(i), y=yFor(e.vitals[key]); ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill();}); ctx.restore();};
 draw("bpSys",false); draw("bpDia",true);
 ctx.fillStyle="rgba(15,26,51,.65)"; ctx.font="12px Georgia"; entries.forEach((e,i)=>{const x=xFor(i), label=(e.date||"").slice(5).replace("-", "."); ctx.fillText(label,x-18,height-10);});
}

function openModal(title, body, actions){$("#docModalTitle").textContent=title; $("#docModalBody").innerHTML=body; $("#docModalActions").innerHTML=actions; $("#docModal").hidden=false; bindModal()}
function closeModal(){$("#docModal").hidden=true}
function bindModal(){document.querySelectorAll("[data-close-doc]").forEach(x=>x.onclick=closeModal); $("#saveVitalsModal")?.addEventListener("click",saveVitals)}

function saveVitals(){
 const entries=loadEntries();
 entries.unshift({date:$("#vDate").value||todayISO(),time:$("#vTime").value||nowTime(),vitals:{bpSys:$("#vBpSys").value||"",bpDia:$("#vBpDia").value||"",pulse:$("#vPulse").value||"",o2:$("#vO2").value||"",bz:$("#vBZ").value||"",vas:$("#vVAS").value||""},tasks:{},note:""});
 saveEntries(entries); closeModal(); renderAll();
}
function openVitalsModal(){openModal("Neue Vitalwerte eintragen",`
<div class="field"><span class="field__label">Datum</span><input class="control" id="vDate" type="date" value="${todayISO()}"></div>
<div class="field"><span class="field__label">Uhrzeit</span><input class="control" id="vTime" type="time" value="${nowTime()}"></div>
<div class="field"><span class="field__label">RR systolisch</span><input class="control" id="vBpSys" type="number" placeholder="130"></div>
<div class="field"><span class="field__label">RR diastolisch</span><input class="control" id="vBpDia" type="number" placeholder="80"></div>
<div class="field"><span class="field__label">Puls</span><input class="control" id="vPulse" type="number" placeholder="78"></div>
<div class="field"><span class="field__label">O₂</span><input class="control" id="vO2" type="number" placeholder="97"></div>
<div class="field"><span class="field__label">BZ</span><input class="control" id="vBZ" type="number" placeholder="112"></div>
<div class="field"><span class="field__label">VAS</span><input class="control" id="vVAS" type="number" placeholder="3"></div>
`, `<button class="control btn btn--ghost" type="button" data-close-doc>Abbrechen</button><button class="control btn btn--primary" id="saveVitalsModal" type="button">Speichern</button>`)}
function openTasksModal(){openModal("Durchführungsnachweis",`<div class="docmodal__checks"><label><input type="checkbox"> Grundpflege durchgeführt</label><label><input type="checkbox"> Mobilisation durchgeführt</label><label><input type="checkbox"> Medikation verabreicht</label><label><input type="checkbox"> Wundversorgung erfolgt</label></div>`,`<button class="control btn btn--ghost" type="button" data-close-doc>Schließen</button>`)}
function openNotesModal(){openModal("Dokumentation",`<label class="field"><span class="field__label">Freie Dokumentation</span><textarea class="control docmodal__textarea"></textarea></label>`,`<button class="control btn btn--ghost" type="button" data-close-doc>Schließen</button>`)}
function openArchiveModal(){ const entries=loadEntries().sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time)); openModal("Archiv", entries.length? entries.map(e=>`<div class="docmodal__archiveitem"><strong>${esc(e.date)} ${esc(e.time)}</strong><div class="muted">RR: ${(e.vitals?.bpSys&&e.vitals?.bpDia)?esc(e.vitals.bpSys+"/"+e.vitals.bpDia):"—"} · Puls: ${esc(e.vitals?.pulse||"—")} · O₂: ${esc(e.vitals?.o2||"—")} · BZ: ${esc(e.vitals?.bz||"—")} · VAS: ${esc(e.vitals?.vas||"—")}</div></div>`).join("") : `<p class="muted">Noch keine Archiv-Einträge vorhanden.</p>`, `<button class="control btn btn--ghost" type="button" data-close-doc>Schließen</button>`) }
function renderAll(){renderLastValues(); drawChart()}

document.addEventListener("DOMContentLoaded",()=>{buildPatientSelect(); renderAll(); document.querySelectorAll("[data-close-doc]").forEach(x=>x.onclick=closeModal); $("#openVitalsEntry")?.addEventListener("click",openVitalsModal); $("#openTasks")?.addEventListener("click",openTasksModal); $("#openNotes")?.addEventListener("click",openNotesModal); $("#openArchive")?.addEventListener("click",openArchiveModal); window.addEventListener("resize",drawChart);});
})();
