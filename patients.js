let __currentEdit = null;
// --- Safety: localStorage kann in manchen Umgebungen blockiert sein (z.B. Private Mode) ---
const safeStorage = {
  get(key){ try{ return localStorage.getItem(key); }catch(e){ return null; } },
  set(key,val){ try{ localStorage.setItem(key,val); }catch(e){} },
  remove(key){ try{ localStorage.removeItem(key); }catch(e){} }
};

const STORAGE_KEY = "nursy_patients_demo_v1";

function isoDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}


function loadPatients() {
  const raw = safeStorage.get(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  // Keine Demo-Patienten mehr
  return [];
}


function resetDemo() {
  // entfernt alle gespeicherten Patienten (falls man "Zurücksetzen" nutzt)
  safeStorage.remove(STORAGE_KEY);
  render();
}


function createEl(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text !== undefined) el.textContent = text;
  return el;
}

function makeRow(p, visit) {
  const row = createEl("div", "patient-row");

  const info = createEl("div", "patient-info");
  const name = createEl("div", "patient-name", p.name);
  const address = createEl("div", "patient-address", p.address);
  info.append(name, address);

  const timeText = visit ? `${visit.from} – ${visit.to}` : "—";
  const time = createEl("button", "patient-time patient-time--editable", timeText);
  time.type = "button";
  time.title = "Zeit bearbeiten";
  time.setAttribute("aria-label", `Zeit bearbeiten für ${p.name}`);

  // Welche Visit soll bearbeitet werden?
  const dateForEdit = visit?.date || isoDate(); // wenn keine Visit: heute anlegen
  time.dataset.patientId = p.id;
  time.dataset.visitDate = dateForEdit;

  time.addEventListener("click", () => openTimeModal(p.id, dateForEdit));

  

  const isCancelled = !!(visit && visit.cancelled);
  const status = createEl("span", "status-pill " + (isCancelled ? "is-cancelled" : "is-active"), isCancelled ? "Storniert" : "Aktiv");
  if (isCancelled) row.classList.add("is-cancelled");
const actions = createEl("div", "patient-actions");
  const navBtn = createEl("button", "btn btn--secondary", "Navigation");
  navBtn.type = "button";
  navBtn.addEventListener("click", () => alert("Demo: Navigation (Google Maps)"));

  const msgBtn = createEl("button", "btn btn--primary", "Nachricht");
  msgBtn.type = "button";
  msgBtn.addEventListener("click", () => alert("Demo: Nachricht senden"));

  actions.append(navBtn, msgBtn);

  time.appendChild(status);
  row.append(info, time, actions);
  return row;
}


function cleanupLegacyDemoPatients(patients){
  // Entfernt alte Demo-Einträge ("Patient 1", "Patient 2", ...) aus früheren Versionen
  const cleaned = (patients || []).filter(p => {
    const n = String(p?.name || '').trim();
    return !(n.match(/^Patient\s*\d+$/i));
  });
  if (cleaned.length !== (patients || []).length) {
    try { safeStorage.set(STORAGE_KEY, JSON.stringify(cleaned)); } catch(e) {}
  }
  return cleaned;
}

function render() {
  let patients = loadPatients();
  patients = cleanupLegacyDemoPatients(patients);
  const today = isoDate();

  const todayList = document.getElementById("todayList");
  const activeList = document.getElementById("activeList");
  const todayEmpty = document.getElementById("todayEmpty");
  const activeEmpty = document.getElementById("activeEmpty");
  const todayCount = document.getElementById("todayCount");
  const activeCount = document.getElementById("activeCount");

  todayList.innerHTML = "";
  activeList.innerHTML = "";

  const todayRows = [];
  const active = patients.filter(p => p.active);

  for (const p of active) {
    const vToday = (p.visits || []).find(v => v.date === today);
    if (vToday) todayRows.push({ p, v: vToday });
  }

  todayCount.textContent = String(todayRows.length);
  todayEmpty.hidden = todayRows.length !== 0;

  for (const r of todayRows) {
    todayList.appendChild(makeRow(r.p, r.v));
  }

  activeCount.textContent = String(active.length);
  activeEmpty.hidden = active.length !== 0;

  for (const p of active) {
    const visits = (p.visits || []).slice().sort((a,b)=>(a.date+a.from).localeCompare(b.date+b.from));
    const v = visits.find(x=>x.date===today) || visits[0];
    activeList.appendChild(makeRow(p, v || null));
  }
}


// --- Zeit bearbeiten (Modal) ---
let modalState = { patientId: null, date: null };

function getModalEls(){
  return {
    modal: document.getElementById("timeModal"),
    from: document.getElementById("timeFrom"),
    to: document.getElementById("timeTo"),
    save: document.getElementById("timeSave"),
    hint: document.getElementById("timeHint")
  };
}

