const Notification = require('../models/Notification');

// @desc    Create a new notification (Admin only)
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = async (req, res) => {
  const { title, message, type, targetAudience } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required' });
  }

  const notification = await Notification.create({
    sender: req.user._id,
    title,
    message,
    type,
    targetAudience: targetAudience || 'all'
  });

  res.status(201).json(notification);
};

// @desc    Get notifications for the logged in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  const userRole = req.user.role;
  
  // Fetch notifications targeted at 'all' or the specific role of the user
  const notifications = await Notification.find({
    targetAudience: { $in: ['all', userRole === 'student' ? 'students' : userRole === 'faculty' ? 'faculty' : userRole === 'alumni' ? 'alumni' : 'all'] }
  }).sort({ createdAt: -1 }).populate('sender', 'name');

  res.json(notifications);
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (notification) {
    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }
    res.json({ message: 'Notification marked as read' });
  } else {
    res.status(404).json({ message: 'Notification not found' });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
};
