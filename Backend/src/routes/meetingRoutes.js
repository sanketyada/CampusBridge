const express = require('express');
const router = express.Router();
const { 
  createMeeting, 
  getOngoingMeetings, 
  joinMeeting, 
  endMeeting 
} = require('../controllers/meetingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createMeeting);

router.get('/ongoing', protect, getOngoingMeetings);
router.post('/:id/join', protect, joinMeeting);
router.put('/:id/end', protect, endMeeting);

module.exports = router;
