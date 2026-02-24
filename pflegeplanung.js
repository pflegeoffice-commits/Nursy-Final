// Pflegeplanung – Mini-Demo (Frontend only)

const PATIENTS = {
  anna: { name: "Anna Berger", dob: "12.03.1942" },
  max: { name: "Max Huber", dob: "01.01.1938" },
  maria: { name: "Maria Leitner", dob: "22.07.1945" },
};

const PLANS = {
  // plannedAt: Datum der Erstellung (A – automatisch/gespeichert)
  // evalDate: Datum für Evaluation (B – das eingestellte Datum)
  anna: [{
    plannedAt: "2026-02-10",
    evalDate: "2026-02-17",
    diagnose: "Mobilität eingeschränkt",
    massnahme: "Mobilisation",
    ziel: "Sicheres Gehen"
  }],
  max: [{
    plannedAt: "2026-02-11",
    evalDate: "2026-02-18",
    diagnose: "Sturzrisiko",
    massnahme: "Sturzprophylaxe",
    ziel: "Stürze vermeiden"
  }],
  maria: [],
};


const patientSelect = document.getElementById("patientSelect");
const activePatientLine = document.getElementById("activePatientLine");
const planBody = document.getElementById("planBody");
const emptyHint = document.getElementById("emptyHint");

function fmtDate(ymd){
  if(!ymd) return "—";
  // erwartet yyyy-mm-dd
  const m = String(ymd).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m) return String(ymd);
  const y=Number(m[1]), mo=Number(m[2])-1, d=Number(m[3]);
  const dt=new Date(y,mo,d);
  return dt.toLocaleDateString("de-DE");
}

function ensureDates(plan){
  // A: Geplant am – falls fehlt, jetzt setzen
  if(!plan.plannedAt){
    const now = new Date();
    const y=now.getFullYear();
    const m=String(now.getMonth()+1).padStart(2,"0");
    const d=String(now.getDate()).padStart(2,"0");
    plan.plannedAt = `${y}-${m}-${d}`;
  }
  return plan;
}

function renderPatient() {
  const key = patientSelect.value;
  const p = PATIENTS[key];
  activePatientLine.innerHTML = `Aktiver Patient: <strong>${p.name}</strong> (geb. ${p.dob})`;

  const rows = PLANS[key] || [];
  planBody.innerHTML = "";
  if (!rows.length) {
    emptyHint.style.display = "block";
    return;
  }
  emptyHint.style.display = "none";

  rows.forEach((r, idx) => {
    const tr = document.createElement("tr");
    tr.dataset.plan = String(idx);
    ensureDates(r);
    tr.innerHTML = `<td class="pp-date">${fmtDate(r.plannedAt)}</td><td>${r.diagnose}</td><td>${r.massnahme}</td><td>${r.ziel}</td><td class="pp-date pp-date--right">${fmtDate(r.evalDate)}</td>`;
    tr.addEventListener("click", () => openDetails(r));
    planBody.appendChild(tr);
  });
}

const modal = document.getElementById("ppModal");
const modalX = document.getElementById("ppModalX");
const closeBtn = document.getElementById("ppModalClose");

function openDetails(plan) {
  ensureDates(plan);
  document.getElementById("ppModalPlanned").innerHTML = `<b>Geplant am:</b> ${fmtDate(plan.plannedAt)}`;
  document.getElementById("ppModalEval").innerHTML = `<b>Evaluation am:</b> ${fmtDate(plan.evalDate)}`;
  document.getElementById("ppModalDiag").innerHTML = `<b>Diagnose:</b> ${plan.diagnose}`;
  document.getElementById("ppModalMass").innerHTML = `<b>Maßnahme:</b> ${plan.massnahme}`;
  document.getElementById("ppModalZiel").innerHTML = `<b>Ziel:</b> ${plan.ziel}`;
  modal.hidden = false;
}

function closeDetails() {
  modal.hidden = true;
}

closeBtn.addEventListener("click", closeDetails);
modalX.addEventListener("click", closeDetails);
modal.addEventListener("click", (e) => {
  if (e.target && e.target.getAttribute && e.target.getAttribute("data-close") === "1") closeDetails();
});

patientSelect.addEventListener("change", renderPatient);

// Placeholder open buttons
document.querySelectorAll("[data-open]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const what = btn.getAttribute("data-open");
    alert(`Demo: Öffnen – ${what}`);
  });
});

renderPatient();
