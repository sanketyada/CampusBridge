const express = require('express');
const router = express.Router();
const {
  createNotification,
  getNotifications,
  markAsRead,
} = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getNotifications)
  .post(protect, admin, createNotification);

router.put('/:id/read', protect, markAsRead);

module.exports = router;
