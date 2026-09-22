const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// 1. Test DDA Engine logic
describe('🧠 Cognitive Dynamic Difficulty Adjustment (DDA) Engine', () => {
  function calculateNextTier(recentSessions = []) {
    if (!recentSessions || recentSessions.length < 2) {
      return 1;
    }
    const recent = recentSessions.slice(0, 3);
    const avgScore = recent.reduce((sum, s) => sum + (s.score || 0), 0) / recent.length;
    const avgHesitation = recent.reduce((sum, s) => sum + (s.hesitationScore || 0), 0) / recent.length;
    const currentTier = recent[0].difficultyTier || 1;

    // Progression condition
    if (avgScore >= 85 && avgHesitation < 1200 && currentTier < 4) {
      return currentTier + 1;
    }
    // Regression condition
    if (avgScore < 60 || avgHesitation > 2500) {
      return Math.max(1, currentTier - 1);
    }
    return currentTier;
  }

  test('Tier 1 Initialization with No History', () => {
    assert.strictEqual(calculateNextTier([]), 1);
  });

  test('Promotes Tier 1 -> Tier 2 on High Score & Quick Cadence', () => {
    const sessions = [
      { score: 95, hesitationScore: 800, difficultyTier: 1 },
      { score: 90, hesitationScore: 900, difficultyTier: 1 },
      { score: 92, hesitationScore: 850, difficultyTier: 1 }
    ];
    assert.strictEqual(calculateNextTier(sessions), 2);
  });

  test('Promotes Tier 3 -> Tier 4 on Master Level Mastery', () => {
    const sessions = [
      { score: 100, hesitationScore: 600, difficultyTier: 3 },
      { score: 95, hesitationScore: 700, difficultyTier: 3 }
    ];
    assert.strictEqual(calculateNextTier(sessions), 4);
  });

  test('Demotes Tier 3 -> Tier 2 on Low Score / High Hesitation Confusion', () => {
    const sessions = [
      { score: 40, hesitationScore: 3200, difficultyTier: 3 },
      { score: 50, hesitationScore: 2800, difficultyTier: 3 }
    ];
    assert.strictEqual(calculateNextTier(sessions), 2);
  });
});

// 2. Test Multi-Language Translation Dictionary Completeness
describe('🌐 Multi-Language Translation Dictionary Integrity', () => {
  // Read and parse translations object from LanguageContext.jsx
  const langContextPath = path.resolve(__dirname, '../../frontend/src/context/LanguageContext.jsx');
  const fileContent = fs.readFileSync(langContextPath, 'utf8');

  // Extract export const translations = { ... };
  const match = fileContent.match(/export const translations = (\{[\s\S]*?\n\};)/);
  assert.ok(match, 'Failed to extract translations object from LanguageContext.jsx');

  const parsedTranslations = Function(`"use strict"; return (${match[1].replace(/;$/, '')});`)();

  const requiredLanguages = ['en', 'hi', 'te', 'ta', 'kn', 'bn', 'mr', 'es'];
  const coreKeys = [
    'appName', 'home', 'scanner', 'reportsRx', 'cabinet', 'memoryCare',
    'caregiver', 'voiceTherapy', 'history', 'profile', 'logout',
    'goodMorning', 'goodAfternoon', 'goodEvening', 'totalScans', 'scanNewMedicine'
  ];

  test('All 8 Supported Languages are Defined', () => {
    requiredLanguages.forEach(lang => {
      assert.ok(parsedTranslations[lang], `Language '${lang}' missing in translations object`);
    });
  });

  test('All Core Translation Keys are Populated Across Every Language', () => {
    requiredLanguages.forEach(lang => {
      const dict = parsedTranslations[lang];
      coreKeys.forEach(key => {
        assert.ok(
          dict[key] && dict[key].trim().length > 0,
          `Key '${key}' missing or empty in language '${lang}'`
        );
      });
    });
  });
});

// 3. Test Clinical Pharmacology & Drug Categorization Engine
describe('💊 Clinical Pharmacology & Disease Categorization Engine', () => {
  const { classifyMedication } = require('../../frontend/src/utils/diseaseClassifier');

  const testMedications = [
    { name: 'Metformin 500mg', expectedCategory: 'diabetes' },
    { name: 'Glimepiride 2mg', expectedCategory: 'diabetes' },
    { name: 'Amlodipine 5mg', expectedCategory: 'hypertension' },
    { name: 'Telmisartan 40mg', expectedCategory: 'hypertension' },
    { name: 'Atorvastatin 20mg', expectedCategory: 'cholesterol' },
    { name: 'Rozucor 10mg', expectedCategory: 'cholesterol' },
    { name: 'Amoxicillin 500mg', expectedCategory: 'infection' },
    { name: 'Azithromycin 250mg', expectedCategory: 'infection' },
    { name: 'Paracetamol 650mg', expectedCategory: 'pain_fever' },
    { name: 'Combiflam Tab', expectedCategory: 'pain_fever' },
    { name: 'Pantoprazole 40mg', expectedCategory: 'gerd' },
    { name: 'Omeprazole 20mg', expectedCategory: 'gerd' },
    { name: 'Shelcal 500mg', expectedCategory: 'vitamins' },
    { name: 'Cetirizine 10mg', expectedCategory: 'respiratory' },
    { name: 'Montelukast 10mg', expectedCategory: 'respiratory' }
  ];

  test('Classifies Common Clinical Drugs into Correct Specialty Disease Shelves', () => {
    testMedications.forEach(med => {
      const result = classifyMedication({ medicationName: med.name, primaryUse: '', activeIngredients: [] });
      assert.strictEqual(
        result.id,
        med.expectedCategory,
        `Expected '${med.name}' to be classified as '${med.expectedCategory}', got '${result.id}'`
      );
    });
  });
});

