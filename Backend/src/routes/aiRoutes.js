const express = require('express');
const router = express.Router();
const { 
  getAIResponse,
  generateSummary,
  generateNotes,
  generateQuestionPaper,
  generateMindMap
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, getAIResponse);
router.post('/generate-summary', protect, generateSummary);
router.post('/generate-notes', protect, generateNotes);
router.post('/generate-questions', protect, generateQuestionPaper);
router.post('/generate-mindmap', protect, generateMindMap);

module.exports = router;
