# OPD Consultation Summary Generator — CLAUDE.md

Reference for understanding and maintaining this project.

---

## ⚠️ Workflow Rules

1. **Never push to GitHub unless the user explicitly says "push the changes."** Make all edits locally; do not run `git push` until instructed.
2. **No backend.** This is a single-folder, browser-only HTML/CSS/JS app. No build step, no framework, no npm install. Open `index.html` directly in a browser.
3. The user is a medical oncologist (KIMS MACS Onco Sciences), not a developer — explain UI changes simply and avoid jargon in conversation.

---

## What This App Is

A single-page **OPD Consultation Summary Generator** for KIMS MACS Onco Sciences. Used when a patient is not registered in the hospital system (no online registration / waived consult fee) — the doctor fills in the consultation details in a clean form and prints a professional letter for the patient on the existing pre-printed KIMS Hospitals letterhead.

Replaces handwritten letterhead notes with a typed, structured printout.

Includes an **optional integrated Chemotherapy Planner** that calculates BSA-, weight-, and AUC-based doses for common oncology regimens and prints a structured drug × dose × schedule table inside the same letter.

---

## File Structure

```
/Users/prathyusha/Desktop/summarygenerator/
├── index.html      # All form sections + hidden printable layout
├── styles.css      # Pastel screen theme + print stylesheet
├── app.js          # Event handlers, BSA/GFR/Calvert math, print rendering
├── regimens.js     # Curated chemotherapy regimen database (window.REGIMENS)
├── KIMS_Renova_logo.png # KIMS Renova Oncology Institute logo (cropped from Desktop/KIMS docs/IMG_7410.jpeg)
└── CLAUDE.md       # This file
```

No external dependencies. `regimens.js` is loaded before `app.js` in `index.html`.

---

## Tech Stack

- Vanilla HTML5 + CSS3 + JavaScript (ES6, IIFE-wrapped, no modules)
- No frameworks, no build step, no package manager
- Print output uses CSS `@media print` + `@page` rules — Save as PDF works via browser print dialog (Chrome / Safari)

---

## Form Sections (on-screen, in order)

| # | Section | Notes |
|---|---|---|
| 1 | Patient Details | Name, Age (text — accepts "54" or "54 years"), Sex, Date (auto = today), MRN (optional). Phone removed. |
| 2 | Chief Complaints | Free text |
| 3 | History of Present Illness | Free text — investigations are written here too (no separate Investigations section) |
| 4 | Past History / Comorbidities | Free text |
| 5 | Personal & Family History | Two-column textareas |
| 6 | Examination | Height (cm) → Weight (kg) → BSA (auto-Mosteller, read-only) → ECOG; plus General and Systemic/Local exam |
| 7 | Diagnosis | Free text — primary site, histology, stage, biomarkers |
| 8 | Treatment Plan / Advice | Free text |
| 9 | **Plan Chemotherapy** *(optional, behind a checkbox toggle)* | Cancer type → Regimen, plus optional custom drugs; carboplatin auto-shows creatinine field. No cycle number — this is an overall regimen plan handed to the patient |
| 10 | Other Notes | Free text |
| 11 | Rx — Prescription | Free text — italic Rx heading in print |
| 12 | Follow-up | Date + instructions |
| 13 | Consulting Doctor | Single dropdown listing all 4 consultants (see below) |

---

## Consulting Doctors (hard-coded dropdown)

| Key | Name | Qualifications | Role | KMC No |
|---|---|---|---|---|
| `suresh` | Dr Suresh Babu MC | MBBS, MD, DM | Director, Department of Medical Oncology | 60989 |
| `prathyusha` | Dr Prathyusha Eaga | MBBS, MD, DM | Attending Consultant, Medical Oncology | 158021 |
| `chetan` | Dr Chetan V | MBBS, MD, DNB, DM | Specialist, Medical Oncology | 118210 |
| `vivek` | Dr Vivek B Maleyur | MBBS, MD, DM | Specialist, Medical Oncology | 128134 |

