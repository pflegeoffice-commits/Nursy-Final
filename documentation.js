(function(){
  const PAT_KEYS = ["nursy_patients_v1", "nursy_patients_demo_v1"];
  const ACTIVE_PAT_KEY = "nursy_active_patient_id";
  const DOC_PREFIX = "nursy_documentation_";

  const $ = (sel, el=document) => el.querySelector(sel);

  function safeParse(raw, fallback){
    try { return JSON.parse(raw); } catch(e){ return fallback; }
  }

  function loadPatients(){
    for (const key of PAT_KEYS){
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const arr = safeParse(raw, []);
      if (Array.isArray(arr) && arr.length) return arr;
    }
    return [];
  }

  function activePatientId(){
    return localStorage.getItem(ACTIVE_PAT_KEY) || $("#docPatientSelect")?.value || "";
  }

  function storageKey(){
    return DOC_PREFIX + activePatientId();
  }

  function loadEntries(){
    return safeParse(localStorage.getItem(storageKey()) || "[]", []);
  }

  function saveEntries(entries){
    localStorage.setItem(storageKey(), JSON.stringify(entries));
  }

  function buildPatientSelect(){
    const select = $("#docPatientSelect");
    const line = $("#docActivePatientLine");
    if (!select) return;

    const patients = loadPatients();
    select.innerHTML = "";

    if (!patients.length){
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "Keine Patienten vorhanden";
      select.appendChild(opt);
      if (line) line.innerHTML = 'Aktiver Patient: <strong>—</strong>';
      renderArchive();
      drawBPChart([]);
      return;
    }

    const activeId = localStorage.getItem(ACTIVE_PAT_KEY) || "";
    patients.forEach((p, i) => {
      const opt = document.createElement("option");
      opt.value = p.id || ("p" + (i + 1));
      opt.textContent = p.name || ("Patient " + (i + 1));
      if (activeId && opt.value === activeId) opt.selected = true;
      select.appendChild(opt);
    });

    if (!select.value && select.options.length){
      select.selectedIndex = 0;
      localStorage.setItem(ACTIVE_PAT_KEY, select.value);
    }

    updateActivePatientLine();

    select.addEventListener("change", () => {
      localStorage.setItem(ACTIVE_PAT_KEY, select.value);
      updateActivePatientLine();
      renderArchive();
      drawBPChart(loadEntries());
    });
  }

  function updateActivePatientLine(){
    const select = $("#docPatientSelect");
    const line = $("#docActivePatientLine");
    if (!select || !line) return;
    const text = select.options[select.selectedIndex]?.textContent || "—";
    line.innerHTML = 'Aktiver Patient: <strong>' + escapeHtml(text) + '</strong>';
  }

  function escapeHtml(s){
    return String(s || "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function currentDate(){
    const d = new Date();
    return d.toISOString().slice(0,10);
  }

  function currentTime(){
    const d = new Date();
    return String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");
  }

  function upsertEntry(kind, payload){
    const date = $("#docDate")?.value || currentDate();
    const time = $("#docTime")?.value || currentTime();
    const entries = loadEntries();

    const sameIndex = entries.findIndex(e => e.date === date && e.time === time);
    let base = sameIndex >= 0 ? entries[sameIndex] : { date, time, vitals:{}, tasks:{}, note:"" };

    if (kind === "vitals") base.vitals = Object.assign({}, base.vitals, payload);
    if (kind === "tasks") base.tasks = Object.assign({}, base.tasks, payload);
    if (kind === "note") base.note = payload.note || "";

    if (sameIndex >= 0) entries[sameIndex] = base;
    else entries.unshift(base);

    saveEntries(entries);
    renderArchive();
    drawBPChart(entries);
  }

  function bindSaveButtons(){
    $("#saveVitals")?.addEventListener("click", () => {
      upsertEntry("vitals", {
        bpSys: $("#bpSys")?.value || "",
        bpDia: $("#bpDia")?.value || "",
        pulse: $("#pulse")?.value || "",
        temp: $("#temp")?.value || "",
        sugar: $("#sugar")?.value || "",
        spo2: $("#spo2")?.value || "",
        weight: $("#weight")?.value || ""
      });
    });

    $("#saveTasks")?.addEventListener("click", () => {
      upsertEntry("tasks", {
        basic: $("#taskBasic")?.checked || false,
        mobil: $("#taskMobil")?.checked || false,
        meds: $("#taskMeds")?.checked || false,
        wound: $("#taskWound")?.checked || false,
        vitals: $("#taskVitals")?.checked || false,
        position: $("#taskPosition")?.checked || false,
        note: $("#tasksNote")?.value || ""
      });
    });

    $("#saveDocText")?.addEventListener("click", () => {
      upsertEntry("note", { note: $("#docText")?.value || "" });
    });

    $("#refreshArchive")?.addEventListener("click", () => {
      renderArchive();
      drawBPChart(loadEntries());
    });
  }

  function renderArchive(){
    const host = $("#docArchive");
    const empty = $("#docArchiveEmpty");
    if (!host) return;

    const entries = loadEntries();
    host.innerHTML = "";

    if (!entries.length){
      if (empty) empty.style.display = "";
      return;
    }
    if (empty) empty.style.display = "none";

    entries
      .slice()
      .sort((a,b) => (b.date + b.time).localeCompare(a.date + a.time))
      .forEach(entry => {
        const card = document.createElement("div");
        card.className = "doc-archive-item";

        const bp = entry.vitals?.bpSys && entry.vitals?.bpDia ? `${entry.vitals.bpSys}/${entry.vitals.bpDia}` : "—";
        const tasks = [];
        if (entry.tasks?.basic) tasks.push("Grundpflege");
        if (entry.tasks?.mobil) tasks.push("Mobilisation");
        if (entry.tasks?.meds) tasks.push("Medikation");
        if (entry.tasks?.wound) tasks.push("Wundversorgung");
        if (entry.tasks?.vitals) tasks.push("Vitalwerte");
        if (entry.tasks?.position) tasks.push("Lagerung");

        card.innerHTML = `
          <div class="doc-archive-top">
            <strong>${escapeHtml(entry.date || "")}</strong>
            <span class="muted">${escapeHtml(entry.time || "")}</span>
          </div>
          <div class="doc-archive-grid">
            <div><span class="muted">Blutdruck:</span> ${escapeHtml(bp)}</div>
            <div><span class="muted">Puls:</span> ${escapeHtml(entry.vitals?.pulse || "—")}</div>
            <div><span class="muted">Temp.:</span> ${escapeHtml(entry.vitals?.temp || "—")}</div>
            <div><span class="muted">SpO₂:</span> ${escapeHtml(entry.vitals?.spo2 || "—")}</div>
          </div>
          <div class="doc-archive-text"><span class="muted">Durchführung:</span> ${escapeHtml(tasks.join(", ") || "—")}</div>
          <div class="doc-archive-text"><span class="muted">Dokumentation:</span> ${escapeHtml(entry.note || "—")}</div>
        `;
        host.appendChild(card);
      });
  }

  function drawBPChart(entries){
    const canvas = $("#bpChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
    const cssHeight = canvas.height || 230;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,cssWidth,cssHeight);

    // panel bg
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.fillRect(0,0,cssWidth,cssHeight);

    const filtered = entries
      .filter(e => e?.vitals?.bpSys && e?.vitals?.bpDia)
      .slice()
      .sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(-7);

    const pad = { top: 18, right: 16, bottom: 34, left: 42 };
    const w = cssWidth - pad.left - pad.right;
    const h = cssHeight - pad.top - pad.bottom;

    // grid
    ctx.strokeStyle = "rgba(15,26,51,.10)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++){
      const y = pad.top + (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(cssWidth - pad.right, y);
      ctx.stroke();
    }

    // axis labels
    ctx.fillStyle = "rgba(15,26,51,.6)";
    ctx.font = "12px Georgia";
    const minY = 40;
    const maxY = 180;
    for (let i = 0; i <= 4; i++){
      const val = maxY - ((maxY - minY) / 4) * i;
      const y = pad.top + (h / 4) * i + 4;
      ctx.fillText(String(Math.round(val)), 6, y);
    }

    if (!filtered.length){
      ctx.fillStyle = "rgba(15,26,51,.45)";
      ctx.font = "14px Georgia";
      ctx.fillText("Noch keine Blutdruckwerte vorhanden.", pad.left, cssHeight / 2);
      return;
    }

    const xFor = idx => pad.left + (filtered.length === 1 ? w / 2 : (w / (filtered.length - 1)) * idx);
    const yFor = val => pad.top + h - ((Number(val) - minY) / (maxY - minY)) * h;

    function drawSeries(key, dashed){
      ctx.save();
      ctx.strokeStyle = "#3f6fe8";
      ctx.fillStyle = "#3f6fe8";
      ctx.lineWidth = 2;
      if (dashed) ctx.setLineDash([6,4]);
      ctx.beginPath();
      filtered.forEach((entry, idx) => {
        const x = xFor(idx);
        const y = yFor(entry.vitals[key]);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      filtered.forEach((entry, idx) => {
        const x = xFor(idx);
        const y = yFor(entry.vitals[key]);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    drawSeries("bpSys", false);
    drawSeries("bpDia", true);

    ctx.fillStyle = "rgba(15,26,51,.65)";
    ctx.font = "12px Georgia";
    filtered.forEach((entry, idx) => {
      const x = xFor(idx);
      const label = (entry.date || "").slice(5).replace("-", ".");
      ctx.fillText(label, x - 16, cssHeight - 10);
    });
  }

  function setDefaults(){
    const d = $("#docDate");
    const t = $("#docTime");
    if (d && !d.value) d.value = currentDate();
    if (t && !t.value) t.value = currentTime();
  }

  document.addEventListener("DOMContentLoaded", () => {
    setDefaults();
    buildPatientSelect();
    bindSaveButtons();
    renderArchive();
    drawBPChart(loadEntries());
    window.addEventListener("resize", () => drawBPChart(loadEntries()));
  });
})();
