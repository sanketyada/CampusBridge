const express = require('express');
const router = express.Router();
const { getAIResponse } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, getAIResponse);

module.exports = router;