// 4. Test Backend Multilingual Localization Engine
describe('🌐 Backend Multilingual AI Prompt Engine', () => {
  const {
    LANGUAGE_MAP,
    normalizeLang,
    getLanguageDisplayName,
    getAssistantLangInstruction,
    getVisionLangInstruction,
    getReportLangInstruction,
    getPrescriptionLangInstruction,
    getTherapyFallback
  } = require('../src/utils/languageUtils');

  const languages = ['en', 'hi', 'te', 'ta', 'kn', 'bn', 'mr', 'es'];

  test('All 8 Languages are present in LANGUAGE_MAP with rich prompt instructions', () => {
    languages.forEach(lang => {
      assert.ok(LANGUAGE_MAP[lang], `Missing ${lang} in LANGUAGE_MAP`);
      assert.ok(getLanguageDisplayName(lang).length > 0);
      assert.ok(getAssistantLangInstruction(lang).length > 0);
      assert.ok(getVisionLangInstruction(lang).length > 0);
      assert.ok(getReportLangInstruction(lang).length > 0);
      assert.ok(getPrescriptionLangInstruction(lang).length > 0);
      assert.ok(getTherapyFallback(lang, 'Aarav').includes('Aarav'));
    });
  });

  test('Gracefully normalizes unknown languages to English', () => {
    assert.strictEqual(normalizeLang('xyz'), 'en');
    assert.strictEqual(normalizeLang(null), 'en');
    assert.strictEqual(getLanguageDisplayName('unknown'), 'English');
  });
});

// 5. Test Pharmacokinetics & CYP450 Metabolic Pathway Engine
describe('🧬 Pharmacokinetics & CYP450 Metabolic Pathway Engine', () => {
  const PharmacokineticsService = require('../src/services/pharmacokineticsService');

  test('Finds curated pharmacokinetics records for core cardiovascular and antimicrobial agents', () => {
    const atorvastatin = PharmacokineticsService.findRecord('Atorvastatin 20mg');
    assert.ok(atorvastatin);
    assert.ok(atorvastatin.cypSubstrates.some(s => s.includes('CYP3A4')));

    const clarithromycin = PharmacokineticsService.findRecord('Clarithromycin');
    assert.ok(clarithromycin);
    assert.ok(clarithromycin.cypInhibitors.some(i => i.includes('CYP3A4')));
  });

  test('Infers pharmacologic class and CYP parameters for unlisted suffixes', () => {
    const unknownStatin = PharmacokineticsService.findRecord('Pitavastatin');
    assert.strictEqual(unknownStatin.class, 'HMG-CoA Reductase Inhibitor (Statin)');
    assert.ok(unknownStatin.cypSubstrates.some(s => s.includes('CYP3A4')));

    const unknownArb = PharmacokineticsService.findRecord('Candesartan');
    assert.strictEqual(unknownArb.class, 'Angiotensin II Receptor Blocker (ARB)');

    const unknownBetaBlocker = PharmacokineticsService.findRecord('Bisoprolol');
    assert.strictEqual(unknownBetaBlocker.class, 'Beta Adrenergic Blocker');
    assert.ok(unknownBetaBlocker.cypSubstrates.some(s => s.includes('CYP2D6')));
  });

  test('Detects CYP3A4 Statin-Macrolide drug-drug interaction conflict', () => {
    const analysis = PharmacokineticsService.analyzeInteractions(['Atorvastatin', 'Clarithromycin']);
    assert.strictEqual(analysis.hasMetabolicConflict, true);
    assert.ok(analysis.conflicts.length > 0);
    const strongConflict = analysis.conflicts.find(c => c.inhibitorDrug === 'Clarithromycin' && c.substrateDrug === 'Atorvastatin');
    assert.ok(strongConflict, 'Expected Clarithromycin -> Atorvastatin conflict');
    assert.strictEqual(strongConflict.enzyme, 'CYP3A4');
    assert.strictEqual(strongConflict.severity, 'HIGH');
  });

  test('Generates valid 24-hour Bateman oral plasma concentration curve', () => {
    const curve = PharmacokineticsService.generatePlasmaCurve(14.0, 2.0, 28.0);
    assert.strictEqual(curve.length, 49); // 0h to 24h at 0.5h steps = 49 points
    assert.strictEqual(curve[0].timeHour, 0);
    assert.strictEqual(curve[0].concentration, 0);
    assert.ok(curve[4].concentration > 0); // At 2h, concentration should peak near Cmax
  });
});


