const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    message: {
      type: String,
      required: [true, 'Please add a message'],
    },
    type: {
      type: String,
      enum: ['announcement', 'notice', 'alert'],
      default: 'announcement',
    },
    targetAudience: {
      type: String,
      enum: ['all', 'students', 'faculty', 'alumni'],
      default: 'all',
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
