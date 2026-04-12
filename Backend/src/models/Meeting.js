const mongoose = require('mongoose');

const meetingSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a meeting title'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    meetingId: {
      type: String,
      required: true,
      unique: true,
    },
    videoLink: {
      type: String,
      required: [true, 'Please add a video call link (Google Meet, Zoom, etc.)'],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['ongoing', 'ended'],
      default: 'ongoing',
    },
    participants: [
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

module.exports = mongoose.model('Meeting', meetingSchema);
