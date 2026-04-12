const express = require('express');
const router = express.Router();
const { 
  createGroup, 
  joinGroup, 
  getMyGroups, 
  getGroupMessages 
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getMyGroups)
  .post(protect, createGroup);

router.post('/join', protect, joinGroup);
router.get('/:groupId/messages', protect, getGroupMessages);

module.exports = router;
