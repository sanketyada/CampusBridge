const Message = require('../models/Message');

// @desc    Get messages between two users
// @route   GET /api/chat/:userId
// @access  Private
const getMessages = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  try {
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

// @desc    Get conversation list (users you've chatted with)
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  const currentUserId = req.user._id;

  try {
    // Find all unique users the current user has exchanged messages with
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    }).sort({ createdAt: -1 });

    const conversationUsers = new Set();
    messages.forEach((msg) => {
      conversationUsers.add(
        msg.sender.toString() === currentUserId.toString()
          ? msg.receiver.toString()
          : msg.sender.toString()
      );
    });

    res.json(Array.from(conversationUsers));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations' });
  }
};

module.exports = {
  getMessages,
  getConversations,
};
