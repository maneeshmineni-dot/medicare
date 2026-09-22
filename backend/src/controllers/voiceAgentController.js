class VoiceAgentController {
  /**
   * POST /api/voice/process-command
   * Interprets spoken voice commands and maps to app navigation & intent
   */
  static async processVoiceCommand(req, res) {
    try {
      const { command = '', language = 'en' } = req.body || {};
      const cleanCommand = command.toLowerCase().trim();

      let targetRoute = null;
      let intent = 'unknown';
      let spokenFeedback = '';

      const lang = (language || 'en').toLowerCase().slice(0, 2);

      // Multi-language keyword dictionaries
      const isScanner = /scan|camera|photo|ఫోటో|స్కానర్|स्कैन|கேமரா|ஸ்கேன்|ಕ್ಯಾಮೆರಾ|ಸ್ಕ್ಯಾನ್|ক্যামেরা|कॅमेरा|c[aá]mara|escanear/i.test(cleanCommand);
      const isCabinet = /cabinet|medicine|routine|pill|మందులు|క్యాబినెట్|दवा|अलमारी|மருந்து|மருந்துகள்|ಔಷಧಿ|ಓಡಿಸು|ওষুধ|ঔষধ|औषध|botiqu[ií]n|medicina/i.test(cleanCommand);
      const isMemory = /memory|game|quiz|reminisc|జ్ఞాపకం|ఆట|खेल|याद|நினைவகம்|விளையாட்டு|ನೆನಪು|ಆಟ|স্মৃতি|খেলা|खेळ|memoria|juego/i.test(cleanCommand);
      const isTherapy = /therapy|calm|peace|sooth|శాంతి|ధ్యానం|थेरेपी|शांति|अமைதி|சிகிச்சை|ಶಾಂತಿ|ಚಿಕಿತ್ಸೆ|থেরাপি|शांतता|terapia|calma|paz/i.test(cleanCommand);
      const isCaregiver = /caregiver|family|telemetry|report|కుటుంబం|రిపోర్ట్|परिवार|रिपोर्ट|குடும்பம்|குடும்ப|পরিবার|कुटुंब|familia|cuidador/i.test(cleanCommand);
      const isAssistant = /assistant|chat|ask|bot|సహాయకుడు|सहायक|கேள்வி|ಸಹಾಯಕ|সহায়তাকারী|मदतनीस|asistente|ayuda/i.test(cleanCommand);
      const isHome = /home|dashboard|back|start|హోమ్|होम|முகப்பு|ಮುಖಪುಟ|হোম|घर|inicio|panel/i.test(cleanCommand);

      const feedbacks = {
        navigate_scanner: {
          en: 'Opening Medicine Scanner.',
          hi: 'दवा स्कैनर खोला जा रहा है।',
          te: 'మెడిసిన్ స్కానర్ తెరవబడుతోంది.',
          ta: 'மருந்து ஸ்கேனர் திறக்கப்படுகிறது.',
          kn: 'ಔಷಧ ಸ್ಕ್ಯಾನರ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          bn: 'ওষুধ স্ক্যানার খোলা হচ্ছে।',
          mr: 'औषध स्कॅनर उघडत आहे.',
          es: 'Abriendo el escáner de medicamentos.'
        },
        navigate_cabinet: {
          en: 'Opening your Medicine Cabinet.',
          hi: 'आपकी दवा अलमारी खोली जा रही है।',
          te: 'మీ మెడిసిన్ క్యాబినెట్ తెరవబడుతోంది.',
          ta: 'உங்கள் மருந்து பெட்டி திறக்கப்படுகிறது.',
          kn: 'ನಿಮ್ಮ ಔಷಧಿ ಕ್ಯಾಬಿನೆಟ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          bn: 'আপনার ওষুধ ক্যাবিনেট খোলা হচ্ছে।',
          mr: 'तुमची औषध कॅबिनेट उघडत आहे.',
          es: 'Abriendo su botiquín de medicamentos.'
        },
        navigate_memory: {
          en: 'Opening Memory Care and Games.',
          hi: 'स्मृति देखभाल और खेल खोले जा रहे हैं।',
          te: 'మెమరీ కేర్ మరియు ఆటలు తెరవబడుతున్నాయి.',
          ta: 'நினைவக பராமரிப்பு விளையாட்டுகள் திறக்கப்படுகின்றன.',
          kn: 'ಮೆಮೊರಿ ಕೇರ್ ಆಟಗಳು ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          bn: 'স্মৃতি যত্ন ও গেমস খোলা হচ্ছে।',
          mr: 'मेमरी केअर आणि खेळ उघडत आहेत.',
          es: 'Abriendo juegos y cuidado de memoria.'
        },
        navigate_therapy: {
          en: 'Opening Voice Therapy Room.',
          hi: 'स्वर थेरेपी कक्ष खोला जा रहा है।',
          te: 'వాయిస్ థెరపీ రూమ్ తెరవబడుతోంది.',
          ta: 'குரல் சிகிச்சை அறை திறக்கப்படுகிறது.',
          kn: 'ಧ್ವನಿ ಚಿಕಿತ್ಸೆ ಕೊಠಡಿ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          bn: 'ভয়েস থেরাপি রুম খোলা হচ্ছে।',
          mr: 'व्हॉईस थेरपी कक्ष उघडत आहे.',
          es: 'Abriendo la sala de terapia de voz.'
        },
        navigate_caregiver: {
          en: 'Opening Caregiver Dashboard.',
          hi: 'देखभालकर्ता डैशबोर्ड खोला जा रहा है।',
          te: 'కేర్‌గివర్ డాష్‌బోర్డ్ తెరవబడుతోంది.',
          ta: 'பராமரிப்பாளர் டாஷ்போர்டு திறக்கப்படுகிறது.',
          kn: 'ಆರೈಕೆದಾರರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          bn: 'কেয়ারগিভার ড্যাশবোর্ড খোলা হচ্ছে।',
          mr: 'केअरगिव्हर डॅशबोर्ड उघडत आहे.',
          es: 'Abriendo panel de cuidadores.'
        },
        navigate_assistant: {
          en: 'Opening AI Health Assistant.',
          hi: 'एआई स्वास्थ्य सहायक खोला जा रहा है।',
          te: 'ఏఐ ఆరోగ్య సహాయకుడు తెరవబడుతోంది.',
          ta: 'AI சுகாதார உதவியாளர் திறக்கப்படுகிறது.',
          kn: 'AI ಆರೋಗ್ಯ ಸಹಾಯಕ ತೆರೆಯಲಾಗುತ್ತಿದೆ.',
          bn: 'এআই স্বাস্থ্য সহকারী খোলা হচ্ছে।',
          mr: 'AI आरोग्य सहाय्यक उघडत आहे.',
          es: 'Abriendo el asistente de salud IA.'
        },
        navigate_dashboard: {
          en: 'Returning to Home Dashboard.',
          hi: 'होम डैशबोर्ड पर वापस जा रहे हैं।',
          te: 'హోమ్ డాష్‌బోర్డ్‌కి తిరిగి వెళ్తున్నాం.',
          ta: 'முகப்பு டாஷ்போர்டுக்கு திரும்புகிறது.',
          kn: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಲಾಗುತ್ತಿದೆ.',
          bn: 'হোম ড্যাশবোর্ডে ফিরে যাচ্ছি।',
          mr: 'मुख्य डॅशबोर्डवर परत जात आहे.',
          es: 'Regresando al panel principal.'
        }
      };

      if (isScanner) {
        targetRoute = '/scanner';
        intent = 'navigate_scanner';
      } else if (isCabinet) {
        targetRoute = '/cabinet';
        intent = 'navigate_cabinet';
      } else if (isMemory) {
        targetRoute = '/memory-assistance';
        intent = 'navigate_memory';
      } else if (isTherapy) {
        targetRoute = '/voice-therapy';
        intent = 'navigate_therapy';
      } else if (isCaregiver) {
        targetRoute = '/caregiver';
        intent = 'navigate_caregiver';
      } else if (isAssistant) {
        targetRoute = '/assistant';
        intent = 'navigate_assistant';
      } else if (isHome) {
        targetRoute = '/dashboard';
        intent = 'navigate_dashboard';
      }

      if (intent !== 'unknown' && feedbacks[intent]) {
        spokenFeedback = feedbacks[intent][lang] || feedbacks[intent].en;
      } else {
        spokenFeedback = `I heard: "${command}". Try saying "Open Scanner", "My Cabinet", or "Play Memory Game".`;
      }

      return res.status(200).json({
        success: true,
        command: cleanCommand,
        intent,
        action: intent,
        targetRoute,
        spokenFeedback
      });
    } catch (error) {
      console.error('[VoiceAgentController.processVoiceCommand] Error:', error);
      return res.status(500).json({
        error: 'Failed to process voice command',
        details: error.message
      });
    }
  }
}

module.exports = VoiceAgentController;
