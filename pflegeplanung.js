// Pflegeplanung – Frontend Demo (iPad-safe)
// Hinweis: UI-only / Demo-Logik

document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // Demo-Daten
  // -----------------------------
  const PATIENTS = {
    anna: { name: "Anna Berger", dob: "12.03.1942" },
    max: { name: "Max Huber", dob: "01.01.1938" },
    maria: { name: "Maria Leitner", dob: "22.07.1945" },
  };

  const PLANS = {
    anna: [{
      plannedAt: "2026-02-10",
      evalDate: "2026-02-17",
      diagnose: "Mobilität eingeschränkt",
      massnahme: "Mobilisation nach Ressourcen, Transfers sichern",
      ziel: "Sicheres Gehen im Wohnbereich"
    }],
    max: [{
      plannedAt: "2026-02-11",
      evalDate: "2026-02-18",
      diagnose: "Sturzrisiko",
      massnahme: "Sturzprophylaxe, Umfeld sichern, Hilfsmittel prüfen",
      ziel: "Stürze vermeiden"
    }],
    maria: [],
  };

  // -----------------------------
  // Helpers
  // -----------------------------
  function fmtDate(ymd){
    if(!ymd) return "—";
    const m = String(ymd).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!m) return String(ymd);
    const dt = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return dt.toLocaleDateString("de-DE");
  }

  function patientLabel(key){
    const p = PATIENTS[key];
    return `${p.name} (geb. ${p.dob})`;
  }

  // -----------------------------
  // DOM
  // -----------------------------
  const patientSelect = document.getElementById("patientSelect");
  const activePatientLine = document.getElementById("activePatientLine");
  const planBody = document.getElementById("planBody");
  const emptyHint = document.getElementById("emptyHint");

  const modal = document.getElementById("ppModal");
  const modalTitle = document.getElementById("ppModalTitle");
  const modalX = document.getElementById("ppModalX");
  const modalClose = document.getElementById("ppModalClose");

  if (!patientSelect || !activePatientLine || !planBody || !emptyHint || !modal || !modalTitle) {
    // Seite ist nicht vollständig / anderes Layout
    return;
  }

  const modalBody = modal.querySelector(".modal__body");
  const modalActions = modal.querySelector(".modal__actions");

  // -----------------------------
  // Modal (Details)
  // -----------------------------
  function openModal(){
    modal.hidden = false;
  }
  function closeModal(){
    modal.hidden = true;
  }

  if (modalX) modalX.addEventListener("click", closeModal);
  if (modalClose) modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target && e.target.getAttribute && e.target.getAttribute("data-close") === "1") closeModal();
  });

  function renderPatient(){
    const key = patientSelect.value;
    activePatientLine.innerHTML = `Aktiver Patient: <strong>${PATIENTS[key].name}</strong> (geb. ${PATIENTS[key].dob})`;

    const rows = PLANS[key] || [];
    planBody.innerHTML = "";

    if (!rows.length){
      emptyHint.style.display = "block";
      return;
    }
    emptyHint.style.display = "none";

    rows.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="pp-date">${fmtDate(r.plannedAt)}</td>
        <td>${r.diagnose}</td>
        <td>${r.massnahme}</td>
        <td>${r.ziel}</td>
        <td class="pp-date pp-date--right">${fmtDate(r.evalDate)}</td>
      `;
      tr.addEventListener("click", () => openDetails(r));
      planBody.appendChild(tr);
    });
  }

  function setActions(buttonsHtml){
    if (!modalActions) return;
    modalActions.innerHTML = buttonsHtml;
    // Wire close if we added an Abbrechen button etc.
    const btnCancel = modalActions.querySelector('[data-action="cancel"]');
    const btnClose = modalActions.querySelector('[data-action="close"]');
    if (btnCancel) btnCancel.addEventListener("click", closeModal);
    if (btnClose) btnClose.addEventListener("click", closeModal);
  }

  function openDetails(plan){
    modalTitle.textContent = "Planungsdetails";
    if (modalBody){
      modalBody.style.gridTemplateColumns = "1fr";
      modalBody.innerHTML = `
        <p><b>Geplant am:</b> ${fmtDate(plan.plannedAt)}</p>
        <p><b>Evaluation am:</b> ${fmtDate(plan.evalDate)}</p>
        <p><b>Diagnose:</b> ${plan.diagnose}</p>
        <p><b>Maßnahme:</b> ${plan.massnahme}</p>
        <p><b>Ziel:</b> ${plan.ziel}</p>
      `;
    }
    setActions(`<button class="control btn" type="button" data-action="close">Schließen</button>`);
    openModal();
  }

  // -----------------------------
  // Vorlagen – ERWEITERT (mehr Einträge)
  // -----------------------------
  const TEMPLATE_DATA = {
    move: [
      ["Unsicherer Gang / Sturzgefährdung","Umfeld sichern, rutschfeste Schuhe, Hilfsmittel prüfen","Sturzereignisse vermeiden"],
      ["Erschwerte Transfers","Transfertraining, Kinästhetik, Stand-by Hilfe","Sichere Transfers"],
      ["Muskelschwäche","Aktivierende Pflege, Gehstrecken steigern","Kraft & Ausdauer verbessern"],
      ["Schmerzen bei Bewegung","Schmerzassessment, Mobilisation angepasst","Bewegung mit tolerierbarem Schmerz"],
      ["Kontrakturgefahr","Bewegungsübungen, Lagerung, Dehnungen","Beweglichkeit erhalten"],
      ["Dekubitusrisiko (Mobilität)","Lagerungsplan, Druckentlastung","Dekubitus vermeiden"],
      ["Dyspnoe bei Belastung","Pausen, Atemtechnik, Belastung dosieren","Belastbarkeit steigern"],
      ["Schwindel","Orthostase-Management, langsam aufsetzen/aufstehen","Sturzrisiko reduzieren"],
    ],
    wash: [
      ["Teilweise Hilfe bei Körperpflege","Anleitung, Teilübernahme, Ressourcen fördern","Selbstständigkeit erhalten"],
      ["Haut trocken/gefährdet","Rückfettende Hautpflege, Hautkontrolle","Hautintegrität erhalten"],
      ["Intimpflege benötigt","Würde/Privatsphäre sichern, schonende Pflege","Hautreizungen vermeiden"],
      ["Mundpflege unzureichend","Mundpflege anleiten/übernehmen, Prothesenpflege","Mundgesundheit verbessern"],
      ["Kleiden erschwert","Kleidung vorbereiten, adaptive Hilfen","Ankleiden sicher durchführen"],
      ["Sturzrisiko im Bad","Haltegriffe, Duschstuhl, Aufsicht","Sichere Körperpflege"],
    ],
    eat: [
      ["Zu geringe Trinkmenge","Trinkplan, Angebot, Protokoll","Ausreichende Hydrierung"],
      ["Appetit vermindert","Kleine Portionen, Wunschkost, Essatmosphäre","Gewicht stabilisieren"],
      ["Schluckstörung (Verdacht)","Schluckscreening, Kostanpassung, Logopädie","Aspiration vermeiden"],
      ["Diabetes-Management","BZ-Kontrollen, Kostberatung (nach AO)","BZ stabil"],
      ["Übelkeit","Beobachtung, kleine Mahlzeiten, Arztinfo","Übelkeit reduzieren"],
      ["Malnutrition-Risiko","MNA/Screening, Proteinanreicherung","Ernährungsstatus verbessern"],
    ],
    excrete: [
      ["Inkontinenz","Kontinenztraining, Hautschutz, Hilfsmittel","Hautreizungen vermeiden"],
      ["Obstipationsneigung","Ballaststoffe, Bewegung, Flüssigkeit","Regelmäßige Ausscheidung"],
      ["Diarrhoe","Beobachtung, Flüssigkeit, Arztinfo","Stuhlregulation"],
      ["Harnverhalt (Verdacht)","Miktion beobachten, Restharn nach AO","Komplikationen vermeiden"],
      ["Katheterpflege","Hygiene, Zug vermeiden, Beobachtung","Infektion vermeiden"],
    ],
    communicate: [
      ["Hörminderung","Hörhilfe prüfen, Blickkontakt, langsam sprechen","Verstehen verbessern"],
      ["Wortfindungsstörung","Zeit geben, einfache Fragen, Validierung","Kommunikation erleichtern"],
      ["Unruhe/Angst","Beruhigung, Orientierung, Rituale","Angst reduzieren"],
      ["Soziale Isolation","Aktivierung, Gespräche, Angehörigenkontakt","Teilhabe fördern"],
      ["Kognitive Einschränkung","Orientierungshilfen, Struktur, Biografie","Sicherheit erhöhen"],
    ],
  };

  function openWorkflow(mode){
    const key = patientSelect.value;

    // Always show 3 buttons like your sketch
    setActions(`
      <button class="control btn secondary" type="button" data-action="cancel">Abbrechen</button>
      <button class="control btn" type="button" id="ppSelectAll">Alles auswählen</button>
      <button class="control btn primary" type="button" id="ppApply">Übernehmen</button>
    `);

    const btnSelectAll = modalActions ? modalActions.querySelector("#ppSelectAll") : null;
    const btnApply = modalActions ? modalActions.querySelector("#ppApply") : null;

    if (mode === "anam"){
      modalTitle.textContent = "Aus Anamnese übernehmen";
      if (modalBody){
        modalBody.style.gridTemplateColumns = "1fr";
        modalBody.innerHTML = `
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-end; margin-bottom:12px;">
            <div class="muted">akt. Pat.: <b>${patientLabel(key)}</b></div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <select class="control" style="width:220px;" aria-label="Frequenz">
                <option>Frequenz</option>
                <option>morgens</option><option>mittags</option><option>abends</option>
                <option>1× täglich</option><option>2× täglich</option><option>3× täglich</option><option>bei Bedarf</option>
              </select>
              <input class="control" style="width:190px;" type="date" aria-label="Evaluierung" />
            </div>
          </div>
          <table class="ppf-table" style="width:100%;">
            <thead><tr><th style="width:44px;"></th><th>Symptom</th><th>Maßnahme</th><th>Ziel</th></tr></thead>
            <tbody id="ppAnamRows">
              ${[
                ["Teilweise Unterstützung bei Körperpflege","Anleitung + Unterstützung morgens/abends","Selbstständigkeit erhalten"],
                ["Unsicherer Gang / Sturzrisiko","Sturzprophylaxe, Hilfsmittel prüfen","Stürze vermeiden"],
                ["Zu geringe Trinkmenge","Trinkplan + Erinnerung","Ausreichende Hydrierung"],
                ["Schmerz bei Bewegung","Schmerzassessment + angepasst mobilisieren","Schmerzlinderung"],
                ["Dekubitusrisiko","Lagerungsplan + Hautkontrolle","Dekubitus vermeiden"],
              ].map(r=>`
                <tr>
                  <td><input type="checkbox" class="ppRowCheck"></td>
                  <td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `;
      }

      if (btnSelectAll){
        btnSelectAll.onclick = () => {
          modal.querySelectorAll("#ppAnamRows .ppRowCheck").forEach(cb => cb.checked = true);
        };
      }
      if (btnApply){
        btnApply.onclick = () => alert("Übernommen ✅ (Demo)");
      }
      openModal();
      return;
    }

    if (mode === "templates"){
      modalTitle.textContent = "Vorlagen";
      if (modalBody){
        modalBody.style.gridTemplateColumns = "1fr";
        modalBody.innerHTML = `
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-end; margin-bottom:12px;">
            <div class="muted">akt. Pat.: <b>${patientLabel(key)}</b></div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <select class="control" style="width:220px;" aria-label="Frequenz">
                <option>Frequenz</option>
                <option>morgens</option><option>mittags</option><option>abends</option>
                <option>1× täglich</option><option>2× täglich</option><option>3× täglich</option><option>bei Bedarf</option>
              </select>
              <input class="control" style="width:190px;" type="date" aria-label="Evaluierung" />
            </div>
          </div>

          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:12px;">
            <div style="font-weight:800;">ATL:</div>
            <select id="ppATL" class="control" style="width:280px;">
              <option value="move">Sich bewegen</option>
              <option value="wash">Sich waschen & kleiden</option>
              <option value="eat">Essen & Trinken</option>
              <option value="excrete">Ausscheiden</option>
              <option value="communicate">Kommunizieren</option>
            </select>
            <span class="muted" style="font-size:13px;">(mehr Vorlagen pro ATL)</span>
          </div>

          <table class="ppf-table" style="width:100%;">
            <thead><tr><th style="width:44px;"></th><th>Symptom</th><th>Maßnahme</th><th>Ziel</th></tr></thead>
            <tbody id="ppTplRows"></tbody>
          </table>
        `;
      }

      const tbody = modal.querySelector("#ppTplRows");
      const atlSel = modal.querySelector("#ppATL");

      function fill(key){
        if (!tbody) return;
        const rows = TEMPLATE_DATA[key] || [];
        tbody.innerHTML = rows.map(r => `
          <tr>
            <td><input type="checkbox" class="ppRowCheck"></td>
            <td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>
          </tr>
        `).join("");
      }

      fill("move");
      if (atlSel){
        atlSel.onchange = () => fill(atlSel.value);
      }

      if (btnSelectAll){
        btnSelectAll.onclick = () => {
          modal.querySelectorAll("#ppTplRows .ppRowCheck").forEach(cb => cb.checked = true);
        };
      }
      if (btnApply){
        btnApply.onclick = () => alert("Übernommen ✅ (Demo)");
      }

      openModal();
      return;
    }

    if (mode === "free"){
      modalTitle.textContent = "Frei definiert";
      if (modalBody){
        modalBody.style.gridTemplateColumns = "1fr";
        modalBody.innerHTML = `
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-end; margin-bottom:12px;">
            <div class="muted">akt. Pat.: <b>${patientLabel(key)}</b></div>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <select class="control" style="width:220px;" aria-label="Frequenz">
                <option>Frequenz</option>
                <option>morgens</option><option>mittags</option><option>abends</option>
                <option>1× täglich</option><option>2× täglich</option><option>3× täglich</option><option>bei Bedarf</option>
              </select>
              <input class="control" style="width:190px;" type="date" aria-label="Evaluierung" />
            </div>
          </div>

          <div style="display:grid; gap:12px;">
            <div class="ppf-field">
              <label>Symptom</label>
              <textarea class="ppf-small" placeholder="Symptom / Pflegeproblem …"></textarea>
            </div>
            <div class="ppf-field">
              <label>Maßnahme</label>
              <textarea class="ppf-small" placeholder="Pflegemaßnahmen …"></textarea>
            </div>
            <div class="ppf-field" style="margin-bottom:0;">
              <label>Ziel</label>
              <textarea class="ppf-small" placeholder="Pflegeziel …"></textarea>
            </div>
          </div>
        `;
      }

      // Select all doesn't apply here
      if (btnSelectAll) btnSelectAll.style.display = "none";
      if (btnApply){
        btnApply.onclick = () => alert("Übernommen ✅ (Demo)");
      }

      openModal();
      return;
    }
  }

  // -----------------------------
  // Open Buttons
  // -----------------------------
  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-open");
      openWorkflow(mode);
    });
  });

  // Patient switch
  patientSelect.addEventListener("change", renderPatient);

  // Initial
  renderPatient();
});
