// Nursy – Anfragen (Frontend-only)
(function(){
  const REQ_KEY = "nursy_requests_v1";
  const PAT_KEY = "nursy_patients_v1";

  function safeParse(raw, fallback){
    try{ return JSON.parse(raw); }catch(e){ return fallback; }
  }

  function uid(prefix="r"){
    return prefix + Math.random().toString(16).slice(2) + Date.now().toString(16);
  }

  function seedRequests(){
    const demo = [
      {
        id: uid("r"),
        status: "open",
        createdAt: new Date().toISOString(),
        name: "Anna Berger",
        address: "Hauptstraße 12, 4020 Linz",
        need: "Grundpflege + Mobilisation",
        note: "3x/Woche, vormittags"
      },
      {
        id: uid("r"),
        status: "open",
        createdAt: new Date().toISOString(),
        name: "Max Huber",
        address: "Mozartweg 8, 5020 Salzburg",
        need: "Wundversorgung (Dekubitus)",
        note: "täglich Verbandwechsel, bitte Erfahrung"
      },
      {
        id: uid("r"),
        status: "open",
        createdAt: new Date().toISOString(),
        name: "Maria Leitner",
        address: "Donaustraße 3, 3100 St. Pölten",
        need: "Medikation + Vitalzeichen",
        note: "2x/Tag, Blutdruckprotokoll"
      }
    ];
    localStorage.setItem(REQ_KEY, JSON.stringify(demo));
    render();
  }

  function loadRequests(){
    const raw = localStorage.getItem(REQ_KEY);
    const arr = safeParse(raw || "[]", []);
    return Array.isArray(arr) ? arr : [];
  }

  function saveRequests(arr){
    try{ localStorage.setItem(REQ_KEY, JSON.stringify(arr)); }catch(e){}
  }

  function loadPatients(){
    const raw = localStorage.getItem(PAT_KEY);
    const arr = safeParse(raw || "[]", []);
    return Array.isArray(arr) ? arr : [];
  }

  function savePatients(arr){
    try{ localStorage.setItem(PAT_KEY, JSON.stringify(arr)); }catch(e){}
  }

  function activateAsPatient(reqId){
    const requests = loadRequests();
    const r = requests.find(x => x.id === reqId);
    if (!r) return;

    // mark request accepted
    r.status = "accepted";
    saveRequests(requests);

    // add or update patient
    const patients = loadPatients();
    const existing = patients.find(p => (p.requestId && p.requestId === r.id) || (p.name === r.name && p.address === r.address));
    const p = existing || {
      id: (existing && existing.id) || ("p" + Date.now().toString(16) + Math.random().toString(16).slice(2)),
      name: r.name,
      address: r.address,
      active: true,
      visits: [],
      requestId: r.id
    };

    p.active = true;
    if (!existing) patients.push(p);
    savePatients(patients);

    // set active patient + go to patients
    try{ localStorage.setItem("nursy_active_patient_id", p.id); }catch(e){}
    window.location.href = "patients.html";
  }

  function rejectRequest(reqId){
    const requests = loadRequests();
    const r = requests.find(x => x.id === reqId);
    if (!r) return;
    r.status = "rejected";
    saveRequests(requests);
    render();
  }

  function card(req){
    const wrap = document.createElement("div");
    wrap.className = "card";
    wrap.style.marginTop = "12px";

    const statusLabel = req.status === "open" ? "Offen" : (req.status === "accepted" ? "Aktiviert" : "Abgelehnt");
    const statusStyle = req.status === "open" ? "color:#0f172a" : (req.status === "accepted" ? "color:#047857" : "color:#b91c1c");

    wrap.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:flex-start;">
        <div style="min-width:240px;">
          <div style="font-weight:800;font-size:16px;">${escapeHtml(req.name)}</div>
          <div class="muted">${escapeHtml(req.address || "")}</div>
          <div style="margin-top:10px;"><strong>Bedarf:</strong> ${escapeHtml(req.need || "—")}</div>
          <div class="muted" style="margin-top:6px;">${escapeHtml(req.note || "")}</div>
        </div>
        <div style="text-align:right;min-width:200px;">
          <div class="muted">Status: <span style="${statusStyle};font-weight:800;">${statusLabel}</span></div>
          <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:12px;">
            ${req.status === "open" ? `
              <button class="btn btn--primary" data-accept="${req.id}">Patient aktivieren</button>
              <button class="btn btn--secondary" data-reject="${req.id}">Ablehnen</button>
            ` : ``}
          </div>
        </div>
      </div>
    `;
    return wrap;
  }

  function escapeHtml(s){
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function render(){
    const list = document.getElementById("reqList");
    const empty = document.getElementById("reqEmpty");
    const line = document.getElementById("reqCountLine");
    if (!list) return;

    const requests = loadRequests();
    const open = requests.filter(r => r.status === "open");

    if (line) line.textContent = `${open.length} offene Anfrage(n) • ${requests.length} gesamt`;

    list.innerHTML = "";
    if (!open.length){
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    open.forEach(r => list.appendChild(card(r)));

    // wire buttons
    list.querySelectorAll("[data-accept]").forEach(btn => {
      btn.addEventListener("click", () => activateAsPatient(btn.getAttribute("data-accept")));
    });
    list.querySelectorAll("[data-reject]").forEach(btn => {
      btn.addEventListener("click", () => rejectRequest(btn.getAttribute("data-reject")));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("seedReq")?.addEventListener("click", seedRequests);
    render();
  });
})();
