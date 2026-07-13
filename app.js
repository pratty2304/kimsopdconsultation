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
      'complaints', 'pastHistory',
      'personalHistory', 'familyHistory',
      'generalExam', 'systemicExam',
      'diagnosis', 'plan', 'prescription',
      'otherNotes'
    ];
    fields.forEach((f) => setText(f, val(f)));
    setText('hpi', val('hpi'));

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
    const chemoPlan = getActiveChemoPlan();
    const showChemo = !!(planChemo && planChemo.checked && chemoPlan);
    toggleSection('chemo', showChemo);
    if (showChemo) buildPrintChemoSection(chemoPlan);
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

  let customDrugRowCounter = 1;

  function getCustomDrugRows() {
    return Array.from(document.querySelectorAll('#customDrugList [data-custom-drug-row]'));
  }

  function customDrugField(row, field) {
    return row ? row.querySelector(`[data-custom-field="${field}"]`) : null;
  }

  function customDrugRowHasAnyValue(row) {
    return ['name', 'dose', 'schedule'].some((field) => (customDrugField(row, field)?.value || '').trim()) ||
      (customDrugField(row, 'unit')?.value || 'mg') !== 'mg';
  }

  function setCustomDrugRowValues(row, drug) {
    if (!row) return;
    const nameEl = customDrugField(row, 'name');
    const doseEl = customDrugField(row, 'dose');
    const unitEl = customDrugField(row, 'unit');
    const scheduleEl = customDrugField(row, 'schedule');
    if (nameEl) nameEl.value = drug?.name || '';
    if (doseEl) doseEl.value = drug?.dose ?? '';
    if (unitEl) unitEl.value = drug?.unit || 'mg';
    if (scheduleEl) scheduleEl.value = drug?.schedule && drug.schedule !== '—' ? drug.schedule : '';
  }

  function wireCustomDrugRow(row) {
    if (!row || row.dataset.customDrugWired === '1') return;
    row.querySelectorAll('input, select').forEach((el) => {
      el.addEventListener('input', () => {
        onRegimenChange();
        markInteracted();
      });
      el.addEventListener('change', () => {
        onRegimenChange();
        markInteracted();
      });
    });
    const removeBtn = row.querySelector('.custom-drug-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        const rows = getCustomDrugRows();
        if (rows.length <= 1) {
          setCustomDrugRowValues(row, {});
          return;
        }
        row.remove();
        updateCustomDrugRemoveButtons();
        onRegimenChange();
        markInteracted();
      });
    }
    row.dataset.customDrugWired = '1';
  }

  function createCustomDrugRow(drug, useLegacyIds) {
    const rowId = useLegacyIds ? '' : `_${++customDrugRowCounter}`;
    const row = document.createElement('div');
    row.className = 'custom-drug-row';
    row.dataset.customDrugRow = '1';
    row.innerHTML = `
      <div class="grid grid-4">
        <label>Drug name
          <input type="text" ${useLegacyIds ? 'id="customDrugName"' : `id="customDrugName${rowId}"`} data-custom-field="name" placeholder="Drug name" autocomplete="off" />
        </label>
        <label>Dose
          <input type="number" step="0.01" ${useLegacyIds ? 'id="customDrugDose"' : `id="customDrugDose${rowId}"`} data-custom-field="dose" placeholder="Dose" />
        </label>
        <label>Unit
          <select ${useLegacyIds ? 'id="customDrugUnit"' : `id="customDrugUnit${rowId}"`} data-custom-field="unit">
            <option value="mg">mg</option>
            <option value="mg/m²">mg/m²</option>
            <option value="mg/kg">mg/kg</option>
            <option value="AUC">AUC</option>
            <option value="flat">flat mg</option>
          </select>
        </label>
        <label>Schedule
          <input type="text" ${useLegacyIds ? 'id="customDrugSchedule"' : `id="customDrugSchedule${rowId}"`} data-custom-field="schedule" placeholder="D1, q21d" autocomplete="off" />
        </label>
      </div>
      <button type="button" class="btn-ghost btn-small custom-drug-remove">Remove</button>`;
    setCustomDrugRowValues(row, drug || {});
    wireCustomDrugRow(row);
    return row;
  }

  function updateCustomDrugRemoveButtons() {
    const rows = getCustomDrugRows();
    rows.forEach((row) => {
      const removeBtn = row.querySelector('.custom-drug-remove');
      if (removeBtn) removeBtn.hidden = rows.length <= 1;
    });
  }

  function ensureCustomDrugRows() {
    const list = document.getElementById('customDrugList');
    if (!list) return;
    if (!getCustomDrugRows().length) {
      list.appendChild(createCustomDrugRow({}, true));
    }
    getCustomDrugRows().forEach(wireCustomDrugRow);
    updateCustomDrugRemoveButtons();
  }

  function setCustomDrugRows(drugs) {
    const list = document.getElementById('customDrugList');
    if (!list) return;
    const rows = Array.isArray(drugs) && drugs.length ? drugs : [{}];
    list.innerHTML = '';
    rows.forEach((drug, index) => {
      list.appendChild(createCustomDrugRow(drug, index === 0));
    });
    updateCustomDrugRemoveButtons();
  }

  function addCustomDrugRow(drug) {
    const list = document.getElementById('customDrugList');
    if (!list) return null;
    const row = createCustomDrugRow(drug || {}, getCustomDrugRows().length === 0);
    list.appendChild(row);
    updateCustomDrugRemoveButtons();
    return row;
  }

  function updateCustomDrugVisibility() {
    const toggle = document.getElementById('customDrugToggle');
    const fields = document.getElementById('customDrugFields');
    if (fields) fields.hidden = !(toggle && toggle.checked);
    if (toggle && toggle.checked) ensureCustomDrugRows();
  }

  function readCustomDrugRow(row) {
    const name = (customDrugField(row, 'name')?.value || '').trim();
    if (!name) return null;

    const rawDose = customDrugField(row, 'dose')?.value;
    const parsedDose = rawDose === '' || rawDose == null ? null : parseFloat(rawDose);
    const unit = customDrugField(row, 'unit')?.value || 'mg';
    const schedule = (customDrugField(row, 'schedule')?.value || '').trim();

    return {
      name,
      dose: Number.isFinite(parsedDose) ? parsedDose : null,
      unit,
      schedule: schedule || '—',
      isCustom: true
    };
  }

  function getCustomDrugs() {
    const toggle = document.getElementById('customDrugToggle');
    if (!toggle || !toggle.checked) return [];
    return getCustomDrugRows().map(readCustomDrugRow).filter(Boolean);
  }

  function getCustomDrugFormValues() {
    return getCustomDrugRows()
      .filter(customDrugRowHasAnyValue)
      .map((row) => ({
        name: (customDrugField(row, 'name')?.value || '').trim(),
        dose: customDrugField(row, 'dose')?.value || '',
        unit: customDrugField(row, 'unit')?.value || 'mg',
        schedule: (customDrugField(row, 'schedule')?.value || '').trim()
      }));
  }

  function getSavedCustomDrugRows(state) {
    if (Array.isArray(state?.customDrugs) && state.customDrugs.length) {
      return state.customDrugs;
    }
    const legacyDrug = {
      name: state?.customDrugName || '',
      dose: state?.customDrugDose || '',
      unit: state?.customDrugUnit || 'mg',
      schedule: state?.customDrugSchedule || ''
    };
    return (legacyDrug.name || legacyDrug.dose || legacyDrug.schedule) ? [legacyDrug] : [{}];
  }

  function stateHasCustomDrugName(state) {
    if (!state?.customDrugToggle) return false;
    if (Array.isArray(state.customDrugs)) {
      return state.customDrugs.some((drug) => (drug?.name || '').toString().trim());
    }
    return !!(state.customDrugName || '').toString().trim();
  }

  function getActiveChemoPlan() {
    const reg = getSelectedRegimen();
    const customDrugs = getCustomDrugs();
    if (!reg && customDrugs.length === 0) return null;

    const drugs = reg ? reg.drugs.slice() : [];
    drugs.push(...customDrugs);

    let name = reg ? reg.name : `Custom drug: ${customDrugs[0].name}`;
    if (!reg && customDrugs.length > 1) name = `Custom drugs: ${customDrugs.map((d) => d.name).join(' + ')}`;
    if (reg && customDrugs.length === 1) name = `${reg.name} + Custom drug`;
    if (reg && customDrugs.length > 1) name = `${reg.name} + ${customDrugs.length} custom drugs`;

    return {
      key: reg ? reg.key : 'Custom-Drugs',
      name,
      drugs
    };
  }

  const UNIVERSAL_CHEMO_WARNING =
    'Warning signs: Fever >=38 C; vomiting >3 times in 24 hours or unable to keep fluids/medicines down; diarrhea >=4 stools/day above usual, diarrhea at night, blood in stool, or diarrhea with dizziness/weakness; breathlessness, bleeding, severe weakness, reduced urine output, new confusion, or allergic symptoms - report immediately / visit ER.';

  const IMMUNOTHERAPY_DRUGS = [
    'pembrolizumab', 'nivolumab', 'atezolizumab', 'durvalumab', 'cemiplimab',
    'dostarlimab', 'tislelizumab', 'avelumab', 'ipilimumab', 'tremelimumab'
  ];

  const HORMONAL_THERAPY_DRUGS = [
    'letrozole', 'anastrozole', 'exemestane', 'tamoxifen', 'fulvestrant',
    'abiraterone', 'enzalutamide', 'degarelix', 'leuprolide', 'goserelin'
  ];

  const TARGETED_THERAPY_DRUGS = [
    'palbociclib', 'ribociclib', 'abemaciclib',
    'trastuzumab', 'pertuzumab', 'trastuzumab deruxtecan', 'trastuzumab emtansine',
    'bevacizumab', 'ramucirumab', 'cetuximab', 'panitumumab', 'rituximab',
    'brentuximab', 'bortezomib', 'olaparib', 'osimertinib', 'gefitinib',
    'erlotinib', 'afatinib'
  ];

  const SIDE_EFFECT_CATEGORY_ORDER = [
    'Chemotherapy',
    'Immunotherapy',
    'Targeted / biologic therapy',
    'Hormonal therapy'
  ];

  const SIDE_EFFECT_RULES = [
    {
      drugs: ['paclitaxel', 'docetaxel', 'nab-paclitaxel', 'cabazitaxel'],
      effects: ['low counts/infection risk', 'nausea', 'hair loss', 'peripheral neuropathy', 'body aches', 'nail changes', 'allergic/infusion reaction']
    },
    {
      drugs: ['carboplatin'],
      effects: ['low counts/infection risk', 'nausea/vomiting', 'fatigue', 'allergic reaction risk', 'renal/electrolyte issues']
    },
    {
      drugs: ['cisplatin'],
      effects: ['nausea/vomiting', 'low counts/infection risk', 'renal/electrolyte issues', 'hearing changes', 'peripheral neuropathy']
    },
    {
      drugs: ['oxaliplatin'],
      effects: ['low counts/infection risk', 'nausea/vomiting', 'cold sensitivity', 'peripheral neuropathy', 'allergic reaction risk']
    },
    {
      drugs: ['doxorubicin', 'epirubicin'],
      effects: ['low counts/infection risk', 'nausea/vomiting', 'hair loss', 'mouth ulcers', 'cardiac function risk']
    },
    {
      drugs: ['cyclophosphamide', 'ifosfamide'],
      effects: ['low counts/infection risk', 'nausea/vomiting', 'hair loss', 'bladder irritation/bleeding risk']
    },
    {
      drugs: ['5-fluorouracil', 'fluorouracil', 'capecitabine'],
      effects: ['diarrhea', 'mouth ulcers', 'hand-foot syndrome', 'low counts/infection risk', 'skin darkening']
    },
    {
      drugs: ['irinotecan'],
      effects: ['early or delayed diarrhea', 'abdominal cramps', 'low counts/infection risk', 'nausea/vomiting', 'hair loss']
    },
    {
      drugs: ['gemcitabine'],
      effects: ['low counts/infection risk', 'fever/flu-like symptoms', 'fatigue', 'nausea', 'liver enzyme changes']
    },
    {
      drugs: ['pemetrexed'],
      effects: ['low counts/infection risk', 'fatigue', 'rash', 'mouth ulcers', 'nausea']
    },
    {
      drugs: ['etoposide'],
      effects: ['low counts/infection risk', 'nausea/vomiting', 'hair loss', 'mucositis']
    },
    {
      drugs: ['bleomycin'],
      effects: ['fever', 'skin changes', 'lung toxicity/breathlessness risk']
    },
    {
      drugs: ['vincristine', 'vinblastine'],
      effects: ['constipation', 'peripheral neuropathy', 'low counts/infection risk']
    },
    {
      drugs: ['dacarbazine', 'bendamustine'],
      effects: ['low counts/infection risk', 'nausea/vomiting', 'fatigue', 'rash']
    },
    {
      drugs: ['pembrolizumab', 'nivolumab', 'atezolizumab', 'durvalumab', 'cemiplimab', 'dostarlimab', 'tislelizumab', 'avelumab', 'ipilimumab', 'tremelimumab'],
      effects: ['immune-related rash', 'diarrhea/colitis', 'cough or breathlessness/pneumonitis', 'hepatitis/LFT changes', 'thyroid or other hormone changes', 'fatigue']
    },
    {
      drugs: ['palbociclib', 'ribociclib', 'abemaciclib'],
      effects: ['low counts/infection risk', 'fatigue', 'diarrhea', 'nausea', 'liver enzyme changes']
    },
    {
      drugs: ['ribociclib'],
      effects: ['QT prolongation risk - ECG/electrolyte monitoring as advised']
    },
    {
      drugs: ['abemaciclib'],
      effects: ['diarrhea can be prominent - start antidiarrheal/supportive care early if advised']
    },
    {
      drugs: ['letrozole', 'anastrozole', 'exemestane'],
      effects: ['hot flashes', 'joint pains/stiffness', 'bone loss', 'vaginal dryness']
    },
    {
      drugs: ['tamoxifen'],
      effects: ['hot flashes', 'vaginal discharge/bleeding', 'thrombosis risk', 'endometrial symptoms']
    },
    {
      drugs: ['fulvestrant'],
      effects: ['injection site pain', 'hot flashes', 'fatigue', 'joint pains']
    },
    {
      drugs: ['abiraterone'],
      effects: ['fatigue', 'hot flashes', 'hypertension/fluid retention', 'low potassium', 'liver enzyme changes']
    },
    {
      drugs: ['enzalutamide'],
      effects: ['fatigue', 'hot flashes', 'hypertension', 'falls/dizziness', 'rare seizure risk']
    },
    {
      drugs: ['degarelix', 'leuprolide', 'goserelin'],
      effects: ['hot flashes', 'fatigue', 'injection-site symptoms', 'sexual dysfunction', 'bone loss/metabolic changes']
    },
    {
      drugs: ['cabazitaxel'],
      effects: ['diarrhea', 'low counts/infection risk', 'fatigue', 'peripheral neuropathy']
    },
    {
      drugs: ['trastuzumab', 'pertuzumab', 'trastuzumab deruxtecan', 'trastuzumab emtansine'],
      effects: ['infusion reaction', 'cardiac function risk', 'diarrhea', 'fatigue']
    },
    {
      drugs: ['trastuzumab deruxtecan'],
      effects: ['interstitial lung disease/pneumonitis risk - report new cough or breathlessness urgently']
    },
    {
      drugs: ['trastuzumab emtansine'],
      effects: ['low platelets/bleeding risk', 'liver enzyme changes', 'peripheral neuropathy']
    },
    {
      drugs: ['bevacizumab', 'ramucirumab'],
      effects: ['hypertension', 'bleeding', 'thrombosis', 'wound-healing delay', 'proteinuria']
    },
    {
      drugs: ['cetuximab', 'panitumumab'],
      effects: ['acneiform rash', 'diarrhea', 'low magnesium', 'infusion reaction']
    },
    {
      drugs: ['rituximab'],
      effects: ['infusion reaction', 'infection risk', 'viral reactivation risk']
    },
    {
      drugs: ['brentuximab', 'bortezomib'],
      effects: ['peripheral neuropathy', 'low counts/infection risk', 'fatigue']
    },
    {
      drugs: ['olaparib'],
      effects: ['nausea', 'fatigue', 'low counts/anemia', 'taste changes']
    },
    {
      drugs: ['osimertinib', 'gefitinib', 'erlotinib', 'afatinib'],
      effects: ['skin rash', 'diarrhea', 'nail changes', 'mouth ulcers', 'rare lung inflammation/breathlessness risk']
    }
  ];

  function regimenDrugNameText(reg) {
    return (reg?.drugs || []).map((d) => d.name.toLowerCase()).join(' | ');
  }

  function uniqueList(items) {
    const seen = new Set();
    return items.filter((item) => {
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function ruleSideEffectCategory(rule) {
    const ruleText = rule.drugs.join(' | ').toLowerCase();
    if (IMMUNOTHERAPY_DRUGS.some((drug) => ruleText.includes(drug))) return 'Immunotherapy';
    if (HORMONAL_THERAPY_DRUGS.some((drug) => ruleText.includes(drug))) return 'Hormonal therapy';
    if (TARGETED_THERAPY_DRUGS.some((drug) => ruleText.includes(drug))) return 'Targeted / biologic therapy';
    return 'Chemotherapy';
  }

  function getRegimenSideEffectGroups(reg) {
    const drugText = regimenDrugNameText(reg);
    const groups = {};
    SIDE_EFFECT_RULES.forEach((rule) => {
      if (rule.drugs.some((drug) => drugText.includes(drug))) {
        const category = ruleSideEffectCategory(rule);
        if (!groups[category]) groups[category] = [];
        groups[category].push(...rule.effects);
      }
    });

    if (!Object.keys(groups).length && reg?.drugs?.length) {
      groups.Chemotherapy = ['fatigue', 'nausea', 'low counts/infection risk'];
    }

    return SIDE_EFFECT_CATEGORY_ORDER
      .filter((category) => groups[category]?.length)
      .map((category) => ({
        category,
        effects: uniqueList(groups[category]).slice(0, 9)
      }));
  }

  function buildChemoCounsellingNote(reg) {
    if (!reg) return '';
    const effectGroups = getRegimenSideEffectGroups(reg);
    const lines = [UNIVERSAL_CHEMO_WARNING];
    if (effectGroups.length) {
      lines.push('');
      lines.push('Expected side effects:');
      effectGroups.forEach((group) => {
        lines.push(`${group.category}: ${group.effects.join(', ')}.`);
      });
    }
    return lines.join('\n');
  }

  function autofillChemoCounselling(reg) {
    const notesEl = document.getElementById('chemoCycleNotes');
    if (!notesEl || !reg) return;
    const nextNote = buildChemoCounsellingNote(reg);
    const current = notesEl.value.trim();
    const priorAuto = notesEl.dataset.autoCounselling || '';
    if (!current || current === priorAuto) {
      notesEl.value = nextNote;
      notesEl.dataset.autoCounselling = nextNote;
    }
  }

  function normalizeRegimenSearch(value) {
    return (value || '')
      .toString()
      .toLowerCase()
      .replace(/[→+/_(),.;:–—-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function compactRegimenSearch(value) {
    return normalizeRegimenSearch(value).replace(/[^a-z0-9]/g, '');
  }

  function regimenSearchTokens(value) {
    return normalizeRegimenSearch(value).split(' ').filter(Boolean);
  }

  function regimenDrugInitials(reg) {
    return (reg.drugs || [])
      .map((d) => compactRegimenSearch(d.name).charAt(0))
      .filter(Boolean)
      .join('');
  }

  function regimenSearchFields(reg) {
    const drugNames = (reg.drugs || []).map((d) => d.name).join(' ');
    const drugSchedules = (reg.drugs || []).map((d) => d.schedule).join(' ');
    const aliasList = Array.isArray(reg.aliases) ? reg.aliases : [];
    const aliases = aliasList.join(' ');
    return [
      reg.name,
      reg.key,
      ...aliasList,
      aliases,
      drugNames,
      drugSchedules,
      `${reg.name} ${reg.key}`,
      `${reg.name} ${aliases}`,
      `${reg.name} ${drugNames}`,
      `${reg.name} ${drugSchedules}`,
      `${reg.name} ${reg.key} ${aliases} ${drugNames} ${drugSchedules}`,
      regimenDrugInitials(reg)
    ].filter(Boolean);
  }

  function isSubsequence(needle, haystack) {
    if (!needle) return false;
    let j = 0;
    for (let i = 0; i < haystack.length && j < needle.length; i += 1) {
      if (haystack[i] === needle[j]) j += 1;
    }
    return j === needle.length;
  }

  function levenshteinDistance(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    const curr = new Array(b.length + 1);
    for (let i = 1; i <= a.length; i += 1) {
      curr[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        curr[j] = Math.min(
          curr[j - 1] + 1,
          prev[j] + 1,
          prev[j - 1] + cost
        );
      }
      for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j];
    }
    return prev[b.length];
  }

  function scoreRegimenSearch(query, reg) {
    const q = normalizeRegimenSearch(query);
    const qc = compactRegimenSearch(query);
    const qTokens = regimenSearchTokens(query);
    if (!q || !qc) return 0;

    let best = 0;
    regimenSearchFields(reg).forEach((field) => {
      const f = normalizeRegimenSearch(field);
      const fc = compactRegimenSearch(field);
      const fTokens = regimenSearchTokens(field);

      if (f === q || fc === qc) best = Math.max(best, 100);
      if (f.startsWith(q) || fc.startsWith(qc)) best = Math.max(best, 94);
      if (q.length >= 3 && f.includes(q)) best = Math.max(best, 90);
      if (qc.length >= 3 && fc.includes(qc)) best = Math.max(best, 88);

      if (qTokens.length > 1 && qTokens.every((qt) => fTokens.some((ft) => ft.startsWith(qt) || ft.includes(qt)))) {
        best = Math.max(best, 86);
      }

      if (qc.length >= 2 && isSubsequence(qc, fc)) {
        best = Math.max(best, qc.length <= 3 ? 72 : 78);
      }

      if (qc.length >= 4) {
        fTokens.forEach((token) => {
          const tc = compactRegimenSearch(token);
          if (tc.length < 4) return;
          const maxLen = Math.max(qc.length, tc.length);
          const similarity = 1 - (levenshteinDistance(qc, tc) / maxLen);
          if (similarity >= 0.72) best = Math.max(best, Math.round(70 + similarity * 18));
        });
      }
    });

    return best;
  }

  function getRegimenSearchMatches(value) {
    const cancer = document.getElementById('chemoCancer').value;
    const needle = compactRegimenSearch(value);
    if (!cancer || !needle || !window.REGIMENS[cancer]) return [];
    return window.REGIMENS[cancer]
      .map((reg) => ({ reg, score: scoreRegimenSearch(value, reg) }))
      .filter((item) => item.score >= (needle.length <= 2 ? 72 : 60))
      .sort((a, b) => b.score - a.score);
  }

  function populateRegimenSelect(regimens, placeholder) {
    const regSel = document.getElementById('chemoRegimen');
    if (!regSel) return;
    regSel.innerHTML = '';
    const firstOpt = document.createElement('option');
    firstOpt.value = '';
    firstOpt.textContent = placeholder || '— Select regimen —';
    regSel.appendChild(firstOpt);
    regimens.forEach((r) => {
      const opt = document.createElement('option');
      opt.value = r.key;
      opt.textContent = r.name;
      regSel.appendChild(opt);
    });
  }

  function setRegimenSearchStatus(message, statusClass) {
    const status = document.getElementById('chemoRegimenSearchStatus');
    if (!status) return;
    status.textContent = message || '';
    status.className = statusClass ? `search-status ${statusClass}` : 'search-status';
  }

  function syncRegimenSearchFromSelect() {
    const input = document.getElementById('chemoRegimenSearch');
    const reg = getSelectedRegimen();
    if (input) input.value = reg ? reg.name : '';
    setRegimenSearchStatus('', '');
  }

  function onRegimenSearchInput() {
    const input = document.getElementById('chemoRegimenSearch');
    const regSel = document.getElementById('chemoRegimen');
    if (!input || !regSel) return;
    const query = input.value.trim();
    const cancer = document.getElementById('chemoCancer').value;
    if (!query) {
      populateRegimenSelect(cancer && window.REGIMENS[cancer] ? window.REGIMENS[cancer] : [], '— Select regimen —');
      regSel.value = '';
      setRegimenSearchStatus('', '');
      onRegimenChange();
      return;
    }
    const matches = getRegimenSearchMatches(query);
    populateRegimenSelect(
      matches.map((m) => m.reg),
      matches.length ? `— ${matches.length} match${matches.length === 1 ? '' : 'es'} found —` : '— Not found —'
    );
    const best = matches[0];
    const second = matches[1];
    const clearBest = best && (
      (best.score === 100 && (!second || second.score < 100)) ||
      !second ||
      best.score - second.score >= 8
    );
    if (clearBest) {
      regSel.value = best.reg.key;
      setRegimenSearchStatus(matches.length > 1 ? `${matches.length} matches found` : '', '');
    } else {
      regSel.value = '';
      setRegimenSearchStatus(matches.length ? `${matches.length} matches found. Choose from Regimen.` : 'Not found', matches.length ? '' : 'not-found');
    }
    onRegimenChange();
  }

  function onCancerChange() {
    const cancer = document.getElementById('chemoCancer').value;
    const regSel = document.getElementById('chemoRegimen');
    const regSearch = document.getElementById('chemoRegimenSearch');
    if (regSearch) regSearch.value = '';
    setRegimenSearchStatus('', '');
    if (cancer && window.REGIMENS[cancer]) {
      populateRegimenSelect(window.REGIMENS[cancer], '— Select regimen —');
      regSel.disabled = false;
      if (regSearch) {
        regSearch.disabled = false;
        regSearch.placeholder = 'Search regimen';
      }
    } else {
      regSel.disabled = true;
      if (regSearch) {
        regSearch.disabled = true;
        regSearch.placeholder = 'Select cancer first';
      }
    }
    onRegimenChange();
  }

  function onRegimenChange() {
    const chemoPlan = getActiveChemoPlan();
    const carbSection = document.getElementById('carbSection');
    if (chemoPlan && regimenHasCarboplatin(chemoPlan)) {
      carbSection.hidden = false;
    } else {
      carbSection.hidden = true;
    }
    if (chemoPlan) autofillChemoCounselling(chemoPlan);
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
    const chemoPlan = getActiveChemoPlan();
    if (!chemoPlan) { target.innerHTML = ''; return; }

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
      if (regimenHasCarboplatin(chemoPlan) && gfr != null) {
        carbCalcEl.innerHTML =
          `<strong>Using:</strong> Age ${age} • ${sex === 'female' ? 'Female' : 'Male'} • Wt ${wt} kg • Creat ${creat} mg/dL` +
          `<br><strong>Cockcroft-Gault GFR:</strong> ${gfr.toFixed(1)} mL/min` +
          (gfr > 125 ? ` <em>(capped at 125 for Calvert)</em>` : '');
      } else if (regimenHasCarboplatin(chemoPlan)) {
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

    chemoPlan.drugs.forEach((d) => {
      const calc = calculateDrugDose(d, { bsa, wt, gfr });
      const stdDose = formatStandardDose(d);
      html += `<tr>
        <td>${escapeHtml(d.name)}</td>
        <td>${escapeHtml(stdDose)}</td>
        <td class="dose-cell">${calc}</td>
        <td class="sched-cell">${escapeHtml(d.schedule)}</td>
      </tr>`;
    });

    html += '</tbody></table>';
    target.innerHTML = html;
  }

  function formatStandardDose(drug) {
    if (!Number.isFinite(drug.dose)) return '—';
    if (drug.unit === 'AUC')   return `AUC ${drug.dose}`;
    if (drug.unit === 'mg/m²') return `${drug.dose} mg/m²`;
    if (drug.unit === 'mg/kg') return `${drug.dose} mg/kg`;
    if (drug.unit === 'mg')    return `${drug.dose} mg`;
    if (drug.unit === 'flat')  return `${drug.dose} mg`;
    return `${drug.dose} ${drug.unit}`;
  }

  function calculateDrugDose(drug, ctx) {
    const { bsa, wt, gfr } = ctx;
    if (!Number.isFinite(drug.dose)) return '—';

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
    if (regSel) regSel.addEventListener('change', () => {
      syncRegimenSearchFromSelect();
      onRegimenChange();
    });

    const regSearch = document.getElementById('chemoRegimenSearch');
    if (regSearch) {
      regSearch.addEventListener('input', onRegimenSearchInput);
      regSearch.addEventListener('change', onRegimenSearchInput);
    }

    const customToggle = document.getElementById('customDrugToggle');
    if (customToggle) {
      customToggle.addEventListener('change', () => {
        updateCustomDrugVisibility();
        onRegimenChange();
      });
    }

    ensureCustomDrugRows();

    const addCustomBtn = document.getElementById('addCustomDrugBtn');
    if (addCustomBtn) {
      addCustomBtn.addEventListener('click', () => {
        const row = addCustomDrugRow();
        updateCustomDrugVisibility();
        onRegimenChange();
        markInteracted();
        customDrugField(row, 'name')?.focus();
      });
    }

    const cycleNotes = document.getElementById('chemoCycleNotes');
    if (cycleNotes) {
      cycleNotes.addEventListener('input', () => {
        if (cycleNotes.value !== (cycleNotes.dataset.autoCounselling || '')) {
          cycleNotes.dataset.autoCounselling = '';
        }
      });
    }

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
    'chemoCancer', 'chemoRegimen', 'chemoCreat', 'chemoCycleNotes',
    'customDrugName', 'customDrugDose', 'customDrugUnit', 'customDrugSchedule'
  ];

  const PREVIEW_SYNC_FIELDS = [
    'name', 'mrn',
    'complaints', 'hpi', 'pastHistory',
    'personalHistory', 'familyHistory',
    'generalExam', 'systemicExam',
    'diagnosis', 'plan', 'otherNotes', 'prescription'
  ];

  let currentPreviewHtml = '';

  function updatePreviewEditsNotice() {
    const notice = document.getElementById('previewEditsNotice');
    if (notice) notice.hidden = !currentPreviewHtml;
  }

  function stripEditableMarkers(root) {
    root.querySelectorAll('[contenteditable]').forEach((el) => {
      el.removeAttribute('contenteditable');
      el.classList.remove('editable');
    });
  }

  function preserveFormattedContent(savedRoot, freshRoot, selector) {
    const savedNodes = Array.from(savedRoot.querySelectorAll(selector));
    const freshNodes = Array.from(freshRoot.querySelectorAll(selector));
    freshNodes.forEach((freshNode, index) => {
      const savedNode = savedNodes[index];
      if (!savedNode) return;
      if (editableText(savedNode) === editableText(freshNode)) {
        freshNode.innerHTML = savedNode.innerHTML;
      }
    });
  }

  function refreshCurrentPreviewFromForm() {
    if (!currentPreviewHtml) return;
    const printArea = document.getElementById('printArea');
    if (!printArea) return;

    const savedRoot = document.createElement('div');
    savedRoot.innerHTML = currentPreviewHtml;

    buildPrintSummary();
    const freshRoot = printArea.cloneNode(true);

    [
      '.print-section p',
      '[data-field]',
      '#printChemoSummary',
      '#printChemoTable td',
      '#printChemoNotes',
      '.print-meta div',
      '.team-doctor div',
      '.print-signature div'
    ].forEach((selector) => preserveFormattedContent(savedRoot, freshRoot, selector));

    stripEditableMarkers(freshRoot);
    currentPreviewHtml = freshRoot.innerHTML;
    printArea.innerHTML = currentPreviewHtml;
    updatePreviewEditsNotice();
  }

  function buildCurrentPrintableSummary() {
    const printArea = document.getElementById('printArea');
    if (currentPreviewHtml && printArea) {
      printArea.innerHTML = currentPreviewHtml;
      setPdfTitle();
      return;
    }
    buildPrintSummary();
  }

  function getFormState() {
    const state = {};
    FIELDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) state[id] = el.value;
    });
    state.planChemoToggle = document.getElementById('planChemoToggle')?.checked || false;
    state.customDrugToggle = document.getElementById('customDrugToggle')?.checked || false;
    state.customDrugs = getCustomDrugFormValues();
    if (currentPreviewHtml) state.previewHtml = currentPreviewHtml;
    return state;
  }

  function setFormState(state) {
    if (!state) return;
    currentPreviewHtml = state.previewHtml || '';
    updatePreviewEditsNotice();
    const cycleNotes = document.getElementById('chemoCycleNotes');
    if (cycleNotes) cycleNotes.dataset.autoCounselling = '';
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
    const customToggle = document.getElementById('customDrugToggle');
    if (customToggle) customToggle.checked = !!state.customDrugToggle;
    setCustomDrugRows(getSavedCustomDrugRows(state));
    updateCustomDrugVisibility();
    // Cascading: rebuild regimen dropdown for the loaded cancer type, then reselect regimen
    if (state.chemoCancer) {
      onCancerChange();
      const regSel = document.getElementById('chemoRegimen');
      if (regSel && state.chemoRegimen) regSel.value = state.chemoRegimen;
      syncRegimenSearchFromSelect();
      onRegimenChange();
    }
    // Recalc BSA + chemo table
    calculateBSA();
    onRegimenChange();
  }

  function clearFormState() {
    currentPreviewHtml = '';
    updatePreviewEditsNotice();
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
    const regSearch = document.getElementById('chemoRegimenSearch');
    if (regSearch) { regSearch.value = ''; regSearch.disabled = true; regSearch.placeholder = 'Select cancer first'; }
    const notesEl = document.getElementById('chemoCycleNotes');
    if (notesEl) notesEl.dataset.autoCounselling = '';
    setCustomDrugRows([]);
    updateCustomDrugVisibility();
    setRegimenSearchStatus('', '');
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
    return MEANINGFUL_FIELDS.some((f) => (state[f] || '').toString().trim().length > 0) ||
      stateHasCustomDrugName(state);
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
  function markInteracted() {
    userHasInteracted = true;
    refreshCurrentPreviewFromForm();
    scheduleAutosave();
  }
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
    patients.slice(0, MAX_PATIENTS).forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = patientLabel(p);
      sel.appendChild(opt);
    });
  }

  document.getElementById('savePatientBtn')?.addEventListener('click', () => {
    capturePreviewEdits();
    const state = getFormState();
    if (!state.name) {
      showToast('Enter a patient name first');
      return;
    }
    const patients = loadPatients();
    // De-dupe: if same name + UMR No. already exists, update it; else add new
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
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
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
    const ok = confirm('Delete this saved patient? The form will also be cleared.');
    if (!ok) return;
    const patients = loadPatients().filter((p) => p.id !== id);
    savePatientsList(patients);
    rebuildRecentPatientsDropdown();
    sel.value = '';
    document.getElementById('deletePatientBtn').hidden = true;
    // Clear the form too — since the data we just deleted was loaded into it
    clearFormState();
    discardDraft();
    if (typeof userHasInteracted !== 'undefined') userHasInteracted = false;
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    updateResumeButton();
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

  function escapeHtml(value) {
    return (value || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatChemoNotesForPrint(notes) {
    if (!notes) return '';
    return notes.split('\n').map((line) => {
      const safe = escapeHtml(line);
      if (line.trim().toLowerCase().startsWith('warning signs:')) {
        return `<em>${safe}</em>`;
      }
      return safe;
    }).join('<br>');
  }

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
    summary.push(`<strong>Regimen:</strong> ${escapeHtml(reg.name)}`);
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
        <td>${escapeHtml(d.name)}</td>
        <td>${escapeHtml(formatStandardDose(d))}</td>
        <td>${calc}</td>
        <td>${escapeHtml(d.schedule)}</td>`;
      tbody.appendChild(tr);
    });

    const notesEl = document.getElementById('printChemoNotes');
    notesEl.innerHTML = notes ? `<strong>Notes:</strong><br><span class="chemo-counselling-text">${formatChemoNotesForPrint(notes)}</span>` : '';
  }

  // ============================================================
  // Preview & Edit mode — show printable layout on screen, allow inline edits
  // ============================================================

  function editableText(el) {
    const text = el.innerText !== undefined ? el.innerText : el.textContent;
    return (text || '').replace(/\u00a0/g, ' ').trim();
  }

  function cleanPreviewHtml() {
    const printArea = document.getElementById('printArea');
    if (!printArea) return '';
    const clone = printArea.cloneNode(true);
    stripEditableMarkers(clone);
    return clone.innerHTML;
  }

  function syncPreviewTextToForm() {
    PREVIEW_SYNC_FIELDS.forEach((field) => {
      const editable = document.querySelector(`#printArea [data-field="${field}"]`);
      const input = document.getElementById(field);
      if (!editable || !input) return;
      input.value = editableText(editable);
    });
  }

  function capturePreviewEdits(options = {}) {
    if (!document.body.classList.contains('preview-mode')) return;
    syncPreviewTextToForm();
    currentPreviewHtml = cleanPreviewHtml();
    updatePreviewEditsNotice();
    userHasInteracted = true;
    if (options.saveNow) saveDraft();
    else scheduleAutosave();
  }

  function makePrintAreaEditable() {
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
        el.addEventListener('input', capturePreviewEdits);
        el.addEventListener('keyup', capturePreviewEdits);
        el.addEventListener('mouseup', capturePreviewEdits);
        el.addEventListener('blur', capturePreviewEdits);
      });
    });
  }

  function enterPreviewMode() {
    const printArea = document.getElementById('printArea');
    if (currentPreviewHtml) {
      printArea.innerHTML = currentPreviewHtml;
    } else {
      buildPrintSummary();
    }
    setPdfTitle();

    // Make editable elements contenteditable inside the print area
    makePrintAreaEditable();

    // Switch to preview mode
    document.body.classList.add('preview-mode');
    document.getElementById('previewToolbar').hidden = false;

    // Scroll preview to top
    window.scrollTo(0, 0);
  }

  function exitPreviewMode() {
    capturePreviewEdits();
    document.body.classList.remove('preview-mode');
    document.getElementById('previewToolbar').hidden = true;

    // Strip editing markers so saved preview HTML can be reused for future prints.
    const printArea = document.getElementById('printArea');
    stripEditableMarkers(printArea);
    updatePreviewEditsNotice();
    showToast('Preview edits saved. Main Print/PDF will use them.');
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
      capturePreviewEdits();
    });
  });

  // Back from preview → return to form
  const previewBackBtn = $('#previewBackBtn');
  if (previewBackBtn) {
    previewBackBtn.addEventListener('click', exitPreviewMode);
  }

  function printDocument(mode) {
    capturePreviewEdits({ saveNow: true });
    document.body.classList.toggle('print-bw', mode === 'bw');
    setPdfTitle();
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-bw');
      restoreTitle();
    }, 1500);
  }

  // Print from preview — uses current edited state (DOM)
  const previewPrintBtn = $('#previewPrintBtn');
  if (previewPrintBtn) {
    previewPrintBtn.addEventListener('click', () => {
      printDocument('bw');
    });
  }

  // Save as PDF from preview — preserve existing colour styling
  const previewPdfBtn = $('#previewPdfBtn');
  if (previewPdfBtn) {
    previewPdfBtn.addEventListener('click', () => {
      printDocument('color');
    });
  }

  // Main form print button — uses saved preview edits when present
  const printBtn = $('#printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      buildCurrentPrintableSummary();
      printDocument('bw');
    });
  }

  // Save as PDF from main form — direct print dialog, preserving colour styling
  const pdfBtn = $('#pdfBtn');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', () => {
      buildCurrentPrintableSummary();
      printDocument('color');
    });
  }

  window.addEventListener('beforeprint', () => {
    capturePreviewEdits({ saveNow: true });
  });

  window.addEventListener('pagehide', () => {
    capturePreviewEdits({ saveNow: true });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      capturePreviewEdits({ saveNow: true });
    }
  });

})();
