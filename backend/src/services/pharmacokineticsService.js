/**
 * Pharmacokinetics & CYP450 Metabolic Pathway Clinical Engine
 * Provides deterministic mathematical modeling of Cytochrome P450 enzyme substrate/inhibitor/inducer interactions,
 * class-based heuristic pharmacological inference, and simulated 24-hour plasma concentration curves (Cmax, Tmax, t1/2 clearance).
 */

const CYP450_DATABASE = {
  // ─── Antimicrobials & Antifungals ──────────────────────────────────────────
  amoxicillin: {
    name: 'Amoxicillin',
    class: 'Penicillin-class Antibiotic',
    cypSubstrates: [],
    cypInhibitors: [],
    cypInducers: [],
    elimination: 'Renal (60-70% unchanged in urine)',
    halfLifeHours: 1.2,
    tmaxHours: 1.5,
    cmaxUnits: 'µg/mL',
    cmaxTypical: 7.5,
    bioavailability: '75-90%',
    proteinBinding: '20%',
    clinicalAlert: 'Minimal CYP450 hepatic metabolism; dosage adjustments required in renal impairment.'
  },
  clavulanate: {
    name: 'Clavulanic Acid',
    class: 'Beta-lactamase Inhibitor',
    cypSubstrates: [],
    cypInhibitors: [],
    cypInducers: [],
    elimination: 'Renal & Hepatic',
    halfLifeHours: 1.0,
    tmaxHours: 1.2,
    cmaxUnits: 'µg/mL',
    cmaxTypical: 2.8,
    bioavailability: '60%',
    proteinBinding: '25%',
    clinicalAlert: 'May increase risk of cholestatic jaundice / hepatic stress when combined with hepatotoxic agents.'
  },
  clarithromycin: {
    name: 'Clarithromycin',
    class: 'Macrolide Antibiotic',
    cypSubstrates: ['CYP3A4'],
    cypInhibitors: ['CYP3A4 (Strong)'],
    cypInducers: [],
    elimination: 'Hepatic & Renal',
    halfLifeHours: 5.0,
    tmaxHours: 2.0,
    cmaxUnits: 'µg/mL',
    cmaxTypical: 2.5,
    bioavailability: '50%',
    proteinBinding: '70%',
    clinicalAlert: 'POTENT CYP3A4 INHIBITOR: Significantly increases plasma levels of statins, calcium channel blockers, and oral anticoagulants.'
  },
  azithromycin: {
    name: 'Azithromycin',
    class: 'Macrolide Antibiotic',
    cypSubstrates: [],
    cypInhibitors: [],
    cypInducers: [],
    elimination: 'Biliary / Fecal (primarily unchanged)',
    halfLifeHours: 68.0,
    tmaxHours: 2.5,
    cmaxUnits: 'µg/mL',
    cmaxTypical: 0.4,
    bioavailability: '37%',
    proteinBinding: '50%',
    clinicalAlert: 'Lacks significant CYP3A4 inhibition compared to clarithromycin/erythromycin; monitor QTc prolongation.'
  },
  ciprofloxacin: {
    name: 'Ciprofloxacin',
    class: 'Fluoroquinolone Antibiotic',
    cypSubstrates: ['CYP1A2'],
    cypInhibitors: ['CYP1A2 (Strong)', 'CYP3A4 (Moderate)'],
    cypInducers: [],
    elimination: 'Renal (40-50%) and Hepatic',
    halfLifeHours: 4.0,
    tmaxHours: 1.5,
    cmaxUnits: 'µg/mL',
    cmaxTypical: 2.4,
    bioavailability: '70%',
    proteinBinding: '30%',
    clinicalAlert: 'Strong CYP1A2 inhibitor: markedly increases theophylline and tizanidine serum toxicity.'
  },
  fluconazole: {
    name: 'Fluconazole',
    class: 'Triazole Antifungal',
    cypSubstrates: [],
    cypInhibitors: ['CYP2C9 (Strong)', 'CYP2C19 (Strong)', 'CYP3A4 (Moderate)'],
    cypInducers: [],
    elimination: 'Renal (80% unchanged)',
    halfLifeHours: 30.0,
    tmaxHours: 2.0,
    cmaxUnits: 'µg/mL',
    cmaxTypical: 6.5,
    bioavailability: '90%',
    proteinBinding: '12%',
    clinicalAlert: 'Potent CYP2C9 inhibitor: dramatically increases warfarin INR and sulfonylurea hypoglycemia risk.'
  },
  ketoconazole: {
    name: 'Ketoconazole',
    class: 'Imidazole Antifungal',
    cypSubstrates: ['CYP3A4'],
    cypInhibitors: ['CYP3A4 (Potent)', 'CYP2C9 (Moderate)'],
    cypInducers: [],
    elimination: 'Hepatic (Biliary)',
    halfLifeHours: 8.0,
    tmaxHours: 2.0,
    cmaxUnits: 'µg/mL',
    cmaxTypical: 3.5,
    bioavailability: '75%',
    proteinBinding: '99%',
    clinicalAlert: 'Prototypical potent CYP3A4 inhibitor: contraindicated with narrow therapeutic index CYP3A4 substrates.'
  },

  // ─── Cardiovascular & Statins ──────────────────────────────────────────────
  atorvastatin: {
    name: 'Atorvastatin',
    class: 'HMG-CoA Reductase Inhibitor (Statin)',
    cypSubstrates: ['CYP3A4 (Major)'],
    cypInhibitors: ['CYP3A4 (Weak)'],
    cypInducers: [],
    elimination: 'Hepatic / Biliary (>98%)',
    halfLifeHours: 14.0,
    tmaxHours: 2.0,
    cmaxUnits: 'ng/mL',
    cmaxTypical: 28.0,
    bioavailability: '14%',
    proteinBinding: '98%',
    clinicalAlert: 'Major CYP3A4 substrate: Co-administration with CYP3A4 inhibitors (macrolides, azoles) causes rhabdomyolysis and myopathy risk.'
  },
  rosuvastatin: {
    name: 'Rosuvastatin',
    class: 'HMG-CoA Reductase Inhibitor (Statin)',
    cypSubstrates: ['CYP2C9 (Minor)'],
    cypInhibitors: [],
    cypInducers: [],
    elimination: 'Biliary (90%) and Renal (10%)',
    halfLifeHours: 19.0,
    tmaxHours: 4.0,
    cmaxUnits: 'ng/mL',
    cmaxTypical: 15.0,
    bioavailability: '20%',
    proteinBinding: '88%',
    clinicalAlert: 'Minimal CYP metabolism (OATP1B1 transporter dependent); safer alternative with CYP3A4 inhibitors.'
  },
  amlodipine: {
    name: 'Amlodipine',
    class: 'Dihydropyridine Calcium Channel Blocker',
    cypSubstrates: ['CYP3A4 (Major)'],
    cypInhibitors: ['CYP3A4 (Weak)'],
    cypInducers: [],
    elimination: 'Hepatic (>90%)',
    halfLifeHours: 35.0,
    tmaxHours: 6.0,
    cmaxUnits: 'ng/mL',
    cmaxTypical: 6.0,
    bioavailability: '64%',
    proteinBinding: '95%',
    clinicalAlert: 'Long elimination half-life (35h); CYP3A4 inhibitors increase systemic hypotension risk.'
  },
  losartan: {
    name: 'Losartan',
    class: 'Angiotensin II Receptor Blocker (ARB)',
    cypSubstrates: ['CYP2C9 (Major)', 'CYP3A4'],
    cypInhibitors: [],
    cypInducers: [],
    elimination: 'Biliary (60%) and Renal (35%)',
    halfLifeHours: 2.0,
    tmaxHours: 1.0,
    cmaxUnits: 'ng/mL',
    cmaxTypical: 200.0,
    bioavailability: '33%',
    proteinBinding: '98.7%',
    clinicalAlert: 'CYP2C9 converts losartan to active EXP3174 metabolite; CYP2C9 inhibition alters antihypertensive efficacy.'
  },
  lisinopril: {
    name: 'Lisinopril',
    class: 'ACE Inhibitor',
    cypSubstrates: [],
    cypInhibitors: [],
    cypInducers: [],
    elimination: 'Renal (100% excreted unchanged)',
    halfLifeHours: 12.0,
    tmaxHours: 6.0,
    cmaxUnits: 'ng/mL',
    cmaxTypical: 40.0,
    bioavailability: '25%',
    proteinBinding: 'Negligible',
    clinicalAlert: 'Zero CYP450 metabolism; excreted purely through kidneys. Monitor serum potassium & creatinine.'
  },
  metoprolol: {
    name: 'Metoprolol',
    class: 'Beta-1 Selective Adrenergic Blocker',
    cypSubstrates: ['CYP2D6 (Major)'],
    cypInhibitors: [],
    cypInducers: [],
    elimination: 'Hepatic (>95%)',
    halfLifeHours: 3.5,
    tmaxHours: 1.5,
    cmaxUnits: 'ng/mL',
    cmaxTypical: 100.0,
    bioavailability: '50%',
    proteinBinding: '12%',
    clinicalAlert: 'CYP2D6 poor metabolizers or co-administration with CYP2D6 inhibitors (fluoxetine, paroxetine) causes pronounced bradycardia.'
  },

  // ─── Anticoagulants & Antiplatelets ────────────────────────────────────────
  warfarin: {
    name: 'Warfarin',
    class: 'Vitamin K Antagonist (Anticoagulant)',
    cypSubstrates: ['CYP2C9 (S-enantiomer, Major)', 'CYP1A2', 'CYP3A4'],
    cypInhibitors: [],
    cypInducers: [],
    elimination: 'Hepatic metabolism (92%)',
    halfLifeHours: 40.0,
    tmaxHours: 4.0,
    cmaxUnits: 'µg/mL',
    cmaxTypical: 1.5,
    bioavailability: '99%',
    proteinBinding: '99%',
    clinicalAlert: 'NARROW THERAPEUTIC INDEX: CYP2C9 inhibitors (fluconazole, amiodarone, metronidazole) severely elevate bleeding and INR.'
  },
  clopidogrel: {
    name: 'Clopidogrel',
    class: 'P2Y12 Platelet Inhibitor',
    cypSubstrates: ['CYP2C19 (Bioactivation, Major)', 'CYP3A4', 'CYP1A2'],
    cypInhibitors: [],
    cypInducers: [],
    elimination: 'Renal (50%) and Fecal (46%)',
    halfLifeHours: 6.0,
    tmaxHours: 1.0,
    cmaxUnits: 'ng/mL',
    cmaxTypical: 3.0,
    bioavailability: '50%',
    proteinBinding: '98%',
    clinicalAlert: 'PRODRUG: Requires CYP2C19 bioactivation. Co-administration with omeprazole reduces antiplatelet protection.'
  },
  apixaban: {
    name: 'Apixaban',
    class: 'Direct Factor Xa Inhibitor (DOAC)',
    cypSubstrates: ['CYP3A4 (Major)', 'P-gp'],
    cypInhibitors: [],
    cypInducers: [],
    elimination: 'Renal (27%) and Fecal/Biliary',
    halfLifeHours: 12.0,
    tmaxHours: 3.5,
    cmaxUnits: 'ng/mL',
    cmaxTypical: 150.0,
    bioavailability: '50%',
    proteinBinding: '87%',
    clinicalAlert: 'Dual CYP3A4 & P-gp substrate: Combined strong inhibitors (ketoconazole, ritonavir) require 50% dose reduction.'
  },

  // ─── Analgesics & Anti-inflammatory ────────────────────────────────────────
  paracetamol: {
    name: 'Acetaminophen / Paracetamol',
    class: 'Analgesic & Antipyretic',
    cypSubstrates: ['CYP2E1 (Major)', 'CYP1A2', 'CYP3A4'],
    cypInhibitors: [],
    cypInducers: [],
    elimination: 'Hepatic glucuronidation & sulfation (90%)',
    halfLifeHours: 2.5,
    tmaxHours: 1.0,
    cmaxUnits: 'µg/mL',
    cmaxTypical: 15.0,
    bioavailability: '88%',
    proteinBinding: '20%',
    clinicalAlert: 'CYP2E1 metabolizes minor fraction into toxic NAPQI; chronic alcohol or CYP2E1 inducers heighten hepatotoxicity.'
  },
  acetaminophen: {
    name: 'Acetaminophen / Paracetamol',
    class: 'Analgesic & Antipyretic',
    cypSubstrates: ['CYP2E1 (Major)', 'CYP1A2', 'CYP3A4'],
    cypInhibitors: [],
    cypInducers: [],
    elimination: 'Hepatic glucuronidation & sulfation (90%)',
    halfLifeHours: 2.5,
    tmaxHours: 1.0,
    cmaxUnits: 'µg/mL',
    cmaxTypical: 15.0,
    bioavailability: '88%',
    proteinBinding: '20%',
    clinicalAlert: 'CYP2E1 metabolizes minor fraction into toxic NAPQI; chronic alcohol or CYP2E1 inducers heighten hepatotoxicity.'
  },
  ibuprofen: {
    name: 'Ibuprofen',
    class: 'Nonsteroidal Anti-inflammatory Drug (NSAID)',
    cypSubstrates: ['CYP2C9 (Major)', 'CYP2C8'],
    cypInhibitors: ['CYP2C9 (Weak)'],
    cypInducers: [],
    elimination: 'Hepatic (Renal excretion of metabolites)',
    halfLifeHours: 2.0,
    tmaxHours: 1.5,
    cmaxUnits: 'µg/mL',
    cmaxTypical: 25.0,
    bioavailability: '90%',
    proteinBinding: '99%',
    clinicalAlert: 'CYP2C9 substrate: Competes with warfarin and sulfonylureas; causes renal prostaglandin inhibition.'
  },
  tramadol: {
    name: 'Tramadol',
    class: 'Opioid Analgesic',
    cypSubstrates: ['CYP2D6 (Bioactivation to M1)', 'CYP3A4'],
    cypInhibitors: [],
    cypInducers: [],
    elimination: 'Renal (90%) and Hepatic',
    halfLifeHours: 6.3,
    tmaxHours: 2.0,
    cmaxUnits: 'ng/mL',
    cmaxTypical: 300.0,
    bioavailability: '75%',
    proteinBinding: '20%',
    clinicalAlert: 'CYP2D6 poor metabolizers experience poor analgesia; CYP2D6 ultra-rapid metabolizers risk opioid respiratory toxicity.'
  },

  // ─── Metabolic & Gastrointestinal ──────────────────────────────────────────
  metformin: {
    name: 'Metformin',
    class: 'Biguanide Antidiabetic',
    cypSubstrates: [],
    cypInhibitors: [],
    cypInducers: [],
    elimination: 'Renal (90% excreted unchanged via OCT2)',
    halfLifeHours: 6.2,
    tmaxHours: 2.5,
    cmaxUnits: 'µg/mL',
    cmaxTypical: 2.0,
    bioavailability: '50-60%',
    proteinBinding: 'Negligible',
    clinicalAlert: 'No CYP450 metabolism (OCT2/MATE transporter dependent); contraindicated in severe renal impairment (eGFR < 30 mL/min).'
  },
  glimepiride: {
    name: 'Glimepiride',
    class: 'Sulfonylurea Antidiabetic',
    cypSubstrates: ['CYP2C9 (Major)'],
    cypInhibitors: [],
    cypInducers: [],
    elimination: 'Hepatic (Renal & Fecal metabolite excretion)',
    halfLifeHours: 5.0,
    tmaxHours: 2.5,
    cmaxUnits: 'ng/mL',
    cmaxTypical: 300.0,
    bioavailability: '100%',
    proteinBinding: '99.5%',
    clinicalAlert: 'CYP2C9 substrate: Co-administration with CYP2C9 inhibitors (fluconazole) induces severe prolonged hypoglycemia.'
  },
  omeprazole: {
    name: 'Omeprazole',
    class: 'Proton Pump Inhibitor (PPI)',
    cypSubstrates: ['CYP2C19 (Major)', 'CYP3A4'],
    cypInhibitors: ['CYP2C19 (Potent)'],
    cypInducers: ['CYP1A2'],
    elimination: 'Hepatic (80%)',
    halfLifeHours: 1.0,
    tmaxHours: 1.5,
    cmaxUnits: 'µg/mL',
    cmaxTypical: 1.2,
    bioavailability: '40-65%',
    proteinBinding: '95%',
    clinicalAlert: 'Potent CYP2C19 inhibitor: Blocks activation of Clopidogrel (Plavix), decreasing antiplatelet efficacy.'
  },
  pantoprazole: {
    name: 'Pantoprazole',
    class: 'Proton Pump Inhibitor (PPI)',
    cypSubstrates: ['CYP2C19', 'CYP3A4'],
    cypInhibitors: [],
    cypInducers: [],
    elimination: 'Hepatic',
    halfLifeHours: 1.5,
    tmaxHours: 2.5,
    cmaxUnits: 'µg/mL',
    cmaxTypical: 2.5,
    bioavailability: '77%',
    proteinBinding: '98%',
    clinicalAlert: 'Lower CYP2C19 affinity than omeprazole; preferred proton pump inhibitor when taking clopidogrel.'
  },

  // ─── Psychiatry & Neurology ────────────────────────────────────────────────
  fluoxetine: {
    name: 'Fluoxetine',
    class: 'Selective Serotonin Reuptake Inhibitor (SSRI)',
    cypSubstrates: ['CYP2D6', 'CYP2C9', 'CYP3A4'],
    cypInhibitors: ['CYP2D6 (Potent)', 'CYP2C19 (Moderate)'],
    cypInducers: [],
    elimination: 'Hepatic to active norfluoxetine',
    halfLifeHours: 48.0,
    tmaxHours: 6.0,
    cmaxUnits: 'ng/mL',
    cmaxTypical: 100.0,
    bioavailability: '80%',
    proteinBinding: '95%',
    clinicalAlert: 'POTENT CYP2D6 INHIBITOR with very long active half-life (norfluoxetine ~7-14 days). Elevates beta-blockers and tricyclics.'
  },
  escitalopram: {
    name: 'Escitalopram',
    class: 'Selective Serotonin Reuptake Inhibitor (SSRI)',
    cypSubstrates: ['CYP2C19 (Major)', 'CYP3A4', 'CYP2D6'],
    cypInhibitors: ['CYP2D6 (Weak)'],
    cypInducers: [],
    elimination: 'Hepatic & Renal',
    halfLifeHours: 30.0,
    tmaxHours: 4.0,
    cmaxUnits: 'ng/mL',
    cmaxTypical: 25.0,
    bioavailability: '80%',
    proteinBinding: '56%',
    clinicalAlert: 'CYP2C19 poor metabolizers or co-administration with omeprazole increases QTc prolongation risk (max 10mg/day recommended).'
  },
  carbamazepine: {
    name: 'Carbamazepine',
    class: 'Anticonvulsant & Mood Stabilizer',
    cypSubstrates: ['CYP3A4 (Major)'],
    cypInhibitors: [],
    cypInducers: ['CYP3A4 (Potent)', 'CYP1A2', 'CYP2C9', 'CYP2C19'],
    elimination: 'Hepatic to active 10,11-epoxide',
    halfLifeHours: 15.0,
    tmaxHours: 6.0,
    cmaxUnits: 'µg/mL',
    cmaxTypical: 8.0,
    bioavailability: '85%',
    proteinBinding: '75%',
    clinicalAlert: 'BROAD SPECTRUM CYP INDUCER & AUTO-INDUCER: Markedly lowers serum levels of oral contraceptives, statins, and warfarin.'
  }
};