Defined in `app.js` (`buildPrintSummary` → `consultants` lookup). Selecting a consultant only affects the **signature block** at the bottom of the right column. The full team list always appears in the left sidebar of the print.

---

## Print Layout

Designed to print on **the existing pre-printed KIMS Hospitals letterhead** (KIMS Hospitals logo top-left, address top-right pre-printed on paper).

```
┌──────────────────────────────────────────────────────────┐
│ [pre-printed KIMS Hospitals letterhead — top of page]    │  ← @page top margin
│                                                          │     reserves this space
├──[KIMS RENOVA LOGO 70mm × 30mm — top-left]───────────────┤
│ ═══════════════════════════════════════════════════════ │  ← top horizontal rule
│ TEAM MEDICAL    │  Name: ___        Age/Sex: ___        │
│ ONCOLOGY        │  Date: ___        MRN: ___            │
│                 │                                        │
│ Dr Suresh Babu  │  CHIEF COMPLAINTS                      │
│ Dr Prathyusha E │  HISTORY OF PRESENT ILLNESS            │
│ Dr Chetan V     │  PAST HISTORY                          │
│ Dr Vivek B M    │  PERSONAL & FAMILY HISTORY             │
│                 │  EXAMINATION                           │
│                 │  DIAGNOSIS                             │
│                 │  TREATMENT PLAN / ADVICE               │
│                 │  ┌─ CHEMOTHERAPY PLAN (optional) ─┐    │
│                 │  │ Drug | Dose | Calc | Schedule │    │
│                 │  └─────────────────────────────────┘    │
│                 │  OTHER NOTES                            │
│                 │  Rx                                     │
│                 │  FOLLOW-UP                              │
│                 │                                         │
│                 │  ───────────                            │
│                 │  Dr Name (signature block)              │
│                 │  Qualifications, Role, KMC, KIMS MACS   │
│ ═══════════════════════════════════════════════════════ │  ← bottom horizontal rule
└──────────────────────────────────────────────────────────┘
```

### Page geometry
- `@page size: A4`
- `@page margin: 5mm 8mm 14mm 8mm` — top margin reduced to 5mm so the Renova logo sits flush at top-left of the page (level with the pre-printed KIMS Hospitals logo on the letterhead).
- Logo is confined to a **70mm × 30mm** rectangle (`.print-logo-wrap`), matching the KIMS Hospitals letterhead logo dimensions. `object-fit: contain` preserves aspect ratio.
- Top + bottom horizontal rules frame the bordered grid. Vertical rule separates the team sidebar from the main content.

### Empty-section auto-hiding
`toggleSection(name, hasContent)` in `app.js` adds `display: none` to print sections whose corresponding form fields are empty — so the printed letter never has blank "Family History: —" lines.

---

## Print Workflow

1. User clicks **Print / Save as PDF** button (`#printBtn`)
2. `buildPrintSummary()` populates all `[data-field="..."]` spans and rebuilds the chemo table
3. `setPdfTitle()` sets `document.title` → `OPD_Summary_<PatientName>_<YYYY-MM-DD>` so Chrome's "Save as PDF" picks up that filename
4. `window.print()` opens browser print dialog
5. User chooses **Save as PDF** or a physical printer
6. After 1.5s, `restoreTitle()` resets the page title

**Tip for users:** in the Chrome print dialog, turn OFF "Headers and footers" so the URL/date doesn't print over the letterhead. Margins should be **Default**.

---

## Chemotherapy Planner

Behind a checkbox toggle (`#planChemoToggle`) — off by default. When on, reveals cancer/regimen dropdowns.

