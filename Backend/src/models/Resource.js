const mongoose = require('mongoose');

const resourceCommentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    text: {
      type: String,
      required: true,
    },
    name: String,
  },
  { timestamps: true }
);

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
      enum: ['Notes', 'Question Paper', 'Guide', 'Assignment', 'Quiz', 'Other'],
      default: 'Notes',
    },
    subject: {
      type: String,
      required: [true, 'Please add a subject'],
    },
    department: {
      type: String,
      enum: ['BCA', 'BBA', 'BCOM', 'BSC', 'BA', 'MCA', 'MBA', 'MSC', 'Other'],
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    shares: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [resourceCommentSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resource', resourceSchema);
