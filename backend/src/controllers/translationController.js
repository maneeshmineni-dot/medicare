const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getNextGeminiKey } = require('../services/geminiKeyManager');

class TranslationController {
  /**
   * POST /api/translate/live
   * Real-time translation between patient and clinician
   */
  static async translateLive(req, res) {
    try {
      const { text, from = 'auto', to = 'en' } = req.body || {};
      if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Text parameter is required' });
      }

      let translatedText = text;

      const geminiKey = getNextGeminiKey();
      if (geminiKey) {
        try {
          const genAI = new GoogleGenerativeAI(geminiKey);
          const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
          const prompt = `Translate the following medical/clinical conversation text from language "${from}" to target language "${to}". Return ONLY the translation, with no explanation:\n\n"${text}"`;
          const result = await model.generateContent(prompt);
          translatedText = result.response.text().trim();
        } catch (e) {
          console.warn('[TranslationController] Gemini translate fallback:', e.message);
        }
      }

      return res.status(200).json({
        success: true,
        originalText: text,
        from,
        to,
        translatedText
      });
    } catch (error) {
      console.error('[TranslationController.translateLive] Error:', error);
      return res.status(500).json({ error: 'Translation failed', details: error.message });
    }
  }
}

module.exports = TranslationController;
