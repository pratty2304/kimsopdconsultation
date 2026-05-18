// OPD Summary Generator — Chemotherapy Regimen Database
// Curated common regimens per cancer type (KIMS MACS Onco Sciences)
//
// Drug units: 'mg/m²', 'mg/kg', 'mg', 'AUC', 'flat'
// AUC values: numeric (e.g. 5, 2, 1.5)
// Special flags: hasLoadingDose, loadingDose, isOral, requiresCreatinine (auto for AUC drugs)

window.REGIMENS = {

  breast: [
    {
      key: 'AC-T-q3w',
      name: 'AC → Paclitaxel (3-weekly)',
      aliases: ['AC pacli 3', 'AC paclitaxel 3 weekly', 'ACT 3 weekly', 'AC T q3w'],
      drugs: [
        { name: 'Doxorubicin',      dose: 60,  unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (AC)' },
        { name: 'Cyclophosphamide', dose: 600, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (AC)' },
        { name: 'Paclitaxel',       dose: 175, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (after AC)' }
      ]
    },
    {
      key: 'AC-T-weekly',
      name: 'AC → Paclitaxel (weekly)',
      aliases: ['AC pacli weekly', 'AC paclitaxel weekly', 'ACT weekly'],
      drugs: [
        { name: 'Doxorubicin',      dose: 60,  unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (AC)' },
        { name: 'Cyclophosphamide', dose: 600, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (AC)' },
        { name: 'Paclitaxel',       dose: 80,  unit: 'mg/m²', schedule: 'D1 weekly × 12 weeks (after AC)' }
      ]
    },
    {
      key: 'AC-Docetaxel',
      name: 'AC → Docetaxel',
      drugs: [
        { name: 'Doxorubicin',      dose: 60,  unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (AC)' },
        { name: 'Cyclophosphamide', dose: 600, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (AC)' },
        { name: 'Docetaxel',        dose: 100, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (after AC)' }
      ]
    },
    {
      key: 'EC-T-q3w',
      name: 'EC → Paclitaxel (3-weekly)',
      drugs: [
        { name: 'Epirubicin',       dose: 90,  unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (EC)' },
        { name: 'Cyclophosphamide', dose: 600, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (EC)' },
        { name: 'Paclitaxel',       dose: 175, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (after EC)' }
      ]
    },
    {
      key: 'EC-T-weekly',
      name: 'EC → Paclitaxel (weekly)',
      drugs: [
        { name: 'Epirubicin',       dose: 90,  unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (EC)' },
        { name: 'Cyclophosphamide', dose: 600, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (EC)' },
        { name: 'Paclitaxel',       dose: 80,  unit: 'mg/m²', schedule: 'D1 weekly × 12 weeks (after EC)' }
      ]
    },
    {
      key: 'EC-Docetaxel',
      name: 'EC → Docetaxel',
      drugs: [
        { name: 'Epirubicin',       dose: 90,  unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (EC)' },
        { name: 'Cyclophosphamide', dose: 600, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (EC)' },
        { name: 'Docetaxel',        dose: 100, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (after EC)' }
      ]
    },
    {
      key: 'TC',
      name: 'TC (Docetaxel + Cyclophosphamide)',
      drugs: [
        { name: 'Docetaxel',        dose: 75,  unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles' },
        { name: 'Cyclophosphamide', dose: 600, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles' }
      ]
    },
    {
      key: 'TCH',
      name: 'TCH (Docetaxel + Carboplatin + Trastuzumab)',
      drugs: [
        { name: 'Docetaxel',  dose: 75,        unit: 'mg/m²', schedule: 'D1, q21d × 6 cycles' },
        { name: 'Carboplatin', dose: 6,        unit: 'AUC',   schedule: 'D1, q21d × 6 cycles' },
        { name: 'Trastuzumab', dose: 6, loadingDose: 8, unit: 'mg/kg', schedule: 'D1, q21d (loading 8 mg/kg, then 6 mg/kg) × 1 year' }
      ]
    },
    {
      key: 'TCHP',
      name: 'TCHP (Docetaxel + Carboplatin + Trastuzumab + Pertuzumab)',
      drugs: [
        { name: 'Docetaxel',   dose: 75,       unit: 'mg/m²', schedule: 'D1, q21d × 6 cycles' },
        { name: 'Carboplatin', dose: 6,        unit: 'AUC',   schedule: 'D1, q21d × 6 cycles' },
        { name: 'Trastuzumab', dose: 6, loadingDose: 8, unit: 'mg/kg', schedule: 'D1, q21d (loading 8 mg/kg, then 6 mg/kg) × 1 year' },
        { name: 'Pertuzumab',  dose: 420, loadingDose: 840, unit: 'mg', schedule: 'D1, q21d (loading 840 mg, then 420 mg)' }
      ]
    },
    {
      key: 'KEYNOTE-522-PhaseA',
      name: 'KEYNOTE-522 — Phase A (Pembro + Carboplatin + Paclitaxel)',
      drugs: [
        { name: 'Pembrolizumab', dose: 200, unit: 'mg',    schedule: 'D1, q21d × 4 cycles (Phase A)' },
        { name: 'Paclitaxel',    dose: 80,  unit: 'mg/m²', schedule: 'D1 weekly × 12 weeks (Phase A)' },
        { name: 'Carboplatin',   dose: 1.5, unit: 'AUC',   schedule: 'D1 weekly × 12 weeks (Phase A) — AUC 1.5 weekly' }
      ]
    },
    {
      key: 'KEYNOTE-522-PhaseB',
      name: 'KEYNOTE-522 — Phase B (Pembro + AC)',
      drugs: [
        { name: 'Pembrolizumab',    dose: 200, unit: 'mg',    schedule: 'D1, q21d × 4 cycles (Phase B)' },
        { name: 'Doxorubicin',      dose: 60,  unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (Phase B)' },
        { name: 'Cyclophosphamide', dose: 600, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (Phase B)' }
      ]
    },
    {
      key: 'APT',
      name: 'Paclitaxel weekly + Trastuzumab (APT)',
      drugs: [
        { name: 'Paclitaxel',  dose: 80,       unit: 'mg/m²', schedule: 'D1 weekly × 12 weeks' },
        { name: 'Trastuzumab', dose: 2, loadingDose: 4, unit: 'mg/kg', schedule: 'Weekly (loading 4 mg/kg, then 2 mg/kg) × 12 weeks, then 6 mg/kg q21d to complete 1 year' }
      ]
    },
    {
      key: 'Paclitaxel-weekly',
      name: 'Paclitaxel weekly (single agent)',
      aliases: ['pacli wee', 'pacli weekly', 'weekly pacli', 'weekly paclitaxel', 'paclitaxel single agent weekly'],
      drugs: [
        { name: 'Paclitaxel', dose: 80, unit: 'mg/m²', schedule: 'D1 weekly' }
      ]
    },
    {
      key: 'Nab-Paclitaxel',
      name: 'Nab-Paclitaxel (single agent)',
      drugs: [
        { name: 'Nab-Paclitaxel', dose: 100, unit: 'mg/m²', schedule: 'D1, D8, D15, q28d' }
      ]
    },
    {
      key: 'Capecitabine-Breast',
      name: 'Capecitabine (single agent)',
      drugs: [
        { name: 'Capecitabine', dose: 1250, unit: 'mg/m²', schedule: 'PO BD D1–D14, q21d' }
      ]
    },
    {
      key: 'T-DXd',
      name: 'Trastuzumab Deruxtecan (T-DXd)',
      drugs: [
        { name: 'Trastuzumab Deruxtecan', dose: 5.4, unit: 'mg/kg', schedule: 'D1, q21d' }
      ]
    },
    {
      key: 'T-DM1',
      name: 'Trastuzumab Emtansine (T-DM1)',
      drugs: [
        { name: 'Trastuzumab Emtansine', dose: 3.6, unit: 'mg/kg', schedule: 'D1, q21d × 14 cycles (adjuvant) or until progression (metastatic)' }
      ]
    },
    {
      key: 'Letrozole',
      name: 'Letrozole',
      drugs: [
        { name: 'Letrozole', dose: 2.5, unit: 'flat', isOral: true, schedule: 'PO once daily, continuous' }
      ]
    },
    {
      key: 'Anastrozole',
      name: 'Anastrozole',
      drugs: [
        { name: 'Anastrozole', dose: 1, unit: 'flat', isOral: true, schedule: 'PO once daily, continuous' }
      ]
    },
    {
      key: 'Exemestane',
      name: 'Exemestane',
      drugs: [
        { name: 'Exemestane', dose: 25, unit: 'flat', isOral: true, schedule: 'PO once daily after meals, continuous' }
      ]
    },
    {
      key: 'Palbociclib-Letrozole',
      name: 'Palbociclib + Letrozole',
      aliases: ['PALOMA-1', 'PALOMA-2', 'pal let', 'palbo letrozole'],
      drugs: [
        { name: 'Palbociclib', dose: 125, unit: 'flat', isOral: true, schedule: 'PO once daily D1–D21, q28d' },
        { name: 'Letrozole',   dose: 2.5, unit: 'flat', isOral: true, schedule: 'PO once daily, continuous' }
      ]
    },
    {
      key: 'Palbociclib-Anastrozole',
      name: 'Palbociclib + Anastrozole',
      aliases: ['pal ana', 'palbo anastrozole'],
      drugs: [
        { name: 'Palbociclib', dose: 125, unit: 'flat', isOral: true, schedule: 'PO once daily D1–D21, q28d' },
        { name: 'Anastrozole', dose: 1,   unit: 'flat', isOral: true, schedule: 'PO once daily, continuous' }
      ]
    },
    {
      key: 'Palbociclib-Exemestane',
      name: 'Palbociclib + Exemestane',
      aliases: ['pal exe', 'palbo exemestane'],
      drugs: [
        { name: 'Palbociclib', dose: 125, unit: 'flat', isOral: true, schedule: 'PO once daily D1–D21, q28d' },
        { name: 'Exemestane',  dose: 25,  unit: 'flat', isOral: true, schedule: 'PO once daily after meals, continuous' }
      ]
    },
    {
      key: 'Ribociclib-Letrozole',
      name: 'Ribociclib + Letrozole',
      aliases: ['MONALEESA-2', 'ribo let', 'ribo letrozole'],
      drugs: [
        { name: 'Ribociclib', dose: 600, unit: 'flat', isOral: true, schedule: 'PO once daily D1–D21, q28d' },
        { name: 'Letrozole',  dose: 2.5, unit: 'flat', isOral: true, schedule: 'PO once daily, continuous' }
      ]
    },
    {
      key: 'Ribociclib-Anastrozole',
      name: 'Ribociclib + Anastrozole',
      aliases: ['ribo ana', 'ribo anastrozole'],
      drugs: [
        { name: 'Ribociclib',  dose: 600, unit: 'flat', isOral: true, schedule: 'PO once daily D1–D21, q28d' },
        { name: 'Anastrozole', dose: 1,   unit: 'flat', isOral: true, schedule: 'PO once daily, continuous' }
      ]
    },
    {
      key: 'Ribociclib-Exemestane',
      name: 'Ribociclib + Exemestane',
      aliases: ['ribo exe', 'ribo exemestane'],
      drugs: [
        { name: 'Ribociclib', dose: 600, unit: 'flat', isOral: true, schedule: 'PO once daily D1–D21, q28d' },
        { name: 'Exemestane', dose: 25,  unit: 'flat', isOral: true, schedule: 'PO once daily after meals, continuous' }
      ]
    },
    {
      key: 'Abemaciclib-Letrozole',
      name: 'Abemaciclib + Letrozole',
      aliases: ['MONARCH-3', 'abema let', 'abema letrozole'],
      drugs: [
        { name: 'Abemaciclib', dose: 150, unit: 'flat', isOral: true, schedule: 'PO BD continuously' },
        { name: 'Letrozole',   dose: 2.5, unit: 'flat', isOral: true, schedule: 'PO once daily, continuous' }
      ]
    },
    {
      key: 'Abemaciclib-Anastrozole',
      name: 'Abemaciclib + Anastrozole',
      aliases: ['abema ana', 'abema anastrozole'],
      drugs: [
        { name: 'Abemaciclib', dose: 150, unit: 'flat', isOral: true, schedule: 'PO BD continuously' },
        { name: 'Anastrozole', dose: 1,   unit: 'flat', isOral: true, schedule: 'PO once daily, continuous' }
      ]
    },
    {
      key: 'Abemaciclib-Exemestane',
      name: 'Abemaciclib + Exemestane',
      aliases: ['abema exe', 'abema exemestane'],
      drugs: [
        { name: 'Abemaciclib', dose: 150, unit: 'flat', isOral: true, schedule: 'PO BD continuously' },
        { name: 'Exemestane',  dose: 25,  unit: 'flat', isOral: true, schedule: 'PO once daily after meals, continuous' }
      ]
    },
    {
      key: 'Palbociclib-Fulvestrant',
      name: 'Palbociclib + Fulvestrant',
      drugs: [
        { name: 'Palbociclib', dose: 125, unit: 'flat', isOral: true, schedule: 'PO once daily D1–D21, q28d' },
        { name: 'Fulvestrant', dose: 500, unit: 'flat',                schedule: 'IM D1, D15, D29, then q28d (LD on cycle 1)' }
      ]
    },
    {
      key: 'Abemaciclib',
      name: 'Abemaciclib',
      drugs: [
        { name: 'Abemaciclib', dose: 150, unit: 'flat', isOral: true, schedule: 'PO BD continuously' }
      ]
    },
    {
      key: 'Ribociclib',
      name: 'Ribociclib',
      drugs: [
        { name: 'Ribociclib', dose: 600, unit: 'flat', isOral: true, schedule: 'PO once daily D1–D21, q28d' }
      ]
    }
  ],

  colon: [
    {
      key: 'mFOLFOX6-Colon',
      name: 'mFOLFOX6',
      drugs: [
        { name: 'Oxaliplatin',     dose: 85,   unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: 'Leucovorin',      dose: 400,  unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: '5-Fluorouracil',  dose: 400,  unit: 'mg/m²', schedule: 'Bolus D1, q14d' },
        { name: '5-Fluorouracil',  dose: 2400, unit: 'mg/m²', schedule: 'CI 46h D1–D2, q14d' }
      ]
    },
    {
      key: 'CAPOX-Colon',
      name: 'CAPOX (Capecitabine + Oxaliplatin)',
      drugs: [
        { name: 'Oxaliplatin',  dose: 130,  unit: 'mg/m²', schedule: 'D1, q21d' },
        { name: 'Capecitabine', dose: 1000, unit: 'mg/m²', schedule: 'PO BD D1–D14, q21d' }
      ]
    },
    {
      key: 'Capecitabine-Colon',
      name: 'Capecitabine (single agent)',
      drugs: [
        { name: 'Capecitabine', dose: 1250, unit: 'mg/m²', schedule: 'PO BD D1–D14, q21d' }
      ]
    },
    {
      key: '5FU-LV-Colon',
      name: '5-FU + Leucovorin',
      drugs: [
        { name: '5-Fluorouracil', dose: 425, unit: 'mg/m²', schedule: 'D1–D5, q28d' },
        { name: 'Leucovorin',     dose: 20,  unit: 'mg/m²', schedule: 'D1–D5, q28d' }
      ]
    }
  ],

  rectal: [
    {
      key: 'Cape-RT',
      name: 'Capecitabine + RT',
      drugs: [
        { name: 'Capecitabine', dose: 825, unit: 'mg/m²', schedule: 'PO BD on RT days × ~5–6 weeks' }
      ]
    },
    {
      key: 'mFOLFOX6-Rectal',
      name: 'mFOLFOX6',
      drugs: [
        { name: 'Oxaliplatin',     dose: 85,   unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: 'Leucovorin',      dose: 400,  unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: '5-Fluorouracil',  dose: 400,  unit: 'mg/m²', schedule: 'Bolus D1, q14d' },
        { name: '5-Fluorouracil',  dose: 2400, unit: 'mg/m²', schedule: 'CI 46h D1–D2, q14d' }
      ]
    },
    {
      key: 'CAPOX-Rectal',
      name: 'CAPOX',
      drugs: [
        { name: 'Oxaliplatin',  dose: 130,  unit: 'mg/m²', schedule: 'D1, q21d' },
        { name: 'Capecitabine', dose: 1000, unit: 'mg/m²', schedule: 'PO BD D1–D14, q21d' }
      ]
    },
    {
      key: 'mFOLFIRINOX-Rectal',
      name: 'mFOLFIRINOX (TNT)',
      drugs: [
        { name: 'Oxaliplatin',    dose: 85,   unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: 'Irinotecan',     dose: 150,  unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: 'Leucovorin',     dose: 400,  unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: '5-Fluorouracil', dose: 2400, unit: 'mg/m²', schedule: 'CI 46h D1–D2, q14d' }
      ]
    }
  ],

  metastatic_crc: [
    {
      key: 'FOLFOX-Bev',
      name: 'mFOLFOX6 + Bevacizumab',
      drugs: [
        { name: 'Oxaliplatin',     dose: 85,   unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: 'Leucovorin',      dose: 400,  unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: '5-Fluorouracil',  dose: 400,  unit: 'mg/m²', schedule: 'Bolus D1, q14d' },
        { name: '5-Fluorouracil',  dose: 2400, unit: 'mg/m²', schedule: 'CI 46h D1–D2, q14d' },
        { name: 'Bevacizumab',     dose: 5,    unit: 'mg/kg', schedule: 'D1, q14d' }
      ]
    },
    {
      key: 'FOLFIRI-Bev',
      name: 'FOLFIRI + Bevacizumab',
      drugs: [
        { name: 'Irinotecan',      dose: 180,  unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: 'Leucovorin',      dose: 400,  unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: '5-Fluorouracil',  dose: 400,  unit: 'mg/m²', schedule: 'Bolus D1, q14d' },
        { name: '5-Fluorouracil',  dose: 2400, unit: 'mg/m²', schedule: 'CI 46h D1–D2, q14d' },
        { name: 'Bevacizumab',     dose: 5,    unit: 'mg/kg', schedule: 'D1, q14d' }
      ]
    },
    {
      key: 'FOLFOX-Cetuximab',
      name: 'mFOLFOX6 + Cetuximab (RAS/BRAF wt, left-sided)',
      drugs: [
        { name: 'Cetuximab',       dose: 500,  unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: 'Oxaliplatin',     dose: 85,   unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: 'Leucovorin',      dose: 400,  unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: '5-Fluorouracil',  dose: 400,  unit: 'mg/m²', schedule: 'Bolus D1, q14d' },
        { name: '5-Fluorouracil',  dose: 2400, unit: 'mg/m²', schedule: 'CI 46h D1–D2, q14d' }
      ]
    },
    {
      key: 'FOLFOXIRI-Bev',
      name: 'FOLFOXIRI + Bevacizumab (TRIBE)',
      drugs: [
        { name: 'Irinotecan',     dose: 165,  unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: 'Oxaliplatin',    dose: 85,   unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: 'Leucovorin',     dose: 200,  unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: '5-Fluorouracil', dose: 3200, unit: 'mg/m²', schedule: 'CI 46h D1–D2, q14d' },
        { name: 'Bevacizumab',    dose: 5,    unit: 'mg/kg', schedule: 'D1, q14d' }
      ]
    },
    {
      key: 'Cape-Bev-Maintenance',
      name: 'Capecitabine + Bevacizumab (maintenance)',
      drugs: [
        { name: 'Capecitabine', dose: 1000, unit: 'mg/m²', schedule: 'PO BD D1–D14, q21d' },
        { name: 'Bevacizumab',  dose: 7.5,  unit: 'mg/kg', schedule: 'D1, q21d' }
      ]
    }
  ],

  gastric: [
    {
      key: 'FLOT',
      name: 'FLOT',
      drugs: [
        { name: 'Docetaxel',       dose: 50,   unit: 'mg/m²', schedule: 'D1, q14d × 8 cycles (4 preop + 4 postop)' },
        { name: 'Oxaliplatin',     dose: 85,   unit: 'mg/m²', schedule: 'D1, q14d × 8 cycles' },
        { name: 'Leucovorin',      dose: 200,  unit: 'mg/m²', schedule: 'D1, q14d × 8 cycles' },
        { name: '5-Fluorouracil',  dose: 2600, unit: 'mg/m²', schedule: 'CI 24h D1, q14d × 8 cycles' }
      ]
    },
    {
      key: 'Durva-FLOT',
      name: 'Durvalumab + FLOT (MATTERHORN)',
      drugs: [
        { name: 'Durvalumab',      dose: 1500, unit: 'mg',    schedule: 'D1, q14d × 8 cycles + 1 yr maintenance' },
        { name: 'Docetaxel',       dose: 50,   unit: 'mg/m²', schedule: 'D1, q14d × 8 cycles' },
        { name: 'Oxaliplatin',     dose: 85,   unit: 'mg/m²', schedule: 'D1, q14d × 8 cycles' },
        { name: 'Leucovorin',      dose: 200,  unit: 'mg/m²', schedule: 'D1, q14d × 8 cycles' },
        { name: '5-Fluorouracil',  dose: 2600, unit: 'mg/m²', schedule: 'CI 24h D1, q14d × 8 cycles' }
      ]
    },
    {
      key: 'CAPOX-Gastric',
      name: 'CAPOX',
      drugs: [
        { name: 'Oxaliplatin',  dose: 130,  unit: 'mg/m²', schedule: 'D1, q21d' },
        { name: 'Capecitabine', dose: 1000, unit: 'mg/m²', schedule: 'PO BD D1–D14, q21d' }
      ]
    },
    {
      key: 'mFOLFOX6-Gastric',
      name: 'mFOLFOX6',
      drugs: [
        { name: 'Oxaliplatin',     dose: 85,   unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: 'Leucovorin',      dose: 400,  unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: '5-Fluorouracil',  dose: 400,  unit: 'mg/m²', schedule: 'Bolus D1, q14d' },
        { name: '5-Fluorouracil',  dose: 2400, unit: 'mg/m²', schedule: 'CI 46h D1–D2, q14d' }
      ]
    },
    {
      key: 'DCF',
      name: 'DCF (Docetaxel + Cisplatin + 5-FU)',
      drugs: [
        { name: 'Docetaxel',       dose: 75,  unit: 'mg/m²', schedule: 'D1, q21d' },
        { name: 'Cisplatin',       dose: 75,  unit: 'mg/m²', schedule: 'D1, q21d' },
        { name: '5-Fluorouracil',  dose: 750, unit: 'mg/m²', schedule: 'CI D1–D5, q21d' }
      ]
    },
    {
      key: 'CAPOX-Trastuzumab',
      name: 'CAPOX + Trastuzumab (HER2+)',
      drugs: [
        { name: 'Oxaliplatin',  dose: 130,  unit: 'mg/m²', schedule: 'D1, q21d' },
        { name: 'Capecitabine', dose: 1000, unit: 'mg/m²', schedule: 'PO BD D1–D14, q21d' },
        { name: 'Trastuzumab',  dose: 6, loadingDose: 8, unit: 'mg/kg', schedule: 'D1, q21d (loading 8 mg/kg, then 6 mg/kg)' }
      ]
    }
  ],

  esophageal: [
    {
      key: 'CROSS',
      name: 'CROSS (Carboplatin+ Paclitaxel + RT)',
      drugs: [
        { name: 'Carboplatin', dose: 2,  unit: 'AUC',   schedule: 'D1 weekly × 5 weeks (AUC 2 weekly with concurrent RT)' },
        { name: 'Paclitaxel',  dose: 50, unit: 'mg/m²', schedule: 'D1 weekly × 5 weeks (with concurrent RT)' }
      ]
    },
    {
      key: 'FLOT-Eso',
      name: 'FLOT (perioperative)',
      drugs: [
        { name: 'Docetaxel',       dose: 50,   unit: 'mg/m²', schedule: 'D1, q14d × 8 cycles' },
        { name: 'Oxaliplatin',     dose: 85,   unit: 'mg/m²', schedule: 'D1, q14d × 8 cycles' },
        { name: 'Leucovorin',      dose: 200,  unit: 'mg/m²', schedule: 'D1, q14d × 8 cycles' },
        { name: '5-Fluorouracil',  dose: 2600, unit: 'mg/m²', schedule: 'CI 24h D1, q14d × 8 cycles' }
      ]
    },
    {
      key: 'mFOLFOX6-Eso',
      name: 'mFOLFOX6',
      drugs: [
        { name: 'Oxaliplatin',     dose: 85,   unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: 'Leucovorin',      dose: 400,  unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: '5-Fluorouracil',  dose: 400,  unit: 'mg/m²', schedule: 'Bolus D1, q14d' },
        { name: '5-Fluorouracil',  dose: 2400, unit: 'mg/m²', schedule: 'CI 46h D1–D2, q14d' }
      ]
    },
    {
      key: 'DCF-Eso',
      name: 'DCF',
      drugs: [
        { name: 'Docetaxel',       dose: 75,  unit: 'mg/m²', schedule: 'D1, q21d' },
        { name: 'Cisplatin',       dose: 75,  unit: 'mg/m²', schedule: 'D1, q21d' },
        { name: '5-Fluorouracil',  dose: 750, unit: 'mg/m²', schedule: 'CI D1–D5, q21d' }
      ]
    },
    {
      key: 'CAPOX-Eso',
      name: 'CAPOX (Capecitabine + Oxaliplatin)',
      drugs: [
        { name: 'Oxaliplatin',  dose: 130,  unit: 'mg/m²', schedule: 'D1, q21d' },
        { name: 'Capecitabine', dose: 1000, unit: 'mg/m²', schedule: 'PO BD D1–D14, q21d' }
      ]
    },
    {
      key: 'CarboPac-3w-Eso',
      name: 'Carboplatin + Paclitaxel (3-weekly)',
      drugs: [
        { name: 'Carboplatin', dose: 5,   unit: 'AUC',   schedule: 'D1, q21d × 6 cycles' },
        { name: 'Paclitaxel',  dose: 175, unit: 'mg/m²', schedule: 'D1, q21d × 6 cycles' }
      ]
    },
    {
      key: 'CarboPac-Weekly-Eso',
      name: 'Carboplatin + Paclitaxel (weekly)',
      drugs: [
        { name: 'Carboplatin', dose: 2,  unit: 'AUC',   schedule: 'D1 weekly' },
        { name: 'Paclitaxel',  dose: 80, unit: 'mg/m²', schedule: 'D1 weekly' }
      ]
    }
  ],

  cervical: [
    {
      key: 'Cisplatin-RT-Cervical',
      name: 'Cisplatin weekly + RT',
      drugs: [
        { name: 'Cisplatin', dose: 40, unit: 'mg/m²', schedule: 'D1 weekly × 5–6 weeks (with concurrent RT, max 70 mg/dose)' }
      ]
    },
    {
      key: 'CarboPac-Cervical',
      name: 'Carboplatin + Paclitaxel',
      drugs: [
        { name: 'Carboplatin', dose: 5,   unit: 'AUC',   schedule: 'D1, q21d × 6 cycles' },
        { name: 'Paclitaxel',  dose: 175, unit: 'mg/m²', schedule: 'D1, q21d × 6 cycles' }
      ]
    },
    {
      key: 'CarboPac-Bev-Cervical',
      name: 'Carboplatin + Paclitaxel + Bevacizumab',
      drugs: [
        { name: 'Carboplatin', dose: 5,   unit: 'AUC',   schedule: 'D1, q21d' },
        { name: 'Paclitaxel',  dose: 175, unit: 'mg/m²', schedule: 'D1, q21d' },
        { name: 'Bevacizumab', dose: 1200, unit: 'mg',   schedule: '1200 mg flat, D1 q21d' }
      ]
    },
    {
      key: 'KEYNOTE-826-CarboPac-Pembro-Bev-Cervical',
      name: 'Pembrolizumab + Carboplatin + Paclitaxel + Bevacizumab (KEYNOTE-826, PD-L1 CPS >=1 only)',
      aliases: ['KEYNOTE-826', 'pembro carbo pac bev cervical', 'pembrolizumab carboplatin paclitaxel bevacizumab cervical', 'PDL1 cervical pembro'],
      drugs: [
        { name: 'Pembrolizumab', dose: 200, unit: 'mg',    schedule: 'D1, q21d up to 35 cycles / 24 months (PD-L1 CPS >=1 tumors only)' },
        { name: 'Carboplatin',   dose: 5,   unit: 'AUC',   schedule: 'D1, q21d' },
        { name: 'Paclitaxel',    dose: 175, unit: 'mg/m²', schedule: 'D1, q21d' },
        { name: 'Bevacizumab',   dose: 15,  unit: 'mg/kg', schedule: 'D1, q21d if no contraindication' }
      ]
    },
    {
      key: 'KEYNOTE-A18-Pembro-Cisplatin-RT-Cervical',
      name: 'Pembrolizumab + Cisplatin weekly + RT (KEYNOTE-A18)',
      aliases: ['KEYNOTE-A18', 'pembro cisplatin RT cervical', 'concurrent pembro cervical', 'pembrolizumab chemoradiotherapy cervical'],
      drugs: [
        { name: 'Pembrolizumab',               dose: 200, unit: 'mg',    schedule: 'D1, q21d × 5 cycles with concurrent CRT' },
        { name: 'Pembrolizumab (maintenance)', dose: 400, unit: 'mg',    schedule: 'D1, q42d × 15 cycles after CRT' },
        { name: 'Cisplatin',                   dose: 40,  unit: 'mg/m²', schedule: 'D1 weekly × 5 cycles (optional 6th) with EBRT followed by brachytherapy' }
      ]
    },
    {
      key: 'TIP-Cervical',
      name: 'TIP (Paclitaxel + Ifosfamide + Cisplatin)',
      drugs: [
        { name: 'Paclitaxel', dose: 175,  unit: 'mg/m²', schedule: 'D1, q21d' },
        { name: 'Ifosfamide', dose: 1500, unit: 'mg/m²', schedule: 'D1–D3 (with Mesna), q21d' },
        { name: 'Cisplatin',  dose: 50,   unit: 'mg/m²', schedule: 'D2, q21d' }
      ]
    }
  ],

  endometrial: [
    {
      key: 'CarboPac-Endo',
      name: 'Carboplatin + Paclitaxel',
      drugs: [
        { name: 'Carboplatin', dose: 5,   unit: 'AUC',   schedule: 'D1, q21d × 6 cycles' },
        { name: 'Paclitaxel',  dose: 175, unit: 'mg/m²', schedule: 'D1, q21d × 6 cycles' }
      ]
    },
    {
      key: 'CarboPac-Pembro-Endo',
      name: 'Carboplatin + Paclitaxel + Pembrolizumab (NRG-GY018)',
      drugs: [
        { name: 'Carboplatin',   dose: 5,   unit: 'AUC',   schedule: 'D1, q21d × 6 cycles' },
        { name: 'Paclitaxel',    dose: 175, unit: 'mg/m²', schedule: 'D1, q21d × 6 cycles' },
        { name: 'Pembrolizumab', dose: 200, unit: 'mg',    schedule: 'D1, q21d × 6 cycles, then 400 mg q42d maintenance up to 14 cycles' }
      ]
    },
    {
      key: 'CarboPac-Dostarlimab-Endo',
      name: 'Carboplatin + Paclitaxel + Dostarlimab (RUBY)',
      drugs: [
        { name: 'Carboplatin',  dose: 5,   unit: 'AUC',   schedule: 'D1, q21d × 6 cycles' },
        { name: 'Paclitaxel',   dose: 175, unit: 'mg/m²', schedule: 'D1, q21d × 6 cycles' },
        { name: 'Dostarlimab',  dose: 500, unit: 'mg',    schedule: 'D1, q21d × 6 cycles, then 1000 mg q42d up to 3 yr' }
      ]
    },
    {
      key: 'Dostarlimab-Maintenance',
      name: 'Dostarlimab maintenance',
      drugs: [
        { name: 'Dostarlimab', dose: 1000, unit: 'mg', schedule: 'D1, q42d up to 3 years' }
      ]
    }
  ],

  head_neck: [
    {
      key: 'Cisplatin-Weekly-RT',
      name: 'Cisplatin weekly + RT',
      drugs: [
        { name: 'Cisplatin', dose: 40, unit: 'mg/m²', schedule: 'D1 weekly × 6–7 weeks (with concurrent RT, max 70 mg/dose)' }
      ]
    },
    {
      key: 'Cisplatin-3w-RT',
      name: 'Cisplatin 3-weekly + RT',
      drugs: [
        { name: 'Cisplatin', dose: 100, unit: 'mg/m²', schedule: 'D1, D22, D43 (with concurrent RT)' }
      ]
    },
    {
      key: 'TPF-Induction',
      name: 'TPF (induction)',
      drugs: [
        { name: 'Docetaxel',       dose: 75,  unit: 'mg/m²', schedule: 'D1, q21d × 3 cycles' },
        { name: 'Cisplatin',       dose: 75,  unit: 'mg/m²', schedule: 'D1, q21d × 3 cycles' },
        { name: '5-Fluorouracil',  dose: 750, unit: 'mg/m²', schedule: 'CI D1–D5, q21d × 3 cycles' }
      ]
    },
    {
      key: 'Pembro-Carbo-5FU',
      name: 'Pembrolizumab + Carboplatin + 5-FU (KEYNOTE-048)',
      drugs: [
        { name: 'Pembrolizumab',  dose: 200, unit: 'mg',    schedule: 'D1, q21d × 6 cycles, then maintenance' },
        { name: 'Carboplatin',    dose: 5,   unit: 'AUC',   schedule: 'D1, q21d × 6 cycles' },
        { name: '5-Fluorouracil', dose: 1000, unit: 'mg/m²', schedule: 'CI D1–D4, q21d × 6 cycles' }
      ]
    },
    {
      key: 'EXTREME',
      name: 'EXTREME (Cetuximab + Carboplatin + 5-FU)',
      drugs: [
        { name: 'Cetuximab',      dose: 250, loadingDose: 400, unit: 'mg/m²', schedule: 'Weekly (loading 400 mg/m², then 250 mg/m²)' },
        { name: 'Carboplatin',    dose: 5,   unit: 'AUC',   schedule: 'D1, q21d × 6 cycles' },
        { name: '5-Fluorouracil', dose: 1000, unit: 'mg/m²', schedule: 'CI D1–D4, q21d × 6 cycles' }
      ]
    }
  ],

  lung: [
    {
      key: 'Cis-Pem',
      name: 'Cisplatin + Pemetrexed (non-squamous)',
      drugs: [
        { name: 'Cisplatin',  dose: 75,  unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles' },
        { name: 'Pemetrexed', dose: 500, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles (with B12 + folate)' }
      ]
    },
    {
      key: 'Carbo-Pem-Pembro',
      name: 'Pembrolizumab + Carboplatin + Pemetrexed (KEYNOTE-189, non-squamous)',
      drugs: [
        { name: 'Pembrolizumab', dose: 200, unit: 'mg',    schedule: 'D1, q21d up to 35 cycles (~2 years)' },
        { name: 'Carboplatin',   dose: 5,   unit: 'AUC',   schedule: 'D1, q21d × 4 cycles' },
        { name: 'Pemetrexed',    dose: 500, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles, then maintenance (with B12 + folate)' }
      ]
    },
    {
      key: 'Carbo-Pac-Pembro',
      name: 'Pembrolizumab + Carboplatin + Paclitaxel (KEYNOTE-407, squamous)',
      drugs: [
        { name: 'Pembrolizumab', dose: 200, unit: 'mg',    schedule: 'D1, q21d up to 35 cycles' },
        { name: 'Carboplatin',   dose: 6,   unit: 'AUC',   schedule: 'D1, q21d × 4 cycles' },
        { name: 'Paclitaxel',    dose: 200, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles' }
      ]
    },
    {
      key: 'Nivo-Carbo-Pem',
      name: 'Nivolumab + Carboplatin + Pemetrexed (non-squamous)',
      drugs: [
        { name: 'Nivolumab',  dose: 360, unit: 'mg',    schedule: 'D1, q21d up to 24 months' },
        { name: 'Carboplatin', dose: 5,  unit: 'AUC',   schedule: 'D1, q21d × 4 cycles' },
        { name: 'Pemetrexed',  dose: 500, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles, then maintenance (with B12 + folate)' }
      ]
    },
    {
      key: 'Tisle-Carbo-Pem',
      name: 'Tislelizumab + Carboplatin + Pemetrexed (RATIONALE-304, non-squamous)',
      drugs: [
        { name: 'Tislelizumab', dose: 200, unit: 'mg',    schedule: 'D1, q21d up to 2 years' },
        { name: 'Carboplatin',  dose: 5,   unit: 'AUC',   schedule: 'D1, q21d × 4 cycles' },
        { name: 'Pemetrexed',   dose: 500, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles, then maintenance (with B12 + folate)' }
      ]
    },
    {
      key: 'Durva-PACIFIC',
      name: 'Durvalumab consolidation (PACIFIC, post-CRT stage III)',
      drugs: [
        { name: 'Durvalumab', dose: 1500, unit: 'mg', schedule: 'D1, q28d × 12 months (or 10 mg/kg q14d)' }
      ]
    },
    {
      key: 'Durva-Carbo-Pem',
      name: 'Durvalumab + Carboplatin + Pemetrexed (AEGEAN periop, non-squamous)',
      drugs: [
        { name: 'Durvalumab',  dose: 1500, unit: 'mg',    schedule: 'D1, q21d × 4 cycles preop, then 1500 mg q28d × 12 cycles postop' },
        { name: 'Carboplatin', dose: 5,    unit: 'AUC',   schedule: 'D1, q21d × 4 cycles preop' },
        { name: 'Pemetrexed',  dose: 500,  unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles preop (with B12 + folate)' }
      ]
    },
    {
      key: 'Osimertinib',
      name: 'Osimertinib (FLAURA, EGFR exon19del/L858R)',
      drugs: [
        { name: 'Osimertinib', dose: 80, unit: 'flat', isOral: true, schedule: 'PO once daily, continuously until progression' }
      ]
    },
    {
      key: 'Osi-Carbo-Pem',
      name: 'Osimertinib + Carboplatin + Pemetrexed (FLAURA2, EGFR-mutated)',
      drugs: [
        { name: 'Osimertinib', dose: 80,  unit: 'flat',  isOral: true, schedule: 'PO once daily continuously' },
        { name: 'Carboplatin', dose: 5,   unit: 'AUC',   schedule: 'D1, q21d × 4 cycles' },
        { name: 'Pemetrexed',  dose: 500, unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles, then maintenance (with B12 + folate)' }
      ]
    },
    {
      key: 'Gefitinib',
      name: 'Gefitinib (IPASS, EGFR exon19del/L858R)',
      drugs: [
        { name: 'Gefitinib', dose: 250, unit: 'flat', isOral: true, schedule: 'PO once daily, continuously until progression' }
      ]
    },
    {
      key: 'Gef-Carbo-Pem',
      name: 'Gefitinib + Carboplatin + Pemetrexed (NEJ009, EGFR-mutated)',
      drugs: [
        { name: 'Gefitinib',   dose: 250, unit: 'flat',  isOral: true, schedule: 'PO once daily continuously' },
        { name: 'Carboplatin', dose: 5,   unit: 'AUC',   schedule: 'D1, q21d × 6 cycles' },
        { name: 'Pemetrexed',  dose: 500, unit: 'mg/m²', schedule: 'D1, q21d × 6 cycles, then maintenance (with B12 + folate)' }
      ]
    },
    {
      key: 'Etop-Carbo-Atezo',
      name: 'Etoposide + Carboplatin + Atezolizumab (IMpower133, ES-SCLC)',
      drugs: [
        { name: 'Etoposide',    dose: 100, unit: 'mg/m²', schedule: 'D1–D3, q21d × 4 cycles' },
        { name: 'Carboplatin',  dose: 5,   unit: 'AUC',   schedule: 'D1, q21d × 4 cycles' },
        { name: 'Atezolizumab', dose: 1200, unit: 'mg',   schedule: 'D1, q21d, then maintenance' }
      ]
    },
    {
      key: 'Cis-Etop-SCLC',
      name: 'Cisplatin + Etoposide (LS-SCLC)',
      drugs: [
        { name: 'Cisplatin', dose: 75,  unit: 'mg/m²', schedule: 'D1, q21d × 4 cycles' },
        { name: 'Etoposide', dose: 100, unit: 'mg/m²', schedule: 'D1–D3, q21d × 4 cycles' }
      ]
    }
  ],

  lymphoma: [
    {
      key: 'R-CHOP',
      name: 'R-CHOP',
      drugs: [
        { name: 'Rituximab',       dose: 375, unit: 'mg/m²', schedule: 'D1, q21d × 6 cycles' },
        { name: 'Cyclophosphamide', dose: 750, unit: 'mg/m²', schedule: 'D1, q21d × 6 cycles' },
        { name: 'Doxorubicin',     dose: 50,  unit: 'mg/m²', schedule: 'D1, q21d × 6 cycles' },
        { name: 'Vincristine',     dose: 1.4, unit: 'mg/m²', schedule: 'D1 (cap 2 mg), q21d × 6 cycles' },
        { name: 'Prednisolone',    dose: 100, unit: 'flat', isOral: true, schedule: 'PO D1–D5, q21d × 6 cycles' }
      ]
    },
    {
      key: 'ABVD',
      name: 'ABVD',
      drugs: [
        { name: 'Doxorubicin', dose: 25,  unit: 'mg/m²', schedule: 'D1, D15, q28d × 6 cycles' },
        { name: 'Bleomycin',   dose: 10,  unit: 'mg/m²', schedule: 'D1, D15, q28d × 6 cycles' },
        { name: 'Vinblastine', dose: 6,   unit: 'mg/m²', schedule: 'D1, D15, q28d × 6 cycles' },
        { name: 'Dacarbazine', dose: 375, unit: 'mg/m²', schedule: 'D1, D15, q28d × 6 cycles' }
      ]
    },
    {
      key: 'BV-AVD',
      name: 'BV-AVD (ECHELON-1)',
      drugs: [
        { name: 'Brentuximab vedotin', dose: 1.2, unit: 'mg/kg', schedule: 'D1, D15, q28d × 6 cycles' },
        { name: 'Doxorubicin',         dose: 25,  unit: 'mg/m²', schedule: 'D1, D15, q28d × 6 cycles' },
        { name: 'Vinblastine',         dose: 6,   unit: 'mg/m²', schedule: 'D1, D15, q28d × 6 cycles' },
        { name: 'Dacarbazine',         dose: 375, unit: 'mg/m²', schedule: 'D1, D15, q28d × 6 cycles' }
      ]
    },
    {
      key: 'DA-EPOCH-R',
      name: 'DA-EPOCH-R',
      drugs: [
        { name: 'Rituximab',       dose: 375, unit: 'mg/m²', schedule: 'D1, q21d' },
        { name: 'Etoposide',       dose: 50,  unit: 'mg/m²', schedule: 'CI D1–D4, q21d' },
        { name: 'Doxorubicin',     dose: 10,  unit: 'mg/m²', schedule: 'CI D1–D4, q21d' },
        { name: 'Vincristine',     dose: 0.4, unit: 'mg/m²', schedule: 'CI D1–D4, q21d (no cap in EPOCH)' },
        { name: 'Cyclophosphamide', dose: 750, unit: 'mg/m²', schedule: 'D5, q21d (dose-adjusted)' },
        { name: 'Prednisolone',    dose: 60,  unit: 'mg/m²', isOral: true, schedule: 'PO BD D1–D5, q21d' }
      ]
    },
    {
      key: 'BR',
      name: 'BR (Bendamustine + Rituximab)',
      drugs: [
        { name: 'Rituximab',   dose: 375, unit: 'mg/m²', schedule: 'D1, q28d × 6 cycles' },
        { name: 'Bendamustine', dose: 90, unit: 'mg/m²', schedule: 'D1, D2, q28d × 6 cycles' }
      ]
    }
  ],

  pancreatic: [
    {
      key: 'mFOLFIRINOX',
      name: 'mFOLFIRINOX',
      drugs: [
        { name: 'Oxaliplatin',     dose: 85,   unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: 'Irinotecan',      dose: 150,  unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: 'Leucovorin',      dose: 400,  unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: '5-Fluorouracil',  dose: 2400, unit: 'mg/m²', schedule: 'CI 46h D1–D2, q14d' }
      ]
    },
    {
      key: 'Gem-NabPac',
      name: 'Gemcitabine + Nab-Paclitaxel',
      drugs: [
        { name: 'Nab-Paclitaxel', dose: 125,  unit: 'mg/m²', schedule: 'D1, D8, D15, q28d' },
        { name: 'Gemcitabine',    dose: 1000, unit: 'mg/m²', schedule: 'D1, D8, D15, q28d' }
      ]
    },
    {
      key: 'Gem-Single',
      name: 'Gemcitabine (single agent)',
      drugs: [
        { name: 'Gemcitabine', dose: 1000, unit: 'mg/m²', schedule: 'D1, D8, D15, q28d' }
      ]
    },
    {
      key: 'Gem-Cape',
      name: 'Gemcitabine + Capecitabine (adjuvant — ESPAC-4)',
      drugs: [
        { name: 'Gemcitabine',  dose: 1000, unit: 'mg/m²', schedule: 'D1, D8, D15, q28d × 6 cycles' },
        { name: 'Capecitabine', dose: 830,  unit: 'mg/m²', schedule: 'PO BD D1–D21, q28d × 6 cycles' }
      ]
    }
  ],

  ovarian: [
    {
      key: 'CarboPac-Ovarian',
      name: 'Carboplatin + Paclitaxel',
      drugs: [
        { name: 'Carboplatin', dose: 5,   unit: 'AUC',   schedule: 'D1, q21d × 6 cycles' },
        { name: 'Paclitaxel',  dose: 175, unit: 'mg/m²', schedule: 'D1, q21d × 6 cycles' }
      ]
    },
    {
      key: 'CarboPac-Bev-Ovarian',
      name: 'Carboplatin + Paclitaxel + Bevacizumab',
      drugs: [
        { name: 'Carboplatin', dose: 5,    unit: 'AUC',   schedule: 'D1, q21d × 6 cycles' },
        { name: 'Paclitaxel',  dose: 175,  unit: 'mg/m²', schedule: 'D1, q21d × 6 cycles' },
        { name: 'Bevacizumab', dose: 15,   unit: 'mg/kg', schedule: 'D1, q21d' }
      ]
    },
    {
      key: 'CarboPac-DD-Ovarian',
      name: 'Dose-dense Carboplatin + weekly Paclitaxel (JGOG-3016)',
      drugs: [
        { name: 'Carboplatin', dose: 6,  unit: 'AUC',   schedule: 'D1, q21d × 6 cycles' },
        { name: 'Paclitaxel',  dose: 80, unit: 'mg/m²', schedule: 'D1, D8, D15, q21d × 6 cycles' }
      ]
    },
    {
      key: 'Carbo-Single-Ovarian',
      name: 'Carboplatin (single agent)',
      drugs: [
        { name: 'Carboplatin', dose: 5, unit: 'AUC', schedule: 'D1, q21d × 6 cycles' }
      ]
    }
  ],

  biliary: [
    {
      key: 'GemCis',
      name: 'Gemcitabine + Cisplatin',
      drugs: [
        { name: 'Gemcitabine', dose: 1000, unit: 'mg/m²', schedule: 'D1, D8, q21d × 8 cycles' },
        { name: 'Cisplatin',   dose: 25,   unit: 'mg/m²', schedule: 'D1, D8, q21d × 8 cycles' }
      ]
    },
    {
      key: 'Durva-GemCis',
      name: 'Durvalumab + Gemcitabine + Cisplatin (TOPAZ-1)',
      drugs: [
        { name: 'Durvalumab',  dose: 1500, unit: 'mg',    schedule: 'D1, q21d × 8 cycles, then 1500 mg q28d maintenance' },
        { name: 'Gemcitabine', dose: 1000, unit: 'mg/m²', schedule: 'D1, D8, q21d × 8 cycles' },
        { name: 'Cisplatin',   dose: 25,   unit: 'mg/m²', schedule: 'D1, D8, q21d × 8 cycles' }
      ]
    },
    {
      key: 'Pembro-GemCis',
      name: 'Pembrolizumab + Gemcitabine + Cisplatin (KEYNOTE-966)',
      drugs: [
        { name: 'Pembrolizumab', dose: 200,  unit: 'mg',    schedule: 'D1, q21d up to 35 cycles' },
        { name: 'Gemcitabine',   dose: 1000, unit: 'mg/m²', schedule: 'D1, D8, q21d × 8 cycles' },
        { name: 'Cisplatin',     dose: 25,   unit: 'mg/m²', schedule: 'D1, D8, q21d × 8 cycles' }
      ]
    },
    {
      key: 'FOLFOX-Biliary',
      name: 'mFOLFOX (2nd line — ABC-06)',
      drugs: [
        { name: 'Oxaliplatin',     dose: 85,   unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: 'Leucovorin',      dose: 175,  unit: 'mg/m²', schedule: 'D1, q14d' },
        { name: '5-Fluorouracil',  dose: 400,  unit: 'mg/m²', schedule: 'Bolus D1, q14d' },
        { name: '5-Fluorouracil',  dose: 2400, unit: 'mg/m²', schedule: 'CI 46h D1–D2, q14d' }
      ]
    },
    {
      key: 'Cape-Biliary',
      name: 'Capecitabine (adjuvant — BILCAP)',
      drugs: [
        { name: 'Capecitabine', dose: 1250, unit: 'mg/m²', schedule: 'PO BD D1–D14, q21d × 8 cycles' }
      ]
    }
  ],

  hcc: [
    {
      key: 'Atezo-Bev-HCC',
      name: 'Atezolizumab + Bevacizumab (IMbrave150)',
      drugs: [
        { name: 'Atezolizumab', dose: 1200, unit: 'mg',    schedule: 'D1, q21d' },
        { name: 'Bevacizumab',  dose: 15,   unit: 'mg/kg', schedule: 'D1, q21d' }
      ]
    },
    {
      key: 'Durva-Treme-HCC',
      name: 'Durvalumab + Tremelimumab (HIMALAYA — STRIDE)',
      drugs: [
        { name: 'Tremelimumab', dose: 300,  unit: 'mg', schedule: 'D1 single priming dose' },
        { name: 'Durvalumab',   dose: 1500, unit: 'mg', schedule: 'D1, q28d (starting day 1, after Tremelimumab)' }
      ]
    }
  ]

};

// Cancer type display labels
window.CANCER_TYPES = [
  { key: 'breast',          label: 'Breast Cancer' },
  { key: 'colon',           label: 'Colon Cancer' },
  { key: 'rectal',          label: 'Rectal Cancer' },
  { key: 'metastatic_crc',  label: 'Metastatic Colorectal Cancer' },
  { key: 'gastric',         label: 'Gastric Cancer' },
  { key: 'esophageal',      label: 'Esophageal / GEJ Cancer' },
  { key: 'cervical',        label: 'Cervical Cancer' },
  { key: 'endometrial',     label: 'Endometrial Cancer' },
  { key: 'head_neck',       label: 'Head & Neck Cancer' },
  { key: 'lung',            label: 'Lung Cancer' },
  { key: 'lymphoma',        label: 'Lymphoma' },
  { key: 'pancreatic',      label: 'Pancreatic Cancer' },
  { key: 'ovarian',         label: 'Ovarian Cancer' },
  { key: 'biliary',         label: 'Biliary Tract Cancer' },
  { key: 'hcc',             label: 'Hepatocellular Cancer (HCC)' }
];
