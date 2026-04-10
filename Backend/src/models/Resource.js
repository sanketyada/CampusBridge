const mongoose = require('mongoose');

const resourceSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    fileUrl: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Notes', 'Question Paper', 'Guide', 'Other'],
      default: 'Notes',
    },
    subject: {
      type: String,
      required: [true, 'Please add a subject'],
    },
    upvotes: [
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

module.exports = mongoose.model('Resource', resourceSchema);