function openTimeModal(patientId, date){
  // Kontext für Storno/Undo
  __currentEdit = { patientId, date }; 
  updateCancelUI();

  const { modal, from, to, hint } = getModalEls();
  if (!modal || !from || !to) return;

  let patients = loadPatients();
  patients = cleanupLegacyDemoPatients(patients);
  const p = patients.find(x => x.id === patientId);
  const v = (p?.visits || []).find(x => x.date === date);

  from.value = v?.from || "08:00";
  to.value = v?.to || "09:00";
  hint.textContent = `Patient: ${p?.name || ""} • Datum: ${date}`;

  modalState = { patientId, date };
  modal.hidden = false;

  // Fokus auf erstes Feld
  setTimeout(() => from.focus(), 0);
}

function closeTimeModal(){
  const { modal } = getModalEls();
  if (!modal) return;
  modal.hidden = true;
  modalState = { patientId: null, date: null };
}


function cancelCurrentVisit(){
  // Kompatibilität: Button im Modal nutzt jetzt Toggle
  toggleCancelCurrentVisit();
}


function saveTimeModal(){
  const { from, to, hint } = getModalEls();
  if (!modalState.patientId || !modalState.date) return;

  const f = from.value;
  const t = to.value;

  if (!f || !t){
    hint.textContent = "Bitte beide Zeiten auswählen.";
    return;
  }
  if (t <= f){
    hint.textContent = "Endzeit muss nach der Startzeit liegen.";
    return;
  }

  let patients = loadPatients();
  patients = cleanupLegacyDemoPatients(patients);
  const p = patients.find(x => x.id === modalState.patientId);
  if (!p) return;

  p.visits = Array.isArray(p.visits) ? p.visits : [];
  const existing = p.visits.find(x => x.date === modalState.date);
  if (existing){
    existing.from = f;
    existing.to = t;
  } else {
    p.visits.push({ date: modalState.date, from: f, to: t });
  }

  safeStorage.set(STORAGE_KEY, JSON.stringify(patients));
  closeTimeModal();
  render(); // damit es sofort bei "Heute" und "Alle" sichtbar ist
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("resetPatients")?.addEventListener("click", resetDemo);

  // Modal wiring
  const modal = document.getElementById("timeModal");
  document.getElementById("timeSave")?.addEventListener("click", saveTimeModal);
  document.getElementById("timeCancel")?.addEventListener("click", cancelCurrentVisit);
  modal?.addEventListener("click", (e) => {
    const t = e.target;
    if (t?.matches?.("[data-close]")) closeTimeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeTimeModal();
  });

  render();
});


function setModalStatusCancelled(){
  const info = document.querySelector(".modal-info");
  if(info){
    info.innerHTML = "<strong>Status:</strong> <span style='color:#b91c1c;font-weight:700'>Storniert</span>";
  }
}

function getVisitByCtx(ctx, patients){
  if(!ctx) return {p:null,v:null};
  const p = patients.find(x => x.id === ctx.patientId);
  if(!p) return {p:null,v:null};
  const v = (p.visits||[]).find(x => x.date === ctx.date);
  return {p, v};
}

function savePatients(patients){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(patients)); }catch(e){}
}



function undoCancelVisit(patientId, date){
  let patients = loadPatients();
  patients = cleanupLegacyDemoPatients(patients);
  const p = patients.find(x => x.id === patientId);
  if (!p) return;
  const v = (p.visits || []).find(x => x.date === date);
  if (!v) return;
  v.cancelled = false;
  savePatients(patients);
}

function updateCancelUI(){
  const btn = document.getElementById("timeCancel");
  const hint = document.getElementById("timeHint");
  if(!btn && !hint) return;

  let patients = loadPatients();
  patients = cleanupLegacyDemoPatients(patients);
  const {v} = getVisitByCtx(__currentEdit, patients);
  const cancelled = !!(v && v.cancelled);

  if(hint){
    hint.innerHTML = `<strong>Status:</strong> <span style="color:${cancelled ? "#b91c1c" : "#065f46"};font-weight:800">${cancelled ? "Storniert" : "Aktiv"}</span>` + 
      (cancelled ? " — Du kannst die Stornierung wieder aufheben." : "");
  }
  if(btn){
    btn.textContent = cancelled ? "Stornierung aufheben" : "Auftrag stornieren";
    // toggle class if BEM present
    btn.classList.remove("btn--danger","btn--success");
    btn.classList.add(cancelled ? "btn--success" : "btn--danger");
  }
}

function toggleCancelCurrentVisit(){
  if(!__currentEdit) return;
  let patients = loadPatients();
  patients = cleanupLegacyDemoPatients(patients);
  const {v} = getVisitByCtx(__currentEdit, patients);
  if(!v) return;

  if(!v.cancelled){
    if(!confirm("Diesen Auftrag wirklich stornieren?")) return;
    v.cancelled = true;
  } else {
    if(!confirm("Stornierung aufheben und Auftrag wieder aktivieren?")) return;
    v.cancelled = false;
  }
  savePatients(patients);
  updateCancelUI();
  render();
}
