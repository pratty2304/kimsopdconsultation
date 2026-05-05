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

  // Print button
  const printBtn = $('#printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      buildPrintSummary();
      setPdfTitle();
      window.print();
      // Restore page title shortly after the print dialog closes
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