class PharmacokineticsService {
  /**
   * Infer pharmacological profile from active ingredient structure / drug class suffixes
   * @param {string} drugName 
   */
  static inferClassProfile(drugName) {
    const clean = drugName.toLowerCase().trim();

    if (clean.endsWith('statin')) {
      return {
        name: drugName,
        class: 'HMG-CoA Reductase Inhibitor (Statin)',
        cypSubstrates: ['CYP3A4 (Major)', 'CYP2C9'],
        cypInhibitors: [],
        cypInducers: [],
        elimination: 'Hepatic / Biliary',
        halfLifeHours: 14.0,
        tmaxHours: 2.5,
        cmaxUnits: 'ng/mL',
        cmaxTypical: 20.0,
        bioavailability: '15-20%',
        proteinBinding: '95%',
        clinicalAlert: 'Statin class: monitor for myopathy and elevated transaminases when combined with potent CYP3A4 inhibitors.'
      };
    }

    if (clean.endsWith('prazole')) {
      return {
        name: drugName,
        class: 'Proton Pump Inhibitor (PPI)',
        cypSubstrates: ['CYP2C19 (Major)', 'CYP3A4'],
        cypInhibitors: ['CYP2C19 (Moderate)'],
        cypInducers: [],
        elimination: 'Hepatic metabolism',
        halfLifeHours: 1.5,
        tmaxHours: 2.0,
        cmaxUnits: 'µg/mL',
        cmaxTypical: 2.0,
        bioavailability: '65%',
        proteinBinding: '96%',
        clinicalAlert: 'PPI class: inhibits gastric acid; potential CYP2C19 competition with clopidogrel and altered pH-dependent drug absorption.'
      };
    }

    if (clean.endsWith('sartan')) {
      return {
        name: drugName,
        class: 'Angiotensin II Receptor Blocker (ARB)',
        cypSubstrates: ['CYP2C9', 'CYP3A4'],
        cypInhibitors: [],
        cypInducers: [],
        elimination: 'Biliary & Renal',
        halfLifeHours: 5.0,
        tmaxHours: 1.5,
        cmaxUnits: 'ng/mL',
        cmaxTypical: 180.0,
        bioavailability: '35%',
        proteinBinding: '98%',
        clinicalAlert: 'ARB class: monitor serum potassium and renal function. Avoid potassium-sparing combinations without monitoring.'
      };
    }

    if (clean.endsWith('pril')) {
      return {
        name: drugName,
        class: 'ACE Inhibitor',
        cypSubstrates: [],
        cypInhibitors: [],
        cypInducers: [],
        elimination: 'Renal clearance',
        halfLifeHours: 11.0,
        tmaxHours: 4.0,
        cmaxUnits: 'ng/mL',
        cmaxTypical: 50.0,
        bioavailability: '30%',
        proteinBinding: 'Low',
        clinicalAlert: 'ACE inhibitor class: minimal CYP450 metabolism. Renal clearance dependent; monitor for hyperkalemia and cough.'
      };
    }

    if (clean.endsWith('olol') || clean.endsWith('lol')) {
      return {
        name: drugName,
        class: 'Beta Adrenergic Blocker',
        cypSubstrates: ['CYP2D6 (Major)'],
        cypInhibitors: [],
        cypInducers: [],
        elimination: 'Hepatic (CYP2D6) or Renal',
        halfLifeHours: 4.5,
        tmaxHours: 2.0,
        cmaxUnits: 'ng/mL',
        cmaxTypical: 90.0,
        bioavailability: '50%',
        proteinBinding: '15-85%',
        clinicalAlert: 'Beta blocker class: CYP2D6 clearance dependent; monitor heart rate and blood pressure when initiating CYP2D6 modulators.'
      };
    }

    if (clean.endsWith('dipine')) {
      return {
        name: drugName,
        class: 'Dihydropyridine Calcium Channel Blocker',
        cypSubstrates: ['CYP3A4 (Major)'],
        cypInhibitors: [],
        cypInducers: [],
        elimination: 'Hepatic (CYP3A4)',
        halfLifeHours: 20.0,
        tmaxHours: 4.0,
        cmaxUnits: 'ng/mL',
        cmaxTypical: 8.0,
        bioavailability: '60%',
        proteinBinding: '95%',
        clinicalAlert: 'CCB class: significant first-pass CYP3A4 metabolism. Grapefruit juice and CYP3A4 inhibitors increase peripheral edema and hypotension.'
      };
    }

    if (clean.endsWith('conazole')) {
      return {
        name: drugName,
        class: 'Azole Antifungal',
        cypSubstrates: ['CYP3A4'],
        cypInhibitors: ['CYP3A4 (Strong)', 'CYP2C9 (Strong)'],
        cypInducers: [],
        elimination: 'Hepatic & Renal',
        halfLifeHours: 24.0,
        tmaxHours: 2.5,
        cmaxUnits: 'µg/mL',
        cmaxTypical: 4.0,
        bioavailability: '85%',
        proteinBinding: '90%',
        clinicalAlert: 'Azole antifungal class: POTENT CYP3A4 & CYP2C9 INHIBITOR. High risk of drug-drug interactions with warfarin, statins, and DOACs.'
      };
    }

    if (clean.endsWith('floxacin')) {
      return {
        name: drugName,
        class: 'Fluoroquinolone Antibiotic',
        cypSubstrates: ['CYP1A2'],
        cypInhibitors: ['CYP1A2 (Moderate-Strong)'],
        cypInducers: [],
        elimination: 'Renal & Hepatic',
        halfLifeHours: 5.0,
        tmaxHours: 1.5,
        cmaxUnits: 'µg/mL',
        cmaxTypical: 2.5,
        bioavailability: '75%',
        proteinBinding: '35%',
        clinicalAlert: 'Fluoroquinolone class: CYP1A2 inhibition and multivalent cation chelation (separate from antacids / iron by 2 hours).'
      };
    }

    if (clean.endsWith('cillin')) {
      return {
        name: drugName,
        class: 'Penicillin-class Antibiotic',
        cypSubstrates: [],
        cypInhibitors: [],
        cypInducers: [],
        elimination: 'Renal tubular secretion',
        halfLifeHours: 1.3,
        tmaxHours: 1.5,
        cmaxUnits: 'µg/mL',
        cmaxTypical: 6.0,
        bioavailability: '80%',
        proteinBinding: '20%',
        clinicalAlert: 'Beta-lactam class: excreted unchanged in urine; monitor for hypersensitivity reactions and adjust for renal clearance.'
      };
    }

    return null;
  }

