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

      if (cleanCommand.includes('scan') || cleanCommand.includes('camera') || cleanCommand.includes('photo') || cleanCommand.includes('ఫోటో') || cleanCommand.includes('स्कैन')) {
        targetRoute = '/scanner';
        intent = 'navigate_scanner';
        spokenFeedback = 'Opening Medicine Scanner.';
      } else if (cleanCommand.includes('cabinet') || cleanCommand.includes('medicine') || cleanCommand.includes('routine') || cleanCommand.includes('మందులు') || cleanCommand.includes('दवा')) {
        targetRoute = '/cabinet';
        intent = 'navigate_cabinet';
        spokenFeedback = 'Opening your Medicine Cabinet.';
      } else if (cleanCommand.includes('memory') || cleanCommand.includes('game') || cleanCommand.includes('quiz') || cleanCommand.includes('జ్ఞాపకం') || cleanCommand.includes('खेल')) {
        targetRoute = '/memory-assistance';
        intent = 'navigate_memory';
        spokenFeedback = 'Opening Memory Care and Games.';
      } else if (cleanCommand.includes('therapy') || cleanCommand.includes('calm') || cleanCommand.includes('peace') || cleanCommand.includes('శాంతి') || cleanCommand.includes('थेरेपी')) {
        targetRoute = '/voice-therapy';
        intent = 'navigate_therapy';
        spokenFeedback = 'Opening Voice Therapy Room.';
      } else if (cleanCommand.includes('caregiver') || cleanCommand.includes('family') || cleanCommand.includes('report') || cleanCommand.includes('రిపోర్ట్')) {
        targetRoute = '/caregiver';
        intent = 'navigate_caregiver';
        spokenFeedback = 'Opening Caregiver Dashboard.';
      } else if (cleanCommand.includes('home') || cleanCommand.includes('dashboard')) {
        targetRoute = '/dashboard';
        intent = 'navigate_dashboard';
        spokenFeedback = 'Returning to Home Dashboard.';
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
