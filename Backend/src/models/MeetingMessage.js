const mongoose = require('mongoose');

const meetingMessageSchema = mongoose.Schema(
  {
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Meeting',
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
    },
  },
  {
    timestamps: true,
  }
);

meetingMessageSchema.index({ meeting: 1, createdAt: 1 });

module.exports = mongoose.model('MeetingMessage', meetingMessageSchema);
