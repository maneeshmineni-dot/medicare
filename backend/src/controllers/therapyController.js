const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getNextGeminiKey } = require('../services/geminiKeyManager');

class TherapyController {
  /**
   * POST /api/therapy/prompt
   * Generates empathetic therapy responses & calming guided scripts
   */
  static async generateTherapyResponse(req, res) {
    try {
      const {
        message,
        mode = 'calm',
        language = 'en',
        patientName = 'Friend'
      } = req.body || {};

      const modePrompts = {
        calm: 'Speak with deep warmth, calm reassurance, and gentle pacing to relieve anxiety and agitation.',
        morning: 'Provide an uplifting, positive, and gentle greeting to start the day with clarity and peace.',
        night: 'Provide a very soft, soothing, and relaxing sleep-induction meditation to help the patient rest.',
        reminiscence: 'Encourage happy nostalgic memories of family, childhood stories, and fond life moments.'
      };

      const systemInstruction = `You are "Smriti Sathi" (Compassionate Clinical & Memory Companion).
The patient's name is "${patientName}".
Therapy Focus Mode: ${mode} (${modePrompts[mode] || modePrompts.calm}).
Language Requested: "${language}". Always respond in the requested language (e.g. if Telugu, reply in warm Telugu script; if Hindi, reply in gentle Hindi; if English, warm English).
Keep your message short (2-4 gentle sentences), empathetic, easy to comprehend for an elderly patient, and emotionally supportive.`;

      let aiResponseText = null;

      // Try Google Gemini
      const geminiKey = getNextGeminiKey();
      if (geminiKey) {
        try {
          const genAI = new GoogleGenerativeAI(geminiKey);
          const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });

          const prompt = `${systemInstruction}\n\nPatient/Caregiver message: "${message || 'I need peace and reassurance.'}"`;
          const result = await model.generateContent(prompt);
          aiResponseText = result.response.text();
        } catch (geminiErr) {
          console.warn('[TherapyController] Gemini notice:', geminiErr.message);
        }
      }

      // OpenAI Fallback
      if (!aiResponseText && process.env.OPENAI_API_KEY) {
        try {
          const OpenAI = require('openai');
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: message || 'I need peace and reassurance.' }
            ],
            temperature: 0.7
          });
          aiResponseText = completion.choices[0]?.message?.content;
        } catch (openAiErr) {
          console.warn('[TherapyController] OpenAI fallback notice:', openAiErr.message);
        }
      }

      // Deterministic Fallback if no keys configured
      if (!aiResponseText) {
        const fallbacks = {
          te: `నమస్కారం ${patientName} గారు, మీరు సురక్షితంగా ఉన్నారు. ప్రశాంతంగా ఊపిరి తీసుకోండి. నేను మీకు తోడుగా ఉన్నాను.`,
          hi: `नमस्ते ${patientName} जी, आप बिल्कुल सुरक्षित और अपनों के साथ हैं। गहरी सांस लें, सब ठीक है।`,
          ta: `வணக்கம் ${patientName}, நீங்கள் பாதுகாப்பாக இருக்கிறீர்கள். அமைதியாக இருங்கள், நாங்கள் உங்களுடன் இருக்கிறோம்.`,
          en: `Hello ${patientName}, you are safe and loved. Take a deep, gentle breath. Everything is going to be okay.`
        };
        aiResponseText = fallbacks[language] || fallbacks.en;
      }

      return res.status(200).json({
        success: true,
        mode,
        language,
        response: aiResponseText.trim()
      });
    } catch (error) {
      console.error('[TherapyController.generateTherapyResponse] Error:', error);
      return res.status(500).json({
        error: 'Failed to generate therapy guidance',
        details: error.message
      });
    }
  }
}

module.exports = TherapyController;
