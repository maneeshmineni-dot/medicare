/**
 * Pharmacokinetics & CYP450 Metabolic Pathway Deterministic Engine
 * Provides mathematical modeling of Cytochrome P450 enzyme substrate/inhibitor/inducer interactions
 * and simulated 24-hour plasma concentration curves (Cmax, Tmax, t1/2 clearance).
 */

const CYP450_DATABASE = {
  // Antibiotics
  amoxicillin: {
    name: 'Amoxicillin',
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
  ciprofloxacin: {
    name: 'Ciprofloxacin',
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

  // Cardiovascular / Statins
  atorvastatin: {
    name: 'Atorvastatin',
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

  // Analgesics / NSAIDs / Antipyretics
  paracetamol: {
    name: 'Acetaminophen / Paracetamol',
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

  // Metabolic & Gastrointestinal
  metformin: {
    name: 'Metformin',
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
  omeprazole: {
    name: 'Omeprazole',
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
  }
};

class PharmacokineticsService {
  /**
   * Find pharmacokinetic record matching drug name or active ingredient
   */
  static findRecord(query) {
    if (!query || typeof query !== 'string') return null;
    const clean = query.toLowerCase();

    for (const [key, record] of Object.entries(CYP450_DATABASE)) {
      if (clean.includes(key) || key.includes(clean)) {
        return record;
      }
    }

    // Default pharmacokinetic synthesis for unlisted drugs
    return {
      name: query,
      cypSubstrates: ['CYP3A4 / Hepatic clearance'],
      cypInhibitors: [],
      cypInducers: [],
      elimination: 'Hepatic & Renal excretion',
      halfLifeHours: 3.5,
      tmaxHours: 2.0,
      cmaxUnits: 'µg/mL',
      cmaxTypical: 10.0,
      bioavailability: '70%',
      proteinBinding: '65%',
      clinicalAlert: 'Standard hepatic / renal monitoring recommended during co-prescribing.'
    };
  }

  /**
   * Generate 24-hour plasma concentration timeline data points for charting
   * @param {number} halfLifeHours 
   * @param {number} tmaxHours 
   * @param {number} cmax 
   */
  static generatePlasmaCurve(halfLifeHours = 3.5, tmaxHours = 2.0, cmax = 10.0) {
    const points = [];
    const ka = Math.log(2) / (tmaxHours * 0.45); // absorption rate constant
    const ke = Math.log(2) / halfLifeHours;     // elimination rate constant

    for (let t = 0; t <= 24; t += 0.5) {
      let conc = 0;
      if (t > 0) {
        // Bateman 1-compartment oral absorption model: C(t) = Cmax_factor * (e^(-ke*t) - e^(-ka*t))
        const raw = Math.exp(-ke * t) - Math.exp(-ka * t);
        conc = Math.max(0, (raw / (Math.exp(-ke * tmaxHours) - Math.exp(-ka * tmaxHours))) * cmax);
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
          const enzyme = inhibitor.split(' ')[0]; // e.g. 'CYP3A4'
          const matchingSubstrate = drugB.cypSubstrates.find(sub => sub.includes(enzyme));
          if (matchingSubstrate) {
            conflicts.push({
              inhibitorDrug: drugA.name,
              substrateDrug: drugB.name,
              enzyme,
              severity: inhibitor.toLowerCase().includes('strong') ? 'HIGH' : 'MODERATE',
              impact: `${drugA.name} inhibits ${enzyme}, blocking the metabolism of ${drugB.name}. This is predicted to elevate ${drugB.name} serum concentration.`,
              recommendation: `Monitor for heightened ${drugB.name} side effects or consider dose adjustment.`
            });
          }
        });
      }
    }

    return {
      analyzedDrugs: profiles.map(p => ({
        name: p.name,
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
