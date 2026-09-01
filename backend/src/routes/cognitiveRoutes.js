const express = require('express');
const router = express.Router();
const CognitiveController = require('../controllers/cognitiveController');
const TherapyController = require('../controllers/therapyController');
const VoiceAgentController = require('../controllers/voiceAgentController');
const TranslationController = require('../controllers/translationController');
const TTSController = require('../controllers/ttsController');
const { optionalAuth, verifyToken } = require('../middleware/auth');

// Cognitive Therapeutics & Caregiver Telemetry
router.post('/cognitive/sync', optionalAuth, CognitiveController.batchSync);
router.post('/cognitive/session', optionalAuth, CognitiveController.saveSession);
router.get('/cognitive/caregiver-analytics', optionalAuth, CognitiveController.getCaregiverAnalytics);

// Voice Therapy Room
router.post('/therapy/prompt', optionalAuth, TherapyController.generateTherapyResponse);

// Hands-free Voice Agent & Translation
router.post('/voice/process-command', optionalAuth, VoiceAgentController.processVoiceCommand);
router.post('/translate/live', optionalAuth, TranslationController.translateLive);
router.post('/tts/synthesize', optionalAuth, TTSController.synthesize);

module.exports = router;
