const express = require('express');
const router = express.Router();
const { analyzeMedicine, chatWithMedicineAI, lookupNdc, analyzeCyp450 } = require('../controllers/visionController');
const { analyzeReport } = require('../controllers/reportController');
const { analyzePrescription, batchSaveMedicines } = require('../controllers/prescriptionController');
const { analyzeDualAudit } = require('../controllers/dualAuditController');
const { chatWithAssistant } = require('../controllers/assistantController');
const { verifyToken, optionalAuth } = require('../middleware/auth');

router.post('/analyze-medicine', optionalAuth, analyzeMedicine);
router.post('/analyze-report', optionalAuth, analyzeReport);
router.post('/analyze-prescription', optionalAuth, analyzePrescription);
router.post('/analyze-dual-audit', optionalAuth, analyzeDualAudit);
router.post('/history/batch', optionalAuth, batchSaveMedicines);
router.post('/vision/chat', optionalAuth, chatWithMedicineAI);
router.post('/chat', optionalAuth, chatWithMedicineAI);
router.post('/assistant/chat', optionalAuth, chatWithAssistant);
router.post('/chat/assistant', optionalAuth, chatWithAssistant);
router.get('/fda/lookup', lookupNdc);
router.get('/cyp450/analyze', analyzeCyp450);
router.post('/cyp450/analyze', analyzeCyp450);

module.exports = router;

