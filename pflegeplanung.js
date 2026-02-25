/* Nursy – Pflegeplanung (Frontend-Demo)
   Modal UI nach Skizze: Anamnese / Vorlagen / Frei definiert
   Hinweis: Demo-Daten, keine Speicherung.
*/

(function () {
  'use strict';

  const qs = (sel, el = document) => el.querySelector(sel);
  const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  const demoTemplates = [
    // Mobilität
    { atl: 'Sich bewegen', kat: 'Mobilität', symptom: 'Eingeschränkte Mobilität / unsicherer Gang', massnahme: 'Mobilisation & Gehtraining', ziel: 'Sicheres Gehen' },
    { atl: 'Sich bewegen', kat: 'Mobilität', symptom: 'Sturzrisiko / Schwindel', massnahme: 'Sturzprophylaxe, Hilfsmittel prüfen', ziel: 'Stürze vermeiden' },
    { atl: 'Sich bewegen', kat: 'Mobilität', symptom: 'Kontrakturgefahr', massnahme: 'Bewegungsübungen, Lagerung, Aktivierung', ziel: 'Beweglichkeit erhalten' },
    { atl: 'Sich bewegen', kat: 'Mobilität', symptom: 'Schmerzen (Bewegung)', massnahme: 'Schmerzmanagement, Lagerung', ziel: 'Schmerz reduziert' },

    // Körperpflege
    { atl: 'Körperpflege', kat: 'Körperpflege', symptom: 'Teilweise Unterstützung bei Körperpflege', massnahme: 'Anleitung + Unterstützung morgens/abends', ziel: 'Selbstständigkeit erhalten' },
    { atl: 'Körperpflege', kat: 'Körperpflege', symptom: 'Hauttrockenheit', massnahme: 'Rückfettende Pflege', ziel: 'Haut geschmeidig' },
    { atl: 'Körperpflege', kat: 'Körperpflege', symptom: 'Dekubitusrisiko', massnahme: 'Positionswechsel, Hautkontrolle', ziel: 'Haut intakt' },
    { atl: 'Körperpflege', kat: 'Körperpflege', symptom: 'Intertrigo-/Wundheilungsrisiko', massnahme: 'Hautinspektion, trocken halten, Schutzcreme', ziel: 'Entzündung vermeiden' },

    // Essen & Trinken / Ernährung
    { atl: 'Essen & Trinken', kat: 'Ernährung', symptom: 'Unzureichende Flüssigkeitsaufnahme', massnahme: 'Trinkplan + Erinnerung', ziel: 'Ausreichende Hydrierung' },
    { atl: 'Essen & Trinken', kat: 'Ernährung', symptom: 'Appetitlosigkeit', massnahme: 'Kleine Mahlzeiten, Wunschkost', ziel: 'Ausreichende Energiezufuhr' },
    { atl: 'Essen & Trinken', kat: 'Ernährung', symptom: 'Dysphagie-Verdacht', massnahme: 'Konsistenz anpassen, Schlucktraining anleiten', ziel: 'Aspirationsrisiko reduziert' },
    { atl: 'Essen & Trinken', kat: 'Ernährung', symptom: 'Mangelernährungsrisiko', massnahme: 'Ernährungsprotokoll, Zwischenmahlzeiten', ziel: 'Gewicht stabil' },

    // Ausscheiden
    { atl: 'Ausscheiden', kat: 'Ausscheidung', symptom: 'Obstipationsrisiko', massnahme: 'Flüssigkeit, Bewegung, Ernährung', ziel: 'Regelmäßige Ausscheidung' },
    { atl: 'Ausscheiden', kat: 'Ausscheidung', symptom: 'Harninkontinenz', massnahme: 'Toilettentraining, Hautschutz, Hilfsmittel', ziel: 'Hautschutz & Sicherheit' },
    { atl: 'Ausscheiden', kat: 'Ausscheidung', symptom: 'Harnwegsinfekt-Risiko', massnahme: 'Trinkmenge fördern, Intimhygiene, Beobachtung', ziel: 'Infekt vermeiden' },

    // Atmung / Belastung
    { atl: 'Sich bewegen', kat: 'Mobilität', symptom: 'Atemnot bei Belastung', massnahme: 'Atemübungen, Pausen', ziel: 'Belastbarkeit verbessert' },

    // Ruhe / Schlaf / Psyche (als zusätzliche Vorlagen)
    { atl: 'Körperpflege', kat: 'Körperpflege', symptom: 'Schlafstörung', massnahme: 'Schlafhygiene, Tagesstruktur', ziel: 'Erholsamer Schlaf' },
    { atl: 'Körperpflege', kat: 'Körperpflege', symptom: 'Angst/Unruhe', massnahme: 'Orientierung, Gespräch, Struktur', ziel: 'Ruhe & Sicherheit' },
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
        <label class="pp-table__row">
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
          ${buildSelect('ppAtl', 'ATL auswählen', ['Bitte wählen', 'Sich bewegen', 'Essen & Trinken', 'Ausscheiden', 'Körperpflege'])}
          ${buildSelect('ppKat', 'Kategorie', ['Bitte wählen', 'Mobilität', 'Körperpflege', 'Ernährung', 'Ausscheidung'])}
          <p class="pp-hint">Demo: Filter ohne Logik.</p>
        </div>
      </div>
    `;

    const left = `
      <div class="pp-card">
        <h3 class="pp-card__title">Vorlagenliste</h3>
        <div id="ppTemplateTable">
          ${tableHtml(demoTemplates, { checkbox: true })}
        </div>
        <p class="pp-hint">Filter wirken sofort (ATL/Kategorie). Danach auswählen und übernehmen.</p>
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
        // Demo feedback
        acceptBtn.blur();
        closeModal();
      });
    }

    // Templates: Filter-Logik (ATL + Kategorie)
    const tplWrap = qs('#ppTemplateTable', modalEl);
    const atlSel = qs('#ppAtl', modalEl);
    const katSel = qs('#ppKat', modalEl);
    if (tplWrap && (atlSel || katSel)) {
      const applyFilters = () => {
        const atl = atlSel ? String(atlSel.value || '').trim() : '';
        const kat = katSel ? String(katSel.value || '').trim() : '';

        const atlOk = (atl && atl !== 'Bitte wählen') ? atl : '';
        const katOk = (kat && kat !== 'Bitte wählen') ? kat : '';

        const filtered = demoTemplates.filter((t) => {
          const okAtl = !atlOk || t.atl === atlOk;
          const okKat = !katOk || t.kat === katOk;
          return okAtl && okKat;
        });

        tplWrap.innerHTML = tableHtml(filtered.length ? filtered : [], { checkbox: true }) +
          (filtered.length ? '' : '<p class="pp-hint">Keine Treffer – Filter anpassen.</p>');
      };

      if (atlSel) atlSel.addEventListener('change', applyFilters);
      if (katSel) katSel.addEventListener('change', applyFilters);
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