### Workflow
1. User toggles "Plan chemotherapy for this visit" on
2. Selects **Cancer Type** (16 types) → **Regimen** dropdown filters to that cancer's regimens
3. Optionally checks **Add custom drug** to add one or more manual drug rows, with or without a selected regimen
4. If regimen/custom drugs contain a Carboplatin (`unit: 'AUC'`) drug, the **Carboplatin AUC** block appears asking only for **serum creatinine** (age + sex + weight are pulled from the top of the form)
5. Live table renders: Drug | Standard dose | Calculated dose | Schedule
6. Optional cycle notes textarea
7. On print, table is rendered into `#printChemoTable` inside the bordered content area

### Auto-pulled patient data (no duplicate inputs)
| Used for | Source |
|---|---|
| Age | `#age` text input — regex extracts first number ("54 years" → 54) |
| Sex | `#sex` dropdown |
| Weight | `#weight` numeric input under Examination |
| Height | `#height` numeric input under Examination |
| BSA | Computed live from height + weight |
| Creatinine | `#chemoCreat` — **only carbo-specific input** |

If anything is missing for the GFR calc, the carb info box explicitly lists what's needed (e.g. *"Need: Sex (top of form), Creatinine"*).

### Medical formulas (in `app.js`)

```
BSA (m²)  = sqrt((height_cm × weight_kg) / 3600)         [Mosteller]
GFR       = ((140 - age) × weight_kg) / (72 × creat)     [Cockcroft-Gault]
GFR × 0.85 if female
GFR capped at 125 mL/min for Calvert
Carbo dose (mg) = AUC × (GFR + 25)                        [Calvert]
```

### Carboplatin AUC defaults (baked into `regimens.js`)
- 3-weekly carboplatin → **AUC 5** (`dose: 5, unit: 'AUC'`)
- Weekly carboplatin → **AUC 2**
- KEYNOTE-522 weekly carbo → **AUC 1.5** (only this regimen)

### Dose rounding tiers (`roundDose` in `app.js`)

| Calculated dose | Rounded to nearest |
|---|---|
| < 10 mg | 1 mg |
| 10 – 99 mg | 5 mg |
| 100 – 499 mg | 10 mg |
| 500 – 1999 mg | 50 mg |
| ≥ 2000 mg | 100 mg |

**Drugs that skip rounding entirely (precise calculated value, max 2 decimals)** — defined in `SKIP_ROUNDING_DRUGS` const. The tiered rounding above applies ONLY to cytotoxic chemotherapy. The following drug classes are kept exact:
- Checkpoint inhibitors: pembrolizumab, nivolumab, atezolizumab, durvalumab, cemiplimab, dostarlimab, tislelizumab, avelumab, ipilimumab, tremelimumab
- HER2 / EGFR / VEGF antibodies (biologics): trastuzumab, pertuzumab, rituximab, cetuximab, panitumumab, bevacizumab, ramucirumab, brentuximab, zolbetuximab
- ADCs: trastuzumab deruxtecan (T-DXd), trastuzumab emtansine (T-DM1)
- Bortezomib
- Hormonal & oral targeted: letrozole, anastrozole, exemestane, palbociclib, abemaciclib, ribociclib, fulvestrant

**Capecitabine is intentionally NOT in the skip list** — it's an oral cytotoxic chemo, so it follows the tiered rounding (typical 1000 mg/m² × 1.7 m² = 1700 mg → tier rounds to 1700 mg).

### Loading dose handling
Drugs with a `loadingDose` field (Trastuzumab, Pertuzumab, Cetuximab, etc.) render two values:
```
Loading: 600 mg
Maintenance: 450 mg
```
Cycle 1 uses the loading dose; subsequent cycles use maintenance.

---

## Regimen Database (`regimens.js`)

Schema:
```js
window.REGIMENS = {
  <cancerKey>: [
    {
      key: 'unique-id',
      name: 'Display name',
      drugs: [
        { name, dose, unit, schedule, loadingDose?, isOral? }
      ]
    },
    ...
  ]
};

window.CANCER_TYPES = [
  { key: 'breast', label: 'Breast Cancer' },
  ...
];
```

