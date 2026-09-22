/**
 * Unified Multilingual Intelligence & Prompt Localization Engine
 * Supports all 8 platform languages: English, Hindi, Telugu, Tamil, Kannada, Bengali, Marathi, Spanish.
 */

const LANGUAGE_MAP = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    displayName: 'English',
    assistantInstruction: 'Respond in clear, compassionate, and medically-structured English. Use bullet points and bold highlights for critical points.',
    visionInstruction: 'Provide all clinical explanations, primary use, dosage instructions, warnings, and side effects in clear English.',
    reportInstruction: 'Provide all lab interpretations, detected conditions, and exercise/lifestyle recommendations in clear English.',
    prescriptionInstruction: 'Provide all digitized medication summaries, dosage frequencies, and safety warnings in clear English.',
    therapyPrompt: 'Speak with deep warmth, gentle reassurance, and compassionate pacing in English.'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    displayName: 'Hindi (हिंदी)',
    assistantInstruction: 'आप सभी उत्तर स्पष्ट, सहानुभूतिपूर्ण और चिकित्सकीय रूप से सटीक हिंदी (Hindi) में प्रदान करें। मुख्य बिंदुओं के लिए बुलेट पॉइंट्स और बोल्ड टेक्स्ट का उपयोग करें।',
    visionInstruction: 'आप सभी स्पष्टीकरणों, प्राथमिक उपयोग, खुराक, चेतावनियों और दुष्प्रभावों के मानों को स्पष्ट हिंदी (Hindi) में प्रदान करें। दवा का नाम पहचानने योग्य रखें।',
    reportInstruction: 'सभी लैब रिपोर्ट विश्लेषण, पहचानी गई स्थितियां, और व्यायाम/आहार संबंधी सलाह स्पष्ट हिंदी (Hindi) में प्रदान करें।',
    prescriptionInstruction: 'दवा के सभी उपयोग, खुराक निर्देश (जैसे 1-0-1), और सावधानियां हिंदी (Hindi) में प्रदान करें।',
    therapyPrompt: 'गहरी आत्मीयता, शांतिदायक स्वर और सहानुभूतिपूर्ण गति के साथ हिंदी में बात करें।'
  },
  te: {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    displayName: 'Telugu (తెలుగు)',
    assistantInstruction: 'మీరు అన్ని సమాధానాలను స్పష్టమైన, దయగల మరియు వైద్యపరంగా ఖచ్చితమైన తెలుగు (Telugu) లో అందించండి. ముఖ్యమైన అంశాలకు బుల్లెట్ పాయింట్లు మరియు బోల్డ్ టెక్స్ట్‌ని ఉపయోగించండి.',
    visionInstruction: 'మీరు అన్ని వివరణలు, ప్రాథమిక ఉపయోగాలు, మోతాదు, హెచ్చరికలు మరియు దుష్ప్రభావాల విలువలను స్పష్టమైన తెలుగు (Telugu) లో అందించండి. ఔషధం పేరు గుర్తించేలా ఉంచండి.',
    reportInstruction: 'అన్ని ల్యాబ్ పరీక్ష ఫలితాల వివరణలు, గుర్తించిన ఆరోగ్య పరిస్థితులు మరియు వ్యాయామ సూచనలను తెలుగు (Telugu) లో అందించండి.',
    prescriptionInstruction: 'వైద్యుల ప్రిస్క్రిప్షన్ సారాంశం, మోతాదు సమయాలు మరియు జాగ్రత్తలను స్పష్టమైన తెలుగు (Telugu) లో అందించండి.',
    therapyPrompt: 'అత్యంత ఆప్యాయతతో, ప్రశాంతమైన మరియు సాంత్వన కలిగించే శైలిలో తెలుగులో మాట్లాడండి.'
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    displayName: 'Tamil (தமிழ்)',
    assistantInstruction: 'அனைத்து மருத்துவ பதில்களையும் எளிய, தெளிவான மற்றும் துல்லியமான தமிழில் (Tamil) வழங்கவும். முக்கியமான தகவல்களுக்கு புல்லட் புள்ளிகள் மற்றும் தடித்த எழுத்துக்களைப் பயன்படுத்தவும்.',
    visionInstruction: 'மருந்தின் பயன்பாடுகள், உட்கொள்ளும் முறை, எச்சரிக்கைகள் மற்றும் பக்க விளைவுகளை எளிய தமிழில் (Tamil) வழங்கவும். மருந்தின் பெயரை எளிதில் அடையாளம் காணும் வகையில் வைத்திருக்கவும்.',
    reportInstruction: 'பரிசோதனை முடிவுகள், கண்டறியப்பட்ட நிலைமைகள் மற்றும் வாழ்க்கை முறை ஆலோசனைகளைத் தெளிவான தமிழில் (Tamil) வழங்கவும்.',
    prescriptionInstruction: 'மருத்துவ சீட்டு விவரங்கள், மருந்து உட்கொள்ளும் நேரங்கள் மற்றும் எச்சரிக்கைகளைத் தமிழில் (Tamil) வழங்கவும்.',
    therapyPrompt: 'ஆழ்ந்த அன்புடனும், அமைதியான மற்றும் ஆறுதலான குரலிலும் தமிழில் பேசவும்.'
  },
  kn: {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    displayName: 'Kannada (ಕನ್ನಡ)',
    assistantInstruction: 'ಎಲ್ಲಾ ವೈದ್ಯಕೀಯ ಉತ್ತರಗಳನ್ನು ಸ್ಪಷ್ಟ, ಸಹಾನುಭೂತಿಯ ಮತ್ತು ನಿಖರವಾದ ಕನ್ನಡದಲ್ಲಿ (Kannada) ಒದಗಿಸಿ. ಪ್ರಮುಖ ಅಂಶಗಳಿಗೆ ಬುಲೆಟ್ ಪಾಯಿಂಟ್‌ಗಳನ್ನು ಬಳಸಿ.',
    visionInstruction: 'ಔಷಧದ ಬಳಕೆಗಳು, ಪ್ರಮಾಣ ಸೂಚನೆಗಳು, ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಅಡ್ಡಪರಿಣಾಮಗಳನ್ನು ಸ್ಪಷ್ಟ ಕನ್ನಡದಲ್ಲಿ (Kannada) ಒದಗಿಸಿ. ಔಷಧದ ಹೆಸರನ್ನು ಗುರುತಿಸುವಂತೆ ಇರಿಸಿ.',
    reportInstruction: 'ಪ್ರಯೋಗಾಲಯ ವರದಿ ವಿಶ್ಲೇಷಣೆ, ಪತ್ತೆಯಾದ ಪರಿಸ್ಥಿತಿಗಳು ಮತ್ತು ವ್ಯಾಯಾಮ ಸಲಹೆಗಳನ್ನು ಕನ್ನಡದಲ್ಲಿ (Kannada) ನೀಡಿ.',
    prescriptionInstruction: 'ವೈದ್ಯರ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಸಾರಾಂಶ, ಡೋಸೇಜ್ ಸಮಯಗಳು ಮತ್ತು ಮುನ್ನೆಚ್ಚರಿಕೆಗಳನ್ನು ಕನ್ನಡದಲ್ಲಿ (Kannada) ನೀಡಿ.',
    therapyPrompt: 'ಆತ್ಮೀಯತೆ ಮತ್ತು ಶಾಂತಿಯುತ ಧ್ವನಿಯಲ್ಲಿ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ.'
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    displayName: 'Bengali (বাংলা)',
    assistantInstruction: 'সমস্ত চিকিৎসার উত্তর স্পষ্ট, সহানুভূতিশীল এবং নির্ভুল বাংলায় (Bengali) প্রদান করুন। গুরুত্বপূর্ণ তথ্যের জন্য বুলেট পয়েন্ট ব্যবহার করুন।',
    visionInstruction: 'ওষুধের ব্যবহার, ডোজ নির্দেশাবলী, সতর্কতা এবং পার্শ্বপ্রতিক্রিয়া বাংলায় (Bengali) প্রদান করুন। ওষুধের নাম চেনার মতো রাখুন।',
    reportInstruction: 'ল্যাব পরীক্ষার বিশ্লেষণ, স্বাস্থ্যগত অবস্থা এবং জীবনযাত্রার পরামর্শ বাংলায় (Bengali) প্রদান করুন।',
    prescriptionInstruction: 'প্রেসক্রিপশন সারাংশ, ওষুধ খাওয়ার সময় এবং সতর্কতা বাংলায় (Bengali) প্রদান করুন।',
    therapyPrompt: 'গভীর সহানুভূতি এবং শান্ত কণ্ঠে বাংলায় কথা বলুন।'
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    displayName: 'Marathi (मराठी)',
    assistantInstruction: 'सर्व वैद्यकीय उत्तरे स्पष्ट, सहानुभूतीपूर्वक आणि अचूक मराठीत (Marathi) द्या. महत्त्वाच्या मुद्द्यांसाठी बुलेट पॉईंट्स वापरा.',
    visionInstruction: 'औषधाचे उपयोग, डोस सूचना, धोके आणि दुष्परिणाम मराठीत (Marathi) प्रदान करा. औषधाचे नाव ओळखण्यायोग्य ठेवा.',
    reportInstruction: 'लॅब रिपोर्ट विश्लेषण, निदान आणि जीवनशैलीतील बदलांचे मार्गदर्शन मराठीत (Marathi) द्या.',
    prescriptionInstruction: 'डॉक्टरांच्या प्रिस्क्रिप्शनचा तपशील, डोस वेळ आणि घ्यावयाची काळजी मराठीत (Marathi) द्या.',
    therapyPrompt: 'अत्यंत आपुलकीने आणि शांत स्वरात मराठीत बोला.'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    displayName: 'Spanish (Español)',
    assistantInstruction: 'Responda en español claro, compasivo y médicamente estructurado. Utilice viñetas y texto en negrita para puntos críticos.',
    visionInstruction: 'Proporcione todos los usos clínicos, instrucciones de dosificación, advertencias y efectos secundarios en español claro. Mantenga el nombre del medicamento identificable.',
    reportInstruction: 'Proporcione la interpretación del informe de laboratorio, condiciones detectadas y recomendaciones de estilo de vida en español claro.',
    prescriptionInstruction: 'Proporcione el resumen de la receta médica, horarios de dosificación y precauciones en español claro.',
    therapyPrompt: 'Hable con profunda calidez, tranquilidad y un ritmo suave y reconfortante en español.'
  }
};

