/**
 * Live Multilingual Speech & Text Translation Service
 */

export const liveTranslationService = {
  translate: async (text, from = 'auto', to = 'en') => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/translate/live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from, to })
      });
      if (res.ok) {
        const data = await res.json();
        return data.translatedText || text;
      }
      return text;
    } catch (e) {
      console.warn('[LiveTranslation] Translation fallback:', e.message);
      return text;
    }
  }
};