### Drug `unit` values

| Unit | Calculation | Example |
|---|---|---|
| `'mg/m²'` | `dose × BSA` | Doxorubicin 60 mg/m² |
| `'mg/kg'` | `dose × weight` | Trastuzumab 6 mg/kg |
| `'AUC'` | Calvert formula (needs GFR) | Carboplatin AUC 5 |
| `'mg'` | Flat dose, shown as-is | Pembrolizumab 200 mg |
| `'flat'` | Flat dose (oral/hormonal) | Letrozole 2.5 mg |

### Cancer types (16 total) and number of regimens

| Cancer | Regimens |
|---|---|
| breast | 22 (incl. KEYNOTE-522 split into Phase A and Phase B) |
| colon | 4 |
| rectal | 4 |
| metastatic_crc | 5 |
| gastric | 6 |
| esophageal | 4 |
| cervical | 6 (incl. KEYNOTE-826 PD-L1 CPS >=1 pembro-chemo-bev, KEYNOTE-A18 pembro-CRT) |
| endometrial | 4 |
| head_neck | 8 |
| lung | 13 (incl. KEYNOTE-189, KEYNOTE-407, Nivo+Carbo+Pem, Tisle+Carbo+Pem RATIONALE-304, PACIFIC Durva consolidation, AEGEAN, Osimertinib FLAURA, FLAURA2, Gefitinib IPASS, NEJ009, IMpower133, LS-SCLC) |
| lymphoma | 5 |
| pancreatic | 4 |
| ovarian | 4 |
| prostate | 10 |
| biliary | 5 (incl. Durva-GemCis TOPAZ-1, Pembro-GemCis KEYNOTE-966) |
| hcc | 2 |

### Adding a new regimen
1. Pick the cancer key in `regimens.js`
2. Append a new object to its array with a unique `key` and a sensible `name` (don't reuse OncoCalcRx's verbose names — keep them short)
3. List drugs with `name`, `dose`, `unit`, `schedule`. Add `loadingDose` for trastuzumab-class drugs. Add `isOral: true` for oral agents.
4. No app.js or index.html change needed — the dropdown is generated from the data

---

## CSS Theme

Defined in `:root` of `styles.css`:

| Variable | Value | Purpose |
|---|---|---|
| `--bg` | `#faf7f4` | Cream page background |
| `--surface` | `#ffffff` | Card background |
| `--surface-soft` | `#f4f1ee` | Form-field background |
| `--primary` | `#2c93c9` | KIMS blue — section headings, primary button |
| `--primary-soft` | `#e3f1f9` | Soft blue — header gradient, BSA tint |
| `--accent` | `#b07cc6` | macs purple — chemo card border, dose values |
| `--accent-soft` | `#f1e7f6` | Soft purple — header gradient, carb section |
| `--rose` / `--rose-soft` | `#e89aab` / `#fbeef1` | Header gradient end |
| `--text` / `--text-soft` | `#2f3437` / `#6b7378` | Text colours |
| `--border` | `#e7e2dd` | Card borders, dividers |
| `--radius` | `14px` | Card corner radius |

Print uses **Georgia / Times New Roman** serif and a desaturated black-on-white palette.

---

## Key Functions in `app.js`

