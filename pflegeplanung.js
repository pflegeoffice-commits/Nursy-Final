/* Nursy – Pflegeplanung (Frontend-Demo)
   Modal UI nach Skizze: Anamnese / Vorlagen / Frei definiert
   Hinweis: Demo-Daten, keine Speicherung.
*/

(function () {
  'use strict';

  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  const demoTemplates = [
    // 13 Kategorien – Vorlagen (Demo, aber mit mehr Detail)
    // 1 Mobilität
    { atl: 'Sich bewegen', kat: 'Mobilität', symptom: 'Eingeschränkte Mobilität / unsicherer Gang', massnahme: 'Mobilisation & Gehtraining', ziel: 'Sicheres Gehen', details: [
      'Ressourcen/Defizite einschätzen (Stand, Transfer, Hilfsmittel).',
      'Kurze Einheiten, Pausen einplanen; Sturzprophylaxe parallel.',
      'Dokumentation: Strecke, Hilfsmittel, Belastbarkeit, Reaktion.'
    ]},
    { atl: 'Sich bewegen', kat: 'Mobilität', symptom: 'Kontrakturgefahr', massnahme: 'Bewegungsübungen, Lagerung, Aktivierung', ziel: 'Beweglichkeit erhalten', details: [
      'ROM-Übungen nach AO; schmerzadaptierte Mobilisation.',
      'Lagerungswechsel + Positionierung (Druck, Gelenkstellung).',
      'Dokumentation: Schmerz, Bewegungsausmaß, Hautstatus.'
    ]},

    // 2 Körperpflege
    { atl: 'Körperpflege', kat: 'Körperpflege', symptom: 'Teilweise Unterstützung bei Körperpflege', massnahme: 'Anleitung + Unterstützung morgens/abends', ziel: 'Selbstständigkeit erhalten', details: [
      'Schrittweise anleiten (Waschutensilien vorbereiten, Reihenfolge).',
      'Intimsphäre wahren, Ressourcen fördern, Pausen anbieten.',
      'Dokumentation: benötigte Hilfestufe, Hautbesonderheiten.'
    ]},

    // 3 Ernährung & Flüssigkeit
    { atl: 'Essen & Trinken', kat: 'Ernährung & Flüssigkeit', symptom: 'Unzureichende Flüssigkeitsaufnahme', massnahme: 'Trinkplan + Erinnerung', ziel: 'Ausreichende Hydrierung', details: [
      'Zielmenge festlegen; bevorzugte Getränke berücksichtigen.',
      'Trinkgefäß griffbereit; Erinnerungsintervalle vereinbaren.',
      'Dokumentation: Trinkprotokoll, Zeichen von Exsikkose.'
    ]},
    { atl: 'Essen & Trinken', kat: 'Ernährung & Flüssigkeit', symptom: 'Mangelernährungsrisiko', massnahme: 'Ernährungsprotokoll, Zwischenmahlzeiten', ziel: 'Gewicht stabil', details: [
      'Essvorlieben, Kau-/Schluckprobleme, Übelkeit abklären.',
      'Eiweiß-/Energieanreicherung, kleine Portionen, Snacks.',
      'Dokumentation: Intake, Gewicht, Verträglichkeit.'
    ]},

    // 4 Ausscheidung
    { atl: 'Ausscheiden', kat: 'Ausscheidung', symptom: 'Obstipationsrisiko', massnahme: 'Flüssigkeit, Bewegung, Ernährung', ziel: 'Regelmäßige Ausscheidung', details: [
      'Stuhlgewohnheiten erheben; Bauchstatus beobachten.',
      'Ballaststoffe/Bewegung fördern; Toilettenrhythmus planen.',
      'Dokumentation: Stuhlprotokoll, Beschwerden, Maßnahmen.'
    ]},
    { atl: 'Ausscheiden', kat: 'Ausscheidung', symptom: 'Harninkontinenz', massnahme: 'Toilettentraining, Hautschutz, Hilfsmittel', ziel: 'Hautschutz & Sicherheit', details: [
      'Miktionsplan/Toilettenzeiten vereinbaren; Trinkverhalten prüfen.',
      'Hautschutz (Barriere); passendes Inko-Material wählen.',
      'Dokumentation: Episoden, Hautstatus, Akzeptanz.'
    ]},

    // 5 Atmung
    { atl: 'Sich bewegen', kat: 'Atmung', symptom: 'Atemnot bei Belastung', massnahme: 'Atemübungen, Pausen, Oberkörper hoch', ziel: 'Dyspnoe reduziert', details: [
      'Atemerleichternde Positionen (Kutschersitz) anleiten.',
      'Belastung dosieren, Pausen, ggf. O2 nach AO/Plan.',
      'Dokumentation: Atemfrequenz, SpO2 (wenn vorhanden), Dyspnoe-Skala.'
    ]},

    // 6 Schmerz
    { atl: 'Körperpflege', kat: 'Schmerz', symptom: 'Schmerzen bei Bewegung', massnahme: 'Schmerzassessment, Lagerung, Wärme/Kälte nach Bedarf', ziel: 'Schmerz < 3/10', details: [
      'Assessment (NRS) vor/nach Maßnahme; Trigger identifizieren.',
      'Lagerung/Entlastung; nicht-medikamentöse Maßnahmen nutzen.',
      'Dokumentation: NRS, Wirkung, Nebenwirkungen/Unverträglichkeit.'
    ]},

    // 7 Wunde & Haut
    { atl: 'Körperpflege', kat: 'Wunde & Haut', symptom: 'Dekubitusrisiko', massnahme: 'Positionswechsel, Hautkontrolle, Druckentlastung', ziel: 'Haut intakt', details: [
      'Risikoeinschätzung; Lagerungsintervall festlegen.',
      'Druckentlastende Hilfsmittel prüfen; Haut täglich inspizieren.',
      'Dokumentation: Lokalisation, Hautzustand, Lagerungsplan.'
    ]},
    { atl: 'Körperpflege', kat: 'Wunde & Haut', symptom: 'Hauttrockenheit', massnahme: 'Rückfettende Pflege', ziel: 'Haut geschmeidig', details: [
      'pH-neutrale Reinigung; rückfettend eincremen (v. a. Unterschenkel).',
      'Juckreiz/Exkoriationen beobachten; Nägel kurz halten.',
      'Dokumentation: Hautzustand, Reaktion, Verträglichkeit.'
    ]},

    // 8 Schlaf & Ruhe
    { atl: 'Körperpflege', kat: 'Schlaf & Ruhe', symptom: 'Schlafstörung', massnahme: 'Schlafhygiene, Tagesstruktur, Reize reduzieren', ziel: 'Erholsamer Schlaf', details: [
      'Abendroutine; Licht/Lärm reduzieren; Tagschlaf dosieren.',
      'Entspannung/Atmung; Schmerz/Harndrang als Ursache prüfen.',
      'Dokumentation: Einschlafzeit, Durchschlafen, Einflussfaktoren.'
    ]},

    // 9 Psyche & Kommunikation
    { atl: 'Kommunizieren', kat: 'Psyche & Kommunikation', symptom: 'Angst/Unruhe', massnahme: 'Orientierung, Gespräch, Struktur', ziel: 'Ruhe & Sicherheit', details: [
      'Validieren, beruhigend sprechen; Trigger identifizieren.',
      'Tagesstruktur sichtbar machen; Bezugspersonen einbinden.',
      'Dokumentation: Auslöser, Wirkung der Interventionen.'
    ]},

    // 10 Kognition & Orientierung
    { atl: 'Kommunizieren', kat: 'Kognition & Orientierung', symptom: 'Desorientierung (Zeit/Ort)', massnahme: 'Orientierungshilfen, Tagesplan, Validation', ziel: 'Orientierung verbessert', details: [
      'Kalender/Uhr, Namensschilder, bekannte Gegenstände nutzen.',
      'Kurze, klare Sätze; Wiederholungen; Validation bei Demenz.',
      'Dokumentation: Orientierung, Kooperation, Verhalten.'
    ]},

    // 11 Sicherheit & Sturz
    { atl: 'Sich bewegen', kat: 'Sicherheit & Sturz', symptom: 'Sturzrisiko / Schwindel', massnahme: 'Sturzprophylaxe, Hilfsmittel prüfen', ziel: 'Stürze vermeiden', details: [
      'Umgebung sichern (Licht, Stolperfallen); rutschfeste Schuhe.',
      'Orthostase prüfen; Aufstehen langsam; Hilfsmittel einstellen.',
      'Dokumentation: Beinahe-Stürze, Maßnahmen, Wirksamkeit.'
    ]},

    // 12 Medikation
    { atl: 'Essen & Trinken', kat: 'Medikation', symptom: 'Unregelmäßige Medikamenteneinnahme', massnahme: 'Mediplan, Einnahme-Reminder, Kontrolle', ziel: 'Adhärenz verbessert', details: [
      'Mediplan erklären; Einnahmezeiten mit Alltag koppeln.',
      'Pillendose/Reminder; Nebenwirkungen/Wechselwirkungen beobachten.',
      'Dokumentation: Einnahme, Auffälligkeiten, Rückmeldung.'
    ]},

    // 13 Prophylaxen
    { atl: 'Körperpflege', kat: 'Prophylaxen', symptom: 'Thromboserisiko', massnahme: 'Aktivierung, Wadenpumpe, Kompression nach AO', ziel: 'Thrombose vermeiden', details: [
      'Frühmobilisation; Venengymnastik anleiten.',
      'Kompression/Heparin nur nach AO/Verordnung.',
      'Dokumentation: Schwellung/Schmerz, Umfang, Compliance.'
    ]},
  ];


  const demoAnamnese = demoTemplates.slice(0, 6); // Vorschläge aus Anamnese

  const frequencyOptions = ['Bitte wählen', '1x täglich', '2x täglich', '3x täglich', 'Wöchentlich', 'Bei Bedarf'];
  const evalOptions = ['Bitte wählen', 'täglich', 'alle 2 Tage', 'wöchentlich', 'bei Änderung'];

  function getActivePatientLabel() {
    const sel = qs('#patientSelect');
    if (!sel) return 'Name, Geb. Datum';
    const opt = sel.options[sel.selectedIndex];
    return (opt && opt.textContent) ? opt.textContent.trim() : 'Name, Geb. Datum';
  }

  function buildSelect(id, label, options, value = '') {
    const optHtml = options
      .map((t) => `<option value="${escapeHtml(t)}" ${t === value ? 'selected' : ''}>${escapeHtml(t)}</option>`)
      .join('');

    return `
      <label class="pp-field" for="${id}">
        <span class="pp-label">${escapeHtml(label)}</span>
        <select id="${id}" class="pp-control">
          ${optHtml}
        </select>
      </label>
    `;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function modalShell({ title, bodyHtml, footerHtml, wide = true }) {
    return `
      <div class="pp-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <div class="pp-modal__panel ${wide ? 'pp-modal__panel--wide' : ''}">
          <div class="pp-modal__header">
            <h2 class="pp-modal__title">${escapeHtml(title)}</h2>
            <button type="button" class="pp-modal__close" data-close aria-label="Schließen">×</button>
          </div>
          <div class="pp-modal__body">${bodyHtml}</div>
          <div class="pp-modal__footer">${footerHtml}</div>
        </div>
      </div>
    `;
  }

  function tableHtml(rows, { checkbox = true } = {}) {
    const head = `
      <div class="pp-table__head">
        ${checkbox ? '<div class="pp-table__cell pp-table__cell--check"></div>' : ''}
        <div class="pp-table__cell"><strong>Symptome</strong></div>
        <div class="pp-table__cell"><strong>Maßnahme</strong></div>
        <div class="pp-table__cell"><strong>Ziel</strong></div>
      </div>
    `;

    const body = rows
      .map((r, i) => `
        <label class="pp-table__row" data-symptom="${escapeHtml(r.symptom)}">
          ${checkbox ? `<div class="pp-table__cell pp-table__cell--check"><input type="checkbox" class="pp-rowcheck" data-rowcheck="${i}"></div>` : ''}
          <div class="pp-table__cell">${escapeHtml(r.symptom)}</div>
          <div class="pp-table__cell">${escapeHtml(r.massnahme)}</div>
          <div class="pp-table__cell">${escapeHtml(r.ziel)}</div>
        </label>
      `)
      .join('');

    return `
      <div class="pp-table" role="table">
        ${head}
        <div class="pp-table__body" role="rowgroup">${body}</div>
      </div>
    `;
  }

  function renderAnamnese() {
    const patient = getActivePatientLabel();

    const top = `
      <div class="pp-modal__top">
        <div class="pp-patientline">
          <span class="pp-muted">akt. Pat.:</span>
          <strong>${escapeHtml(patient)}</strong>
        </div>
        <div class="pp-topgrid">
          ${buildSelect('ppFreq', 'Frequenz', frequencyOptions)}
          ${buildSelect('ppEval', 'Evaluierung', evalOptions)}
        </div>
      </div>
    `;

    const body = `
      ${top}
      <div class="pp-section">
        ${tableHtml(demoAnamnese, { checkbox: true })}
        <p class="pp-hint">Tippe Checkboxen an. „Alles auswählen“ markiert alle Zeilen (Demo).</p>
      </div>
    `;

    const footer = `
      <button type="button" class="pp-btn pp-btn--ghost" data-close>Abbrechen</button>
      <button type="button" class="pp-btn" data-selectall>Alles auswählen</button>
      <button type="button" class="pp-btn pp-btn--primary" data-accept>Übernehmen</button>
    `;

    return modalShell({ title: 'Aus Anamnese übernehmen', bodyHtml: body, footerHtml: footer, wide: true });
  }

  function renderTemplates() {
    const patient = getActivePatientLabel();

    const right = `
      <div class="pp-card">
        <h3 class="pp-card__title">Einstellungen</h3>
        <div class="pp-patientline pp-patientline--small">
          <span class="pp-muted">akt. Pat.:</span>
          <strong>${escapeHtml(patient)}</strong>
        </div>
        <div class="pp-stack">
          ${buildSelect('ppFreq2', 'Frequenz', frequencyOptions)}
          ${buildSelect('ppEval2', 'Evaluierung', evalOptions)}
          ${buildSelect('ppAtl', 'ATL auswählen', ['Bitte wählen', 'Sich bewegen', 'Essen & Trinken', 'Ausscheiden', 'Körperpflege', 'Kommunizieren'])}
          ${buildSelect('ppKat', 'Kategorie', ['Bitte wählen', 'Mobilität', 'Körperpflege', 'Ernährung & Flüssigkeit', 'Ausscheidung', 'Atmung', 'Schmerz', 'Wunde & Haut', 'Schlaf & Ruhe', 'Psyche & Kommunikation', 'Kognition & Orientierung', 'Sicherheit & Sturz', 'Medikation', 'Prophylaxen'])}
          <label class="pp-field">
            <span class="pp-label">Suche</span>
            <input id="ppSearch" class="pp-control" type="text" placeholder="z.B. Sturz, Schmerz, Dekubitus …">
          </label>
          <div class="pp-card" style="padding:12px;border-radius:14px;background:rgba(63,111,232,.04);border:1px solid rgba(63,111,232,.16);">
            <div class="pp-label" style="margin-bottom:6px;">Details</div>
            <div id="ppTplDetail" class="pp-hint" style="margin:0;">Tippe auf eine Vorlage (Zeile), um Details zu sehen.</div>
          </div>
        </div>
      </div>
    `;

    const left = `
      <div class="pp-card">
        <h3 class="pp-card__title">Vorlagenliste</h3>
        <div id="ppTemplateTable">
          ${tableHtml(demoTemplates, { checkbox: true })}
        </div>
        <p class="pp-hint">Filter & Suche wirken sofort. Danach auswählen und übernehmen.</p>
      </div>
    `;

    const body = `
      <div class="pp-grid2">
        ${left}
        ${right}
      </div>
    `;

    const footer = `
      <button type="button" class="pp-btn pp-btn--ghost" data-close>Abbrechen</button>
      <button type="button" class="pp-btn" data-selectall>Alles auswählen</button>
      <button type="button" class="pp-btn pp-btn--primary" data-accept>Übernehmen</button>
    `;

    return modalShell({ title: 'Vorlagen', bodyHtml: body, footerHtml: footer, wide: true });
  }

  function renderFree() {
    const patient = getActivePatientLabel();

    const left = `
      <div class="pp-card">
        <h3 class="pp-card__title">Freie Planung</h3>
        <div class="pp-stack">
          <label class="pp-field">
            <span class="pp-label">Symptom</span>
            <textarea class="pp-control pp-control--ta" rows="3" placeholder="Symptom / Pflegeproblem …"></textarea>
          </label>
          <label class="pp-field">
            <span class="pp-label">Maßnahme</span>
            <textarea class="pp-control pp-control--ta" rows="3" placeholder="Pflegemaßnahmen …"></textarea>
          </label>
          <label class="pp-field">
            <span class="pp-label">Ziel</span>
            <textarea class="pp-control pp-control--ta" rows="3" placeholder="Pflegeziel …"></textarea>
          </label>
        </div>
      </div>
    `;

    const right = `
      <div class="pp-card">
        <h3 class="pp-card__title">Einstellungen</h3>
        <div class="pp-patientline pp-patientline--small">
          <span class="pp-muted">akt. Pat.:</span>
          <strong>${escapeHtml(patient)}</strong>
        </div>
        <div class="pp-topgrid pp-topgrid--tight">
          ${buildSelect('ppFreq3', 'Frequenz', frequencyOptions)}
          ${buildSelect('ppEval3', 'Evaluierung', evalOptions)}
        </div>
        <p class="pp-hint">Demo: keine Speicherung/Logik.</p>
      </div>
    `;

    const body = `
      <div class="pp-grid2 pp-grid2--free">
        ${left}
        ${right}
      </div>
    `;

    const footer = `
      <button type="button" class="pp-btn pp-btn--ghost" data-close>Abbrechen</button>
      <button type="button" class="pp-btn pp-btn--primary" data-accept>Übernehmen</button>
    `;

    return modalShell({ title: 'Frei definiert', bodyHtml: body, footerHtml: footer, wide: false });
  }

  function attachModalHandlers(modalEl) {
    // Close
    qsa('[data-close]', modalEl).forEach((btn) => {
      btn.addEventListener('click', () => closeModal());
    });

    // Click outside panel closes
    modalEl.addEventListener('click', (e) => {
      const panel = qs('.pp-modal__panel', modalEl);
      if (panel && !panel.contains(e.target)) closeModal();
    });

    // Escape closes
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey, { once: true });

    // Select all
    const selectAllBtn = qs('[data-selectall]', modalEl);
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        qsa('.pp-rowcheck', modalEl).forEach((c) => (c.checked = true));
      });
    }

    // Accept
    const acceptBtn = qs('[data-accept]', modalEl);
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {

        const planBody = document.getElementById('planBody');
        if (!planBody) {
          closeModal();
          return;
        }

        // Frequenz + Evaluierung aus dem aktiven Modal lesen (je nach Dialog-ID)
        const freqEl = qs('#ppFreq, #ppFreq2, #ppFreq3', modalEl);
        const evalEl = qs('#ppEval, #ppEval2, #ppEval3', modalEl);

        const freqValRaw = freqEl ? String(freqEl.value || '').trim() : '';
        const evalValRaw = evalEl ? String(evalEl.value || '').trim() : '';

        const freqVal = (freqValRaw && freqValRaw !== 'Bitte wählen') ? freqValRaw : '';
        const evalVal = (evalValRaw && evalValRaw !== 'Bitte wählen') ? evalValRaw : '';

        function addDays(d, n){
          const x = new Date(d.getTime());
          x.setDate(x.getDate() + n);
          return x;
        }
        const today = new Date();
        const plannedStr = today.toLocaleDateString('de-DE');

        let evalStr = '—';
        if (evalVal === 'täglich') evalStr = addDays(today, 1).toLocaleDateString('de-DE');
        else if (evalVal === 'alle 2 Tage') evalStr = addDays(today, 2).toLocaleDateString('de-DE');
        else if (evalVal === 'wöchentlich') evalStr = addDays(today, 7).toLocaleDateString('de-DE');
        else if (evalVal === 'bei Änderung') evalStr = 'bei Änderung';

        const checked = qsa('.pp-rowcheck:checked', modalEl);

        if (checked.length > 0) {
          checked.forEach(cb => {
            const row = cb.closest('.pp-table__row');
            if (!row) return;

            const cells = qsa('.pp-table__cell', row);
            if (cells.length < 4) return;

            const diagnose = cells[1].textContent.trim();
            const massnahmeBase = cells[2].textContent.trim();
            const ziel = cells[3].textContent.trim();

            const massnahme = freqVal ? `${massnahmeBase} (${freqVal})` : massnahmeBase;

            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td class="pp-date">${plannedStr}</td>
              <td>${diagnose}</td>
              <td>${massnahme}</td>
              <td>${ziel}</td>
              <td class="pp-date pp-date--right">${evalStr}</td>
            `;
            planBody.appendChild(tr);
          });
        } else {
          const textareas = qsa('textarea', modalEl);
          if (textareas.length >= 3) {
            const diagnose = textareas[0].value.trim();
            const massnahmeBase = textareas[1].value.trim();
            const ziel = textareas[2].value.trim();

            const massnahme = freqVal ? `${massnahmeBase} (${freqVal})` : massnahmeBase;

            if (diagnose || massnahmeBase || ziel) {
              const tr = document.createElement('tr');
              tr.innerHTML = `
                <td class="pp-date">${plannedStr}</td>
                <td>${diagnose}</td>
                <td>${massnahme}</td>
                <td>${ziel}</td>
                <td class="pp-date pp-date--right">${evalStr}</td>
              `;
              planBody.appendChild(tr);
            }
          }
        }

        acceptBtn.blur();
        closeModal();
      });
    }
    // Templates: Filter-Logik (ATL + Kategorie + Suche) + Detail-Preview
    const tplWrap = qs('#ppTemplateTable', modalEl);
    const atlSel = qs('#ppAtl', modalEl);
    const katSel = qs('#ppKat', modalEl);
    const searchInp = qs('#ppSearch', modalEl);
    const detailBox = qs('#ppTplDetail', modalEl);

    if (tplWrap && (atlSel || katSel || searchInp)) {
      let lastFiltered = demoTemplates.slice();

      const norm = (s) => String(s || '').toLowerCase().trim();

      const applyFilters = () => {
        const atl = atlSel ? String(atlSel.value || '').trim() : '';
        const kat = katSel ? String(katSel.value || '').trim() : '';
        const q = searchInp ? norm(searchInp.value) : '';

        const atlOk = (atl && atl !== 'Bitte wählen') ? atl : '';
        const katOk = (kat && kat !== 'Bitte wählen') ? kat : '';

        lastFiltered = demoTemplates.filter((t) => {
          const okAtl = !atlOk || t.atl === atlOk;
          const okKat = !katOk || t.kat === katOk;
          const okQ = !q || (norm(t.symptom).includes(q) || norm(t.massnahme).includes(q) || norm(t.ziel).includes(q));
          return okAtl && okKat && okQ;
        });

        tplWrap.innerHTML = tableHtml(lastFiltered, { checkbox: true }) +
          (lastFiltered.length ? '' : '<p class="pp-hint">Keine Treffer – Filter/Suche anpassen.</p>');

        // reset details on rerender
        if (detailBox) detailBox.innerHTML = 'Tippe auf eine Vorlage (Zeile), um Details zu sehen.';
      };

      if (atlSel) atlSel.addEventListener('change', applyFilters);
      if (katSel) katSel.addEventListener('change', applyFilters);
      if (searchInp) searchInp.addEventListener('input', applyFilters);

      tplWrap.addEventListener('click', (e) => {
        const row = e.target && e.target.closest ? e.target.closest('.pp-table__row') : null;
        if (!row || !detailBox) return;

        const sym = row.getAttribute('data-symptom') || '';
        const t = lastFiltered.find(x => x.symptom === sym) || demoTemplates.find(x => x.symptom === sym);
        if (!t) return;

        const bullets = (t.details && t.details.length)
          ? ('<ul style="margin:8px 0 0; padding-left: 18px;">' + t.details.map(d => '<li>' + escapeHtml(d) + '</li>').join('') + '</ul>')
          : '';

        detailBox.innerHTML = ''
          + '<div><strong>' + escapeHtml(t.symptom) + '</strong></div>'
          + '<div class="pp-hint" style="margin:6px 0 0;"><b>Maßnahme:</b> ' + escapeHtml(t.massnahme) + '</div>'
          + '<div class="pp-hint" style="margin:4px 0 0;"><b>Ziel:</b> ' + escapeHtml(t.ziel) + '</div>'
          + '<div class="pp-hint" style="margin:4px 0 0;"><b>ATL/Kategorie:</b> ' + escapeHtml(t.atl) + ' · ' + escapeHtml(t.kat) + '</div>'
          + bullets;
      });

      applyFilters();
    }

  }

  function openModal(kind) {
    const root = qs('#modalRoot');
    if (!root) return;

    let html = '';
    if (kind === 'anam') html = renderAnamnese();
    else if (kind === 'templates') html = renderTemplates();
    else if (kind === 'free') html = renderFree();
    else html = modalShell({ title: 'Hinweis', bodyHtml: '<p>Unbekannter Dialog.</p>', footerHtml: '<button class="pp-btn pp-btn--primary" data-close>OK</button>', wide: false });

    root.innerHTML = html;

    const modalEl = qs('.pp-modal', root);
    if (!modalEl) return;

    // lock scroll
    document.documentElement.classList.add('pp-modal-open');

    // focus close button
    const closeBtn = qs('.pp-modal__close', modalEl);
    if (closeBtn) closeBtn.focus();

    attachModalHandlers(modalEl);
  }

  function closeModal() {
    const root = qs('#modalRoot');
    if (!root) return;
    root.innerHTML = '';
    document.documentElement.classList.remove('pp-modal-open');
  }

  function wireOpenButtons() {
    qsa('[data-open]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const kind = btn.getAttribute('data-open');
        openModal(kind);
      });
    });
  }

  function init() {
    wireOpenButtons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
