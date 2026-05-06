// OPD Consultation Summary Generator
// KIMS MACS Onco Sciences

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  // Default today's date on load
  const todayInput = $('#date');
  if (todayInput && !todayInput.value) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    todayInput.value = `${yyyy}-${mm}-${dd}`;
  }

  // Format a date input value (yyyy-mm-dd) to readable form
  function formatDate(value) {
    if (!value) return '';
    const [y, m, d] = value.split('-');
    if (!y || !m || !d) return value;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setText(field, text) {
    const nodes = document.querySelectorAll(`[data-field="${field}"]`);
    nodes.forEach((n) => { n.textContent = text || '—'; });
  }

  function toggleSection(sectionName, hasContent) {
    const sec = document.querySelector(`[data-section="${sectionName}"]`);
    if (sec) sec.style.display = hasContent ? '' : 'none';
  }

  function buildPrintSummary() {
    const name = val('name');
    const age = val('age');
    const sex = val('sex');
    const date = formatDate(val('date'));
    const mrn = val('mrn');

    setText('name', name);
    setText('ageSex', [age, sex].filter(Boolean).join(' / '));
    setText('date', date);
    setText('mrn', mrn);

    // Vitals one-liner
    const wt = val('weight');
    const ht = val('height');
    const bsa = val('bsa');
    const ecog = val('ecog');

    const vitalsParts = [];
    if (wt) vitalsParts.push(`Wt: ${wt} kg`);
    if (ht) vitalsParts.push(`Ht: ${ht} cm`);
    if (bsa) vitalsParts.push(`BSA: ${bsa} m²`);
    if (ecog !== '') vitalsParts.push(`ECOG: ${ecog}`);
    setText('vitalsLine', vitalsParts.join('  •  '));

    const fields = [
      'complaints', 'hpi', 'pastHistory',
      'personalHistory', 'familyHistory',
      'generalExam', 'systemicExam',
      'diagnosis', 'plan', 'prescription',
      'otherNotes'
    ];
    fields.forEach((f) => setText(f, val(f)));

    // Consultant lookup
    const consultants = {
      suresh:    { name: 'Dr Suresh Babu MC',   qual: 'MBBS, MD, DM', role: 'Director, Department of Medical Oncology', kmc: 'KMC No: 60989' },
      prathyusha:{ name: 'Dr Prathyusha Eaga',  qual: 'MBBS, MD, DM', role: 'Attending Consultant, Medical Oncology',   kmc: 'KMC No: 158021' },
      chetan:    { name: 'Dr Chetan V',         qual: 'MBBS, MD, DNB, DM', role: 'Specialist, Medical Oncology',         kmc: 'KMC No: 118210' },
      vivek:     { name: 'Dr Vivek B Maleyur',  qual: 'MBBS, MD, DM', role: 'Specialist, Medical Oncology',              kmc: 'KMC No: 128134' }
    };
    const c = consultants[val('consultant')] || { name: '', qual: '', role: '', kmc: '' };
    setText('doctorName', c.name);
    setText('doctorDesignation', c.qual);
    setText('doctorRole', c.role);
    setText('doctorKMC', c.kmc);

    // Follow-up line
    const fuDate = formatDate(val('followupDate'));
    const fuNotes = val('followupNotes');
    let fuLine = '';
    if (fuDate && fuNotes) fuLine = `${fuDate} — ${fuNotes}`;
    else if (fuDate) fuLine = fuDate;
    else if (fuNotes) fuLine = fuNotes;
    setText('followupLine', fuLine);

    // Hide print sections that are empty
    toggleSection('complaints', !!val('complaints'));
    toggleSection('hpi', !!val('hpi'));
    toggleSection('pastHistory', !!val('pastHistory'));
    toggleSection('personalFamily', !!(val('personalHistory') || val('familyHistory')));
    toggleSection('exam', !!(vitalsParts.length || val('generalExam') || val('systemicExam')));
    toggleSection('diagnosis', !!val('diagnosis'));
    toggleSection('plan', !!val('plan'));
    toggleSection('prescription', !!val('prescription'));
    toggleSection('followup', !!fuLine);

    // Build chemo plan section for print
    const planChemo = document.getElementById('planChemoToggle');
    const reg = getSelectedRegimen();
    const showChemo = !!(planChemo && planChemo.checked && reg);
    toggleSection('chemo', showChemo);
    if (showChemo) buildPrintChemoSection(reg);
    toggleSection('otherNotes', !!val('otherNotes'));
  }

  // Use patient name in the saved PDF filename
  function setPdfTitle() {
    const name = val('name');
    const date = val('date') || '';
    const safeName = name ? name.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_') : 'Patient';
    document.title = `OPD_Summary_${safeName}_${date}`;
  }

  function restoreTitle() {
    document.title = 'OPD Consultation Summary — KIMS MACS Onco Sciences';
  }

  // Auto-calculate BSA (Mosteller): sqrt((height_cm * weight_kg) / 3600)
  function calculateBSA() {
    const wt = parseFloat(document.getElementById('weight').value);
    const ht = parseFloat(document.getElementById('height').value);
    const bsaField = document.getElementById('bsa');
    if (!bsaField) return;
    if (wt > 0 && ht > 0) {
      const bsa = Math.sqrt((ht * wt) / 3600);
      bsaField.value = bsa.toFixed(2);
    } else {
      bsaField.value = '';
    }
  }

  ['weight', 'height'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      calculateBSA();
      renderChemoTable();
    });
  });

  // ============================================================
  // Chemotherapy Planner
  // ============================================================

  const SKIP_ROUNDING_DRUGS = [
    'pembrolizumab', 'nivolumab', 'atezolizumab', 'durvalumab', 'cemiplimab',
    'dostarlimab', 'tislelizumab', 'avelumab', 'ipilimumab', 'tremelimumab',
    'trastuzumab', 'pertuzumab', 'rituximab', 'cetuximab', 'panitumumab',
    'bevacizumab', 'ramucirumab', 'brentuximab', 'bortezomib', 'zolbetuximab',
    'trastuzumab deruxtecan', 'trastuzumab emtansine', 't-dxd', 't-dm1',
    'letrozole', 'anastrozole', 'exemestane', 'palbociclib', 'abemaciclib',
    'ribociclib', 'fulvestrant'
  ];

  function shouldSkipRounding(drugName) {
    const n = drugName.toLowerCase();
    return SKIP_ROUNDING_DRUGS.some((d) => n.includes(d));
  }

  // Tiered dose rounding (matches OncoCalcRx tiers).
  // Biologics, oral targeted therapies, and hormonal therapies skip rounding entirely
  // and return the precise calculated value (max 2 decimals to avoid float artefacts).
  // Capecitabine is an oral chemo, NOT targeted/hormonal — it falls through to the tiered rounder.
  function roundDose(dose, drugName) {
    if (!isFinite(dose) || dose <= 0) return 0;
    if (shouldSkipRounding(drugName)) {
      return Math.round(dose * 100) / 100;
    }
    if (dose < 10)   return Math.round(dose);
    if (dose < 100)  return Math.round(dose / 5) * 5;
    if (dose < 500)  return Math.round(dose / 10) * 10;
    if (dose < 2000) return Math.round(dose / 50) * 50;
    return Math.round(dose / 100) * 100;
  }

  // Cockcroft-Gault GFR (mL/min)
  function calculateGFR(age, weightKg, creat, sex) {
    if (!age || !weightKg || !creat) return null;
    let gfr = ((140 - age) * weightKg) / (72 * creat);
    if (sex === 'female') gfr *= 0.85;
    return gfr;
  }

  // Calvert: dose (mg) = AUC × (GFR + 25), GFR capped at 125 mL/min
  function calvertDose(auc, gfr) {
    if (!auc || gfr == null) return null;
    const cappedGfr = Math.min(gfr, 125);
    return auc * (cappedGfr + 25);
  }

  // Populate the cancer type dropdown
  function initChemoPlanner() {
    const cancerSel = document.getElementById('chemoCancer');
    if (!cancerSel || !window.CANCER_TYPES) return;
    window.CANCER_TYPES.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.key;
      opt.textContent = c.label;
      cancerSel.appendChild(opt);
    });
  }

  function getSelectedRegimen() {
    const cancer = document.getElementById('chemoCancer').value;
    const regKey = document.getElementById('chemoRegimen').value;
    if (!cancer || !regKey || !window.REGIMENS[cancer]) return null;
    return window.REGIMENS[cancer].find((r) => r.key === regKey) || null;
  }

  function regimenHasCarboplatin(reg) {
    if (!reg) return false;
    return reg.drugs.some((d) => d.unit === 'AUC');
  }

  function onCancerChange() {
    const cancer = document.getElementById('chemoCancer').value;
    const regSel = document.getElementById('chemoRegimen');
    regSel.innerHTML = '<option value="">— Select regimen —</option>';
    if (cancer && window.REGIMENS[cancer]) {
      window.REGIMENS[cancer].forEach((r) => {
        const opt = document.createElement('option');
        opt.value = r.key;
        opt.textContent = r.name;
        regSel.appendChild(opt);
      });
      regSel.disabled = false;
    } else {
      regSel.disabled = true;
    }
    onRegimenChange();
  }

  function onRegimenChange() {
    const reg = getSelectedRegimen();
    const carbSection = document.getElementById('carbSection');
    if (reg && regimenHasCarboplatin(reg)) {
      carbSection.hidden = false;
    } else {
      carbSection.hidden = true;
    }
    renderChemoTable();
  }

  // Pull age (number) from top "Age" text input — handles "54", "54 years", "54 yrs", etc.
  function getPatientAgeFromTop() {
    const raw = (document.getElementById('age')?.value || '').trim();
    const match = raw.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }

  function getPatientSexFromTop() {
    const raw = (document.getElementById('sex')?.value || '').trim().toLowerCase();
    if (raw === 'male' || raw === 'female') return raw;
    return '';
  }

  function renderChemoTable() {
    const target = document.getElementById('chemoTablePreview');
    if (!target) return;
    const reg = getSelectedRegimen();
    if (!reg) { target.innerHTML = ''; return; }

    const wt = parseFloat(document.getElementById('weight').value) || null;
    const ht = parseFloat(document.getElementById('height').value) || null;
    const bsa = (wt && ht) ? Math.sqrt((ht * wt) / 3600) : null;

    const age   = getPatientAgeFromTop();
    const creat = parseFloat(document.getElementById('chemoCreat').value) || null;
    const sex   = getPatientSexFromTop();
    const gfr   = calculateGFR(age, wt, creat, sex);

    // Update GFR/Calvert display
    const carbCalcEl = document.getElementById('carbCalc');
    if (carbCalcEl) {
      if (regimenHasCarboplatin(reg) && gfr != null) {
        carbCalcEl.innerHTML =
          `<strong>Using:</strong> Age ${age} • ${sex === 'female' ? 'Female' : 'Male'} • Wt ${wt} kg • Creat ${creat} mg/dL` +
          `<br><strong>Cockcroft-Gault GFR:</strong> ${gfr.toFixed(1)} mL/min` +
          (gfr > 125 ? ` <em>(capped at 125 for Calvert)</em>` : '');
      } else if (regimenHasCarboplatin(reg)) {
        const missing = [];
        if (!age)   missing.push('Age (top of form)');
        if (!sex)   missing.push('Sex (top of form)');
        if (!wt)    missing.push('Weight (Examination)');
        if (!creat) missing.push('Creatinine');
        carbCalcEl.innerHTML = `<em>Need: ${missing.join(', ')}</em>`;
      } else {
        carbCalcEl.innerHTML = '';
      }
    }

    let html = '<table class="chemo-table"><thead><tr><th>Drug</th><th>Dose</th><th>Calculated</th><th>Schedule</th></tr></thead><tbody>';

    reg.drugs.forEach((d) => {
      const calc = calculateDrugDose(d, { bsa, wt, gfr });
      const stdDose = formatStandardDose(d);
      html += `<tr>
        <td>${d.name}</td>
        <td>${stdDose}</td>
        <td class="dose-cell">${calc}</td>
        <td class="sched-cell">${d.schedule}</td>
      </tr>`;
    });

    html += '</tbody></table>';
    target.innerHTML = html;
  }

  function formatStandardDose(drug) {
    if (drug.unit === 'AUC')   return `AUC ${drug.dose}`;
    if (drug.unit === 'mg/m²') return `${drug.dose} mg/m²`;
    if (drug.unit === 'mg/kg') return `${drug.dose} mg/kg`;
    if (drug.unit === 'mg')    return `${drug.dose} mg`;
    if (drug.unit === 'flat')  return `${drug.dose} mg`;
    return `${drug.dose} ${drug.unit}`;
  }

  function calculateDrugDose(drug, ctx) {
    const { bsa, wt, gfr } = ctx;

    // AUC (Calvert)
    if (drug.unit === 'AUC') {
      if (gfr == null) return '<em>Need GFR</em>';
      const total = calvertDose(drug.dose, gfr);
      return total != null ? `${roundDose(total, drug.name)} mg` : '—';
    }

    // mg/m²
    if (drug.unit === 'mg/m²') {
      if (!bsa) return '<em>Need BSA</em>';
      const calc = drug.dose * bsa;
      const main = roundDose(calc, drug.name);
      if (drug.loadingDose) {
        const ld = roundDose(drug.loadingDose * bsa, drug.name);
        return `Loading: ${ld} mg<br>Maintenance: ${main} mg`;
      }
      return `${main} mg`;
    }

    // mg/kg
    if (drug.unit === 'mg/kg') {
      if (!wt) return '<em>Need weight</em>';
      const calc = drug.dose * wt;
      const main = roundDose(calc, drug.name);
      if (drug.loadingDose) {
        const ld = roundDose(drug.loadingDose * wt, drug.name);
        return `Loading: ${ld} mg<br>Maintenance: ${main} mg`;
      }
      return `${main} mg`;
    }

    // Flat dose (mg) — incl. immunotherapy and oral
    if (drug.unit === 'mg' || drug.unit === 'flat') {
      if (drug.loadingDose) {
        return `Loading: ${drug.loadingDose} mg<br>Maintenance: ${drug.dose} mg`;
      }
      return `${drug.dose} mg`;
    }

    return '—';
  }

  // Wire chemo planner events
  function setupChemoPlanner() {
    initChemoPlanner();

    const toggle = document.getElementById('planChemoToggle');
    const area   = document.getElementById('chemoPlannerArea');
    if (toggle && area) {
      toggle.addEventListener('change', () => {
        area.hidden = !toggle.checked;
      });
    }

    const cancerSel = document.getElementById('chemoCancer');
    if (cancerSel) cancerSel.addEventListener('change', onCancerChange);

    const regSel = document.getElementById('chemoRegimen');
    if (regSel) regSel.addEventListener('change', onRegimenChange);

    // Re-render chemo table when patient details (age, sex) or creatinine change
    ['age', 'sex', 'chemoCreat'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', renderChemoTable);
        el.addEventListener('change', renderChemoTable);
      }
    });
  }

  setupChemoPlanner();

  // ============================================================
  // localStorage helpers — Auto-save draft + Saved patients
  // ============================================================

  const LS_DRAFT_KEY    = 'summarygenerator.draft';
  const LS_PATIENTS_KEY = 'summarygenerator.patients';
  const MAX_PATIENTS    = 50;

  // One-time cleanup of any stale dismissal key from earlier banner-based design
  try { localStorage.removeItem('summarygenerator.draftDismissedAt'); } catch (e) {}

  // Fields to persist (form state)
  const FIELDS = [
    'name', 'age', 'sex', 'date', 'mrn',
    'complaints', 'hpi', 'pastHistory',
    'personalHistory', 'familyHistory',
    'height', 'weight', 'bsa', 'ecog',
    'generalExam', 'systemicExam',
    'diagnosis',
    'plan', 'otherNotes', 'prescription',
    'followupDate', 'followupNotes',
    'consultant',
    'chemoCancer', 'chemoRegimen', 'chemoCreat', 'chemoCycleNotes'
  ];

  function getFormState() {
    const state = {};
    FIELDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) state[id] = el.value;
    });
    state.planChemoToggle = document.getElementById('planChemoToggle')?.checked || false;
    return state;
  }

  function setFormState(state) {
    if (!state) return;
    FIELDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el || state[id] === undefined) return;
      el.value = state[id];
    });
    // Restore chemo toggle and rebuild dependent UI
    const toggle = document.getElementById('planChemoToggle');
    if (toggle) {
      toggle.checked = !!state.planChemoToggle;
      const area = document.getElementById('chemoPlannerArea');
      if (area) area.hidden = !toggle.checked;
    }
    // Cascading: rebuild regimen dropdown for the loaded cancer type, then reselect regimen
    if (state.chemoCancer) {
      onCancerChange();
      const regSel = document.getElementById('chemoRegimen');
      if (regSel && state.chemoRegimen) regSel.value = state.chemoRegimen;
      onRegimenChange();
    }
    // Recalc BSA + chemo table
    calculateBSA();
    renderChemoTable();
  }

  function clearFormState() {
    document.getElementById('opdForm').reset();
    // Reset today's date
    if (todayInput) {
      const now = new Date();
      todayInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    document.getElementById('chemoPlannerArea').hidden = true;
    document.getElementById('carbSection').hidden = true;
    document.getElementById('chemoTablePreview').innerHTML = '';
    const regSel = document.getElementById('chemoRegimen');
    if (regSel) { regSel.innerHTML = '<option value="">— Select cancer first —</option>'; regSel.disabled = true; }
    document.getElementById('bsa').value = '';
  }

  // ----- Auto-save draft -----
  let saveTimer = null;
  function scheduleAutosave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDraft, 800);
  }

  // A draft is "meaningful" only if at least one substantive clinical field has content.
  // The date field is auto-filled on load, so we ignore it for this check.
  const MEANINGFUL_FIELDS = [
    'name', 'mrn', 'complaints', 'hpi', 'pastHistory',
    'personalHistory', 'familyHistory', 'generalExam', 'systemicExam',
    'diagnosis', 'plan', 'otherNotes', 'prescription',
    'followupNotes', 'chemoCancer', 'chemoCycleNotes'
  ];

  function isDraftMeaningful(state) {
    if (!state) return false;
    return MEANINGFUL_FIELDS.some((f) => (state[f] || '').toString().trim().length > 0);
  }

  function saveDraft() {
    if (!userHasInteracted) return; // ignore autofill / browser-restored values
    try {
      const state = getFormState();
      if (!isDraftMeaningful(state)) {
        localStorage.removeItem(LS_DRAFT_KEY);
        if (typeof updateResumeButton === 'function') updateResumeButton();
        return;
      }
      localStorage.setItem(LS_DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), state }));
      if (typeof updateResumeButton === 'function') updateResumeButton();
    } catch (e) {
      console.warn('Autosave failed', e);
    }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(LS_DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function discardDraft() {
    localStorage.removeItem(LS_DRAFT_KEY);
  }

  // Wire autosave on every form input.
  // userHasInteracted gate prevents autosave from firing on browser-restored
  // form values during initial page load (which would re-create a draft right
  // after the user clicked Discard).
  let userHasInteracted = false;
  function markInteracted() { userHasInteracted = true; scheduleAutosave(); }
  document.querySelectorAll('#opdForm input, #opdForm select, #opdForm textarea').forEach((el) => {
    el.addEventListener('input', markInteracted);
    el.addEventListener('change', markInteracted);
  });

  // Auto-discard drafts older than 7 days
  const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

  function formatRelativeTime(ts) {
    if (!ts) return '';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} h ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  // ----- "Resume Last Draft" button state -----
  function updateResumeButton() {
    const btn = document.getElementById('resumeBtn');
    if (!btn) return;
    const draft = loadDraft();
    const hasMeaningful = draft && draft.state && isDraftMeaningful(draft.state);
    const expired = draft && draft.savedAt && (Date.now() - draft.savedAt) > DRAFT_MAX_AGE_MS;
    if (!hasMeaningful || expired) {
      if (expired) discardDraft();
      btn.disabled = true;
      btn.textContent = 'Resume Last Draft';
      btn.title = 'No saved draft on this device';
      return;
    }
    btn.disabled = false;
    btn.textContent = `Resume Last Draft (${formatRelativeTime(draft.savedAt)})`;
    btn.title = 'Restore the auto-saved draft from this device';
  }

  document.getElementById('resumeBtn')?.addEventListener('click', () => {
    const draft = loadDraft();
    if (!draft || !draft.state) {
      showToast('No saved draft found');
      updateResumeButton();
      return;
    }
    setFormState(draft.state);
    updateResumeButton();
    showToast('Draft restored');
  });

  // Initial check on page load
  updateResumeButton();
  // Re-check every minute so the relative-time label stays roughly current
  setInterval(updateResumeButton, 60 * 1000);

  // ----- Saved patients -----
  function loadPatients() {
    try {
      const raw = localStorage.getItem(LS_PATIENTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function savePatientsList(arr) {
    try { localStorage.setItem(LS_PATIENTS_KEY, JSON.stringify(arr)); }
    catch (e) { console.warn('Save patients failed', e); }
  }

  function patientLabel(p) {
    const name = p.state.name || '(no name)';
    const mrn  = p.state.mrn ? ` • ${p.state.mrn}` : '';
    const d    = new Date(p.savedAt);
    const dStr = `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-GB', { month: 'short' })} ${d.getFullYear()}`;
    return `${name}${mrn} • ${dStr}`;
  }

  function rebuildRecentPatientsDropdown() {
    const sel = document.getElementById('recentPatientsSelect');
    const card = document.getElementById('recentPatientsCard');
    if (!sel || !card) return;
    const patients = loadPatients();
    sel.innerHTML = '<option value="">— Load a saved patient —</option>';
    if (patients.length === 0) {
      card.hidden = true;
      return;
    }
    card.hidden = false;
    // Sort by most recent first
    patients.sort((a, b) => b.savedAt - a.savedAt);
    patients.slice(0, 20).forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = patientLabel(p);
      sel.appendChild(opt);
    });
  }

  document.getElementById('savePatientBtn')?.addEventListener('click', () => {
    const state = getFormState();
    if (!state.name) {
      showToast('Enter a patient name first');
      return;
    }
    const patients = loadPatients();
    // De-dupe: if same name + MRN already exists, update it; else add new
    const existing = patients.find((p) =>
      p.state.name === state.name && (p.state.mrn || '') === (state.mrn || '')
    );
    if (existing) {
      existing.state = state;
      existing.savedAt = Date.now();
    } else {
      patients.push({ id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7), savedAt: Date.now(), state });
    }
    // Cap list
    patients.sort((a, b) => b.savedAt - a.savedAt);
    if (patients.length > MAX_PATIENTS) patients.length = MAX_PATIENTS;
    savePatientsList(patients);
    rebuildRecentPatientsDropdown();
    discardDraft();
    updateResumeButton();
    showToast(existing ? 'Patient updated' : 'Patient saved');
  });

  document.getElementById('recentPatientsSelect')?.addEventListener('change', (e) => {
    const id = e.target.value;
    const delBtn = document.getElementById('deletePatientBtn');
    if (!id) { delBtn.hidden = true; return; }
    const patient = loadPatients().find((p) => p.id === id);
    if (patient) {
      setFormState(patient.state);
      delBtn.hidden = false;
      showToast('Patient loaded');
    }
  });

  document.getElementById('deletePatientBtn')?.addEventListener('click', () => {
    const sel = document.getElementById('recentPatientsSelect');
    const id = sel.value;
    if (!id) return;
    const ok = confirm('Delete this saved patient?');
    if (!ok) return;
    const patients = loadPatients().filter((p) => p.id !== id);
    savePatientsList(patients);
    rebuildRecentPatientsDropdown();
    sel.value = '';
    document.getElementById('deletePatientBtn').hidden = true;
    showToast('Patient deleted');
  });

  rebuildRecentPatientsDropdown();

  // Override Clear Form to also reset chemo state and clear draft
  // (replaces earlier listener registered before this section ran)
  const clearBtnNew = document.getElementById('clearBtn');
  if (clearBtnNew) {
    clearBtnNew.replaceWith(clearBtnNew.cloneNode(true));
    document.getElementById('clearBtn').addEventListener('click', () => {
      const ok = confirm('Clear all fields? (This will not delete saved patients.)');
      if (!ok) return;
      clearFormState();
      discardDraft();
      userHasInteracted = false;
      if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
      const sel = document.getElementById('recentPatientsSelect');
      if (sel) sel.value = '';
      document.getElementById('deletePatientBtn').hidden = true;
      updateResumeButton();
      showToast('Form cleared');
    });
  }

  // ----- Toast notifications -----
  let toastTimer = null;
  function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }

  // ============================================================
  // Comorbidity chips → append to Past History textarea
  // ============================================================

  document.querySelectorAll('#comorbidityChips .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const ta = document.getElementById('pastHistory');
      if (!ta) return;
      const val = chip.dataset.text;
      const cur = ta.value.trim();
      // Don't add duplicates (case-insensitive substring check)
      if (cur.toLowerCase().includes(val.toLowerCase())) return;
      ta.value = cur ? `${cur}, ${val}` : val;
      chip.classList.add('chip-active');
      setTimeout(() => chip.classList.remove('chip-active'), 600);
      ta.dispatchEvent(new Event('input'));
    });
  });

  // ============================================================
  // Voice-to-text dictation on textareas
  // ============================================================

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  function attachMicButtons() {
    if (!SR) return; // No speech recognition support — skip silently
    const TARGETS = [
      'complaints', 'hpi', 'pastHistory', 'personalHistory', 'familyHistory',
      'generalExam', 'systemicExam', 'diagnosis', 'plan', 'otherNotes',
      'prescription', 'chemoCycleNotes', 'followupNotes'
    ];
    TARGETS.forEach((id) => {
      const ta = document.getElementById(id);
      if (!ta || ta.dataset.micWired) return;
      // Wrap textarea in a relative container with a mic button
      const wrap = document.createElement('div');
      wrap.className = 'dictate-wrap';
      ta.parentNode.insertBefore(wrap, ta);
      wrap.appendChild(ta);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mic-btn';
      btn.title = 'Click to dictate (voice-to-text)';
      btn.innerHTML = '🎤';
      wrap.appendChild(btn);

      let recognition = null;
      let active = false;

      btn.addEventListener('click', () => {
        if (active) {
          // Stop current
          recognition && recognition.stop();
          return;
        }
        recognition = new SR();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.continuous = true;

        recognition.onstart = () => {
          active = true;
          btn.classList.add('mic-active');
          btn.title = 'Click to stop dictation';
        };
        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
          }
          if (!transcript) return;
          const cur = ta.value;
          const sep = cur && !cur.endsWith(' ') && !cur.endsWith('\n') ? ' ' : '';
          ta.value = cur + sep + transcript;
          ta.dispatchEvent(new Event('input'));
        };
        recognition.onerror = () => {
          active = false;
          btn.classList.remove('mic-active');
        };
        recognition.onend = () => {
          active = false;
          btn.classList.remove('mic-active');
          btn.title = 'Click to dictate (voice-to-text)';
        };
        try { recognition.start(); }
        catch (e) {
          showToast('Microphone unavailable');
          active = false;
          btn.classList.remove('mic-active');
        }
      });
      ta.dataset.micWired = '1';
    });
  }
  attachMicButtons();

  function buildPrintChemoSection(reg) {
    const wt    = parseFloat(document.getElementById('weight').value) || null;
    const ht    = parseFloat(document.getElementById('height').value) || null;
    const bsa   = (wt && ht) ? Math.sqrt((ht * wt) / 3600) : null;
    const age   = getPatientAgeFromTop();
    const creat = parseFloat(document.getElementById('chemoCreat').value) || null;
    const sex   = getPatientSexFromTop();
    const gfr   = calculateGFR(age, wt, creat, sex);
    const notes = val('chemoCycleNotes');

    const summary = [];
    summary.push(`<strong>Regimen:</strong> ${reg.name}`);
    if (bsa) summary.push(`<strong>BSA:</strong> ${bsa.toFixed(2)} m²`);
    if (regimenHasCarboplatin(reg) && gfr != null) {
      summary.push(`<strong>GFR (Cockcroft-Gault):</strong> ${gfr.toFixed(1)} mL/min`);
    }
    document.getElementById('printChemoSummary').innerHTML =
      '<div class="chemo-summary-line">' + summary.join('  •  ') + '</div>';

    const tbody = document.querySelector('#printChemoTable tbody');
    tbody.innerHTML = '';
    reg.drugs.forEach((d) => {
      const calc = calculateDrugDose(d, { bsa, wt, gfr });
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.name}</td>
        <td>${formatStandardDose(d)}</td>
        <td>${calc}</td>
        <td>${d.schedule}</td>`;
      tbody.appendChild(tr);
    });

    const notesEl = document.getElementById('printChemoNotes');
    notesEl.innerHTML = notes ? `<strong>Notes:</strong> ${notes.replace(/\n/g, '<br>')}` : '';
  }

  // ============================================================
  // Preview & Edit mode — show printable layout on screen, allow inline edits
  // ============================================================

  function enterPreviewMode() {
    buildPrintSummary();
    setPdfTitle();

    // Make editable elements contenteditable inside the print area
    const printArea = document.getElementById('printArea');
    const editableSelectors = [
      '[data-field]',                      // all populated patient data spans
      '.print-section p',                  // section paragraphs
      '#printChemoSummary',                // chemo summary line
      '#printChemoTable td',               // chemo table cells
      '#printChemoNotes',                  // chemo notes
      '.print-meta div',                   // patient meta values
      '.team-doctor div',                  // team list (in case of correction)
      '.print-signature div'               // signature block
    ];
    editableSelectors.forEach((sel) => {
      printArea.querySelectorAll(sel).forEach((el) => {
        el.setAttribute('contenteditable', 'true');
        el.classList.add('editable');
      });
    });

    // Switch to preview mode
    document.body.classList.add('preview-mode');
    document.getElementById('previewToolbar').hidden = false;

    // Scroll preview to top
    window.scrollTo(0, 0);
  }

  function exitPreviewMode() {
    document.body.classList.remove('preview-mode');
    document.getElementById('previewToolbar').hidden = true;

    // Strip contenteditable so re-entering preview rebuilds cleanly from form data
    const printArea = document.getElementById('printArea');
    printArea.querySelectorAll('[contenteditable="true"]').forEach((el) => {
      el.removeAttribute('contenteditable');
      el.classList.remove('editable');
    });
    restoreTitle();
  }

  // Preview button (shows on-screen editable version)
  const previewBtn = $('#previewBtn');
  if (previewBtn) {
    previewBtn.addEventListener('click', enterPreviewMode);
  }

  // Formatting toolbar buttons (Bold / Italic / Underline / Highlight / Clear)
  // Use mousedown (not click) so the editable element keeps its selection.
  document.querySelectorAll('.fmt-btn').forEach((btn) => {
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault(); // keep current selection in the contenteditable element
      const cmd = btn.dataset.cmd;
      if (cmd === 'highlight') {
        // Toggle yellow highlight on selection. If already yellow, clear it.
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
        // execCommand('hiliteColor') needs styleWithCSS=true in some browsers
        try { document.execCommand('styleWithCSS', false, true); } catch (err) {}
        document.execCommand('hiliteColor', false, '#fff59d');
      } else if (cmd === 'clear') {
        document.execCommand('removeFormat');
        document.execCommand('hiliteColor', false, 'transparent');
      } else {
        document.execCommand(cmd, false, null);
      }
    });
  });

  // Back from preview → return to form
  const previewBackBtn = $('#previewBackBtn');
  if (previewBackBtn) {
    previewBackBtn.addEventListener('click', exitPreviewMode);
  }

  // Print from preview — uses current edited state (DOM)
  const previewPrintBtn = $('#previewPrintBtn');
  if (previewPrintBtn) {
    previewPrintBtn.addEventListener('click', () => {
      setPdfTitle();
      window.print();
      setTimeout(restoreTitle, 1500);
    });
  }

  // "Print without preview" button — direct print, no edit step
  const printBtn = $('#printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      buildPrintSummary();
      setPdfTitle();
      window.print();
      setTimeout(restoreTitle, 1500);
    });
  }

  // Clear form
  const clearBtn = $('#clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const ok = confirm('Clear all fields?');
      if (!ok) return;
      document.getElementById('opdForm').reset();
      // Re-set today's date
      if (todayInput) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        todayInput.value = `${yyyy}-${mm}-${dd}`;
      }
    });
  }
})();