| Function | Purpose |
|---|---|
| `calculateBSA()` | Mosteller formula, runs on Height/Weight input |
| `getPatientAgeFromTop()` | Regex-extracts a number from the Age text input |
| `getPatientSexFromTop()` | Reads `#sex` dropdown, normalises to `male`/`female` |
| `calculateGFR(age, wt, creat, sex)` | Cockcroft-Gault (× 0.85 if female) |
| `calvertDose(auc, gfr)` | AUC × (min(GFR, 125) + 25) |
| `roundDose(dose, drugName)` | Tiered rounding; skips for biologics/orals |
| `getSelectedRegimen()` | Looks up selected regimen object from `window.REGIMENS` |
| `regimenHasCarboplatin(reg)` | True if any drug has `unit === 'AUC'` |
| `onCancerChange()` | Rebuilds Regimen dropdown when Cancer changes |
| `onRegimenChange()` | Shows/hides carbo section, re-renders preview table |
| `renderChemoTable()` | Live on-screen drug × dose table |
| `formatStandardDose(drug)` | "60 mg/m²" / "AUC 5" / "6 mg/kg" / "200 mg" |
| `calculateDrugDose(drug, ctx)` | Per-drug calc dispatching on `unit`; handles loading doses |
| `buildPrintSummary()` | Master function for the print button — populates all `[data-field]` spans, builds chemo print, hides empty sections |
| `buildPrintChemoSection(reg)` | Populates `#printChemoTable` rows when chemo is being planned |
| `setPdfTitle()` / `restoreTitle()` | Pretty PDF filename then revert |

All wrapped in a single IIFE — no globals leak except what `regimens.js` defines.

---

## Common Pitfalls

- **BSA shows blank**: Height or Weight not entered, or one of them is 0. The auto-calc requires both > 0.
- **Carboplatin section asks for missing values**: Age (top), Sex (top), Weight (Examination), and Creatinine (carbo block) must all be present. The info box lists exactly what's missing.
- **"Loading" dose appearing on every cycle in the print**: That's expected — the printed letter is a one-shot summary. The doctor knows from cycle number whether to use the loading or maintenance dose. (We don't conditionally hide one based on cycle number — keeping both visible is intentional so the patient/pharmacy sees the full regimen plan.)
- **Print shows the URL or date in headers**: Tell the user to uncheck "Headers and footers" in the Chrome print dialog.
- **Logo overlaps the pre-printed KIMS Hospitals letterhead**: Increase `@page` top margin in `styles.css` (currently 5mm) until it clears. Tested at 5mm based on user's letterhead — adjust if their print stock changes.
- **Dropdown shows old regimens after edit**: The page caches scripts. Hard-refresh (Cmd+Shift+R) after editing `regimens.js`.
- **Rounding seems wrong for a biologic**: Add the drug's name fragment to `SKIP_ROUNDING_DRUGS` in `app.js`. Match is case-insensitive substring (e.g. `'pembrolizumab'` will match "Pembrolizumab", "Pembro" will not).

---

## Project History (key decisions)

1. **No Investigations section** — investigations are written inside HPI per user preference (single field, less clicking)
2. **Phone number removed** from Patient Details
3. **Examination order** — Height first, then Weight (matches user's clinical workflow)
4. **Logo placement evolved** — final form: 70mm × 30mm box at extreme top-left, leveled with pre-printed KIMS Hospitals logo
5. **Team sidebar** shows all 4 consultants with full credentials regardless of who saw the patient (user's preference for institutional letter style)
6. **Chemo planner is opt-in** (checkbox), not always shown — many OPD visits don't involve chemo planning
7. **Carboplatin AUC defaults are per-regimen, not user-selectable** (3w → AUC 5, weekly → AUC 2, KEYNOTE-522 → AUC 1.5) — user-confirmed defaults to reduce per-patient input
8. **Reuse top form fields for GFR calc** — age and sex are not asked twice; only creatinine is asked in the carbo block
9. **KEYNOTE-522 split into Phase A and Phase B** as separate selectable regimens (so doctor can print only the current phase's drugs)

---

## What This App Is Not

- Not an EMR — no patient master, no persistence, no longitudinal record. Each session starts blank.
- Not a chemotherapy administration record — no IV sequencing, no premedication tables, no oral chemo separate handling. For that workflow, use OncoCalcRx (separate project at `Desktop/oncocalcrx/`).
- Not a prescription verification system — the calculated doses are aids; the consultant verifies and signs.
- Not regulatory-compliant for medico-legal records — for handouts to patients only, not for hospital records.
