const { generateWithFailover } = require('../services/geminiKeyManager');
let OpenAI;
try {
  OpenAI = require('openai');
} catch (e) {
  OpenAI = null;
}

const ScanHistory = require('../models/ScanHistory');
const PharmacokineticsService = require('../services/pharmacokineticsService');

const LANGUAGE_INSTRUCTIONS = {
  en: 'Respond in clear, compassionate, and medically-structured English. Use bullet points and bold highlights for critical points.',
  hi: 'आप सभी उत्तर स्पष्ट, सहानुभूतिपूर्ण और चिकित्सकीय रूप से सटीक हिंदी (Hindi) में प्रदान करें। मुख्य बिंदुओं के लिए बुलेट पॉइंट्स और बोल्ड टेक्स्ट का उपयोग करें।',
  te: 'మీరు అన్ని సమాధానాలను స్పష్టమైన, దయగల మరియు వైద్యపరంగా ఖచ్చితమైన తెలుగు (Telugu) లో అందించండి. ముఖ్యమైన అంశాలకు బుల్లెట్ పాయింట్లు మరియు బోల్డ్ టెక్స్ట్‌ని ఉపయోగించండి.'
};

/**
 * Assistant Controller - Handles multi-medication patient context aware AI chat
 */
async function chatWithAssistant(req, res, next) {
  try {
    const {
      message,
      conversationHistory = [],
      patientProfile = {},
      cabinetMedicines = [],
      targetLanguage = 'en'
    } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message string is required' });
    }

    // 1. Fetch user's registered cabinet medications if user is authenticated
    let userMeds = [];
    const userId = req.user ? req.user.id : null;

    if (userId && userId !== 'anonymous') {
      try {
        const historyRecords = await ScanHistory.findByUserId(userId);
        if (Array.isArray(historyRecords)) {
          userMeds = historyRecords.map(item => {
            let parsed = null;
            if (item.rawAnalysis) {
              try {
                parsed = typeof item.rawAnalysis === 'string' ? JSON.parse(item.rawAnalysis) : item.rawAnalysis;
              } catch (e) {}
            }
            return {
              name: item.medicationName,
              primaryUse: item.primaryUse || parsed?.primaryUse || '',
              dosageInstructions: item.dosageInstructions || parsed?.dosageInstructions || '',
              activeIngredients: item.activeIngredients || parsed?.activeIngredients || [],
              warnings: item.warnings || parsed?.warnings || [],
              timing: parsed?.timing || parsed?.schedule || '',
              scannedAt: item.createdAt
            };
          });
        }
      } catch (err) {
        console.warn('[Assistant] Failed to fetch server scan history:', err.message);
      }
    }

    // Merge with client-provided cabinet medicines if server history was empty or user is anonymous
    if (userMeds.length === 0 && Array.isArray(cabinetMedicines) && cabinetMedicines.length > 0) {
      userMeds = cabinetMedicines.map(m => ({
        name: m.medicationName || m.name || 'Medication',
        primaryUse: m.primaryUse || '',
        dosageInstructions: m.dosageInstructions || '',
        activeIngredients: m.activeIngredients || [],
        warnings: m.warnings || [],
        timing: m.timing || ''
      }));
    }

    // 2. Extract Patient Profile (Allergies, Chronic Conditions, Name)
    const patientName = patientProfile.name || req.user?.name || 'Patient';
    const allergies = Array.isArray(patientProfile.allergies) ? patientProfile.allergies : [];
    const conditions = Array.isArray(patientProfile.conditions) ? patientProfile.conditions : [];

    // 3. Build Active Medications Context String
    let medicinesContextStr = 'No active medications currently recorded in patient cabinet.';
    if (userMeds.length > 0) {
      medicinesContextStr = userMeds.map((med, idx) => {
        const ingredients = Array.isArray(med.activeIngredients) && med.activeIngredients.length > 0
          ? med.activeIngredients.join(', ')
          : 'Not specified';
        const warnings = Array.isArray(med.warnings) && med.warnings.length > 0
          ? med.warnings.slice(0, 3).join('; ')
          : 'None noted';
        return `[Medication #${idx + 1}]
- Name: ${med.name}
- Active Ingredients: ${ingredients}
- Primary Indication/Use: ${med.primaryUse || 'General treatment'}
- Dosage/Instructions: ${med.dosageInstructions || 'As prescribed'}
- Key Warnings: ${warnings}`;
      }).join('\n\n');
    }

    // 4. Construct System Instruction with Pharmacological Intelligence
    const langInstruction = LANGUAGE_INSTRUCTIONS[targetLanguage] || LANGUAGE_INSTRUCTIONS['en'];

    const systemPrompt = `You are "PharmaVision AI Health Companion", a dedicated, compassionate, and highly intelligent clinical pharmacology assistant for patient "${patientName}".

YOUR ROLE:
You act as a personal clinical pharmacist and medication safety assistant. You have access to the patient's entire medicine cabinet, active health profile, known allergies, and chronic health conditions.

PATIENT'S MEDICAL PROFILE:
- Patient Name: ${patientName}
- Known Allergies & Drug Sensitivities: ${allergies.length > 0 ? allergies.join(', ') : 'None registered (always check for general allergies)'}
- Chronic Health Conditions: ${conditions.length > 0 ? conditions.join(', ') : 'None registered'}
- Active Cabinet Medications (${userMeds.length} items):
${medicinesContextStr}

CLINICAL SAFETY & ASSISTANCE GUIDELINES:
1. CROSS-DRUG INTERACTIONS: Always cross-reference the patient's entire cabinet when they ask about taking a new drug, OTC product, supplement, or herbal remedy. Warn immediately if there are dangerous interactions (e.g. NSAIDs with blood thinners/ACE inhibitors, additive sedation, QT prolongation, CYP3A4/CYP2D6 enzyme inhibition).
2. ALLERGEN RADAR: If the patient asks about taking ANY medicine that contains or cross-reacts with their known allergies (${allergies.join(', ') || 'N/A'}), immediately issue a high-visibility WARNING alert (🚨).
3. CHRONIC CONDITION CONTRAINDICATIONS: Highlight if any requested drug or food conflicts with their recorded conditions (${conditions.join(', ') || 'N/A'}) (e.g. NSAIDs in CKD/ulcers, beta-blockers in severe asthma).
4. SCHEDULE & FOOD RULES: When asked about routines or missed doses, provide clear, step-by-step guidance on meal timing (with food vs. empty stomach), avoiding duplicate doses, and morning/afternoon/night routines.
5. TONE & FORMAT:
   - Be empathetic, crystal-clear, structured, and easy for patients and elderly caregivers to understand.
   - Use emojis (💊, ⚠️, ⏰, 🥗, 💡, 🚨) to structure sections for fast scannability.
   - Use Markdown bolding and bullet lists.
   - Keep answers comprehensive yet focused (no unnecessary medical jargon without explaining it in simple terms).
6. DISCLAIMER & EMERGENCY: For severe symptoms (chest pain, severe shortness of breath, anaphylaxis, overdose), immediately direct the patient to call emergency services (e.g. 911 / 112 / local ER). Remind them that PharmaVision AI is an assistive digital pharmacology tool and to confirm changes with their prescribing physician.

LANGUAGE REQUIREMENT:
${langInstruction}
You MUST answer in ${targetLanguage === 'hi' ? 'Hindi (हिंदी)' : targetLanguage === 'te' ? 'Telugu (తెలుగు)' : 'English'}.`;

    // 5. Format Conversation History
    const formattedHistory = [];
    if (Array.isArray(conversationHistory)) {
      conversationHistory.slice(-8).forEach(msg => {
        if (msg && msg.content) {
          formattedHistory.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        }
      });
    }

    const conversationContext = formattedHistory.map(m => `${m.role === 'user' ? 'Patient' : 'PharmaVision AI'}: ${m.content}`).join('\n\n');
    const finalPrompt = `${systemPrompt}

RECENT CONVERSATION HISTORY:
${conversationContext || 'No previous messages in this session.'}

CURRENT PATIENT QUESTION:
"${message}"

PharmaVision AI Response:`;

    const openaiApiKey = process.env.OPENAI_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;
    let aiResponse = '';

    // 1. Try OpenAI Chat API (gpt-4o-mini or gpt-4o)
    if (OpenAI && openaiApiKey && openaiApiKey.trim() !== '' && openaiApiKey !== 'your_openai_api_key_here') {
      try {
        const openaiClient = new OpenAI({ apiKey: openaiApiKey.trim() });
        const messages = [
          { role: 'system', content: systemPrompt },
          ...formattedHistory.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ];

        const completion = await openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 800,
          temperature: 0.3
        });
        aiResponse = completion.choices[0]?.message?.content || '';
      } catch (openaiErr) {
        console.warn('[Assistant OpenAI Warning]:', openaiErr.message);
      }
    }

    // 2. Try Gemini with Multi-Key Pooling & Multi-Model Failover
    if (!aiResponse && geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here') {
      try {
        const response = await generateWithFailover({
          prompt: finalPrompt,
          generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.3
          }
        });
        aiResponse = response.rawText || (typeof response.data === 'string' ? response.data : JSON.stringify(response.data));
      } catch (geminiErr) {
        console.warn('[Assistant Gemini Failover Warning]:', geminiErr.message);
      }
    }

    // 3. Fallback Smart Response if APIs are offline or unconfigured
    if (!aiResponse) {
      await new Promise(r => setTimeout(r, 400));
      const medListSummary = userMeds.map(m => m.name).join(', ') || 'your prescribed medicines';
      
      if (targetLanguage === 'hi') {
        aiResponse = `नमस्ते ${patientName}! आपके कैबिनेट में वर्तमान में ${userMeds.length} दवाएं दर्ज हैं (${medListSummary})।\n\n- **सुरक्षा सलाह**: कृपया किसी भी नई दवा को लेने से पहले अपने डॉक्टर से परामर्श लें।\n- **एलर्जी सुरक्षा**: ${allergies.length > 0 ? allergies.join(', ') : 'कोई ज्ञात एलर्जी दर्ज नहीं'}।\n\nआपकी सहायता के लिए मैं हमेशा यहाँ हूँ। कृपया अपना प्रश्न पूछें।`;
      } else if (targetLanguage === 'te') {
        aiResponse = `నమస్కారం ${patientName}! మీ మెడిసిన్ క్యాబినెట్‌లో ప్రస్తుతం ${userMeds.length} మందులు ఉన్నాయి (${medListSummary}).\n\n- **భద్రతా సలహా**: ఏదైనా కొత్త మందు తీసుకునే ముందు మీ వైద్యుడిని సంప్రదించండి.\n- **అలెర్జీ రక్షణ**: ${allergies.length > 0 ? allergies.join(', ') : 'ఎటువంటి అలెర్జీలు నమోదు కాలేదు'}.\n\nమీ ప్రశ్నను అడగండి, నేను మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్నాను.`;
      } else {
        aiResponse = `Hello ${patientName}! I have reviewed your medical profile. You currently have **${userMeds.length} medication(s)** in your cabinet: **${medListSummary}**.\n\n` +
          `🛡️ **Allergens Monitored**: ${allergies.length > 0 ? allergies.join(', ') : 'None registered'}\n` +
          `🩺 **Conditions Tracked**: ${conditions.length > 0 ? conditions.join(', ') : 'None registered'}\n\n` +
          `💡 **Guidance**: Feel free to ask about cross-drug interactions, food/drink precautions, or meal timings for any of your medicines!`;
      }
    }

    return res.json({
      success: true,
      reply: aiResponse,
      patientContext: {
        activeMedsCount: userMeds.length,
        allergiesCount: allergies.length,
        conditionsCount: conditions.length
      }
    });

  } catch (error) {
    next(error);
  }
}

module.exports = {
  chatWithAssistant
};