  /**
   * Find pharmacokinetic record matching drug name or active ingredient
   * @param {string} query 
   */
  static findRecord(query) {
    if (!query || typeof query !== 'string') return null;
    const clean = query.toLowerCase().trim();

    // 1. Check curated pharmacokinetic database
    for (const [key, record] of Object.entries(CYP450_DATABASE)) {
      if (clean.includes(key) || key.includes(clean)) {
        return record;
      }
    }

    // 2. Perform intelligent pharmacologic class heuristic inference
    const inferred = PharmacokineticsService.inferClassProfile(query);
    if (inferred) {
      return inferred;
    }

    // 3. Fallback baseline pharmacokinetic profile
    return {
      name: query,
      class: 'General Pharmaceutical Agent',
      cypSubstrates: ['CYP3A4 / Hepatic clearance'],
      cypInhibitors: [],
      cypInducers: [],
      elimination: 'Hepatic & Renal clearance',
      halfLifeHours: 4.0,
      tmaxHours: 2.0,
      cmaxUnits: 'µg/mL',
      cmaxTypical: 8.0,
      bioavailability: '65%',
      proteinBinding: '60%',
      clinicalAlert: 'Standard hepatic & renal parameters apply. Review comprehensive clinical package insert for detailed interactions.'
    };
  }

