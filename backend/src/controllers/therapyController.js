const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getNextGeminiKey } = require('../services/geminiKeyManager');
const {
  getTherapyFallback,
  getLanguageDisplayName
} = require('../utils/languageUtils');

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

      const targetLangDisplay = getLanguageDisplayName(language);

      const systemInstruction = `You are "PharmaVision Companion" (Compassionate Clinical & Memory Companion).
The patient's name is "${patientName}".
Therapy Focus Mode: ${mode} (${modePrompts[mode] || modePrompts.calm}).
Language Requested: "${targetLangDisplay}". Always respond naturally in ${targetLangDisplay}.
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
        aiResponseText = getTherapyFallback(language, patientName);
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