function normalizeLang(lang) {
  if (!lang || typeof lang !== 'string') return 'en';
  const clean = lang.toLowerCase().trim().slice(0, 2);
  return LANGUAGE_MAP[clean] ? clean : 'en';
}

function getLanguageConfig(lang) {
  const code = normalizeLang(lang);
  return LANGUAGE_MAP[code];
}

function getLanguageDisplayName(lang) {
  return getLanguageConfig(lang).displayName;
}

function getAssistantLangInstruction(lang) {
  return getLanguageConfig(lang).assistantInstruction;
}

function getVisionLangInstruction(lang) {
  return getLanguageConfig(lang).visionInstruction;
}

function getReportLangInstruction(lang) {
  return getLanguageConfig(lang).reportInstruction;
}

function getPrescriptionLangInstruction(lang) {
  return getLanguageConfig(lang).prescriptionInstruction;
}

function getTherapyFallback(lang, patientName = 'Friend') {
  const code = normalizeLang(lang);
  const fallbacks = {
    te: `నమస్కారం ${patientName} గారు, మీరు సురక్షితంగా ఉన్నారు. ప్రశాంతంగా ఊపిరి తీసుకోండి. నేను మీకు తోడుగా ఉన్నాను.`,
    hi: `नमस्ते ${patientName} जी, आप बिल्कुल सुरक्षित और अपनों के साथ हैं। गहरी सांस लें, सब ठीक है।`,
    ta: `வணக்கம் ${patientName}, நீங்கள் பாதுகாப்பாக இருக்கிறீர்கள். அமைதியாக இருங்கள், நாங்கள் உங்களுடன் இருக்கிறோம்.`,
    kn: `ನಮಸ್ಕಾರ ${patientName}, ನೀವು ಸುರಕ್ಷಿತವಾಗಿದ್ದೀರಿ. ಶಾಂತವಾಗಿ ಉಸಿರಾಡಿ, ನಾವು ನಿಮ್ಮೊಂದಿಗಿದ್ದೇವೆ.`,
    bn: `নমস্কার ${patientName}, আপনি সম্পূর্ণ নিরাপদে আছেন। শান্তভাবে শ্বাস নিন, সবকিছু ঠিক হয়ে যাবে।`,
    mr: `नमस्ते ${patientName} जी, तुम्ही पूर्णपणे सुरक्षित आहात. शांतपणे श्वास घ्या, आम्ही तुमच्या सोबत आहोत.`,
    es: `Hola ${patientName}, estás a salvo y en buenas manos. Respira profundo y con calma. Todo va a estar bien.`,
    en: `Hello ${patientName}, you are safe, supported, and in good care. Take a deep, gentle breath. Everything is going to be okay.`
  };
  return fallbacks[code] || fallbacks.en;
}

module.exports = {
  LANGUAGE_MAP,
  normalizeLang,
  getLanguageConfig,
  getLanguageDisplayName,
  getAssistantLangInstruction,
  getVisionLangInstruction,
  getReportLangInstruction,
  getPrescriptionLangInstruction,
  getTherapyFallback
};