  /**
   * Generate 24-hour plasma concentration timeline data points for charting
   * @param {number} halfLifeHours 
   * @param {number} tmaxHours 
   * @param {number} cmax 
   */
  static generatePlasmaCurve(halfLifeHours = 4.0, tmaxHours = 2.0, cmax = 8.0) {
    const points = [];
    const ka = Math.log(2) / (Math.max(0.2, tmaxHours) * 0.45); // absorption rate constant
    const ke = Math.log(2) / Math.max(0.5, halfLifeHours);     // elimination rate constant

    for (let t = 0; t <= 24; t += 0.5) {
      let conc = 0;
      if (t > 0) {
        // Bateman 1-compartment oral absorption model: C(t) = Cmax_factor * (e^(-ke*t) - e^(-ka*t))
        const raw = Math.exp(-ke * t) - Math.exp(-ka * t);
        const normFactor = Math.exp(-ke * tmaxHours) - Math.exp(-ka * tmaxHours);
        conc = normFactor !== 0 ? Math.max(0, (raw / normFactor) * cmax) : 0;
      }
      points.push({
        timeHour: t,
        concentration: parseFloat(conc.toFixed(2)),
        isTherapeutic: conc >= (cmax * 0.25)
      });
    }
    return points;
  }

  /**
   * Analyze drug-drug CYP450 interaction between multiple drugs
   * @param {Array<string>} drugList 
   */
  static analyzeInteractions(drugList = []) {
    const profiles = drugList.map(d => PharmacokineticsService.findRecord(d)).filter(Boolean);
    const conflicts = [];

    for (let i = 0; i < profiles.length; i++) {
      for (let j = 0; j < profiles.length; j++) {
        if (i === j) continue;
        const drugA = profiles[i];
        const drugB = profiles[j];

        // Check if Drug A inhibits an enzyme that Drug B relies on
        drugA.cypInhibitors.forEach(inhibitor => {
          const enzyme = inhibitor.split(' ')[0]; // e.g. 'CYP3A4', 'CYP2C9'
          const matchingSubstrate = drugB.cypSubstrates.find(sub => sub.includes(enzyme));
          if (matchingSubstrate) {
            conflicts.push({
              inhibitorDrug: drugA.name,
              substrateDrug: drugB.name,
              enzyme,
              severity: inhibitor.toLowerCase().includes('strong') || inhibitor.toLowerCase().includes('potent') ? 'HIGH' : 'MODERATE',
              impact: `${drugA.name} is a ${inhibitor} inhibitor, blocking the primary metabolic clearance pathway (${enzyme}) of ${drugB.name}. This is predicted to significantly elevate ${drugB.name} serum concentration.`,
              recommendation: `Monitor for heightened ${drugB.name} clinical effects/toxicity, or consider dosage titration / alternate therapy.`
            });
          }
        });

        // Check if Drug A induces an enzyme that Drug B relies on (reducing efficacy)
        drugA.cypInducers.forEach(inducer => {
          const enzyme = inducer.split(' ')[0];
          const matchingSubstrate = drugB.cypSubstrates.find(sub => sub.includes(enzyme));
          if (matchingSubstrate) {
            conflicts.push({
              inducerDrug: drugA.name,
              substrateDrug: drugB.name,
              enzyme,
              severity: 'HIGH',
              impact: `${drugA.name} induces ${enzyme}, accelerating the clearance of ${drugB.name} and reducing its therapeutic bioavailability.`,
              recommendation: `Monitor for loss of efficacy of ${drugB.name} or adjust dosing.`
            });
          }
        });
      }
    }

    return {
      analyzedDrugs: profiles.map(p => ({
        name: p.name,
        class: p.class || 'Pharmaceutical',
        cypSubstrates: p.cypSubstrates,
        cypInhibitors: p.cypInhibitors,
        cypInducers: p.cypInducers,
        halfLifeHours: p.halfLifeHours,
        elimination: p.elimination,
        clinicalAlert: p.clinicalAlert
      })),
      hasMetabolicConflict: conflicts.length > 0,
      conflicts
    };
  }
}

module.exports = PharmacokineticsService;
