const Group = require('../models/Group');
const GroupMessage = require('../models/GroupMessage');
const { nanoid } = require('nanoid');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Group name is required' });
  }

  try {
    const inviteId = nanoid(8); // Generate an 8-character unique ID
    const group = await Group.create({
      name,
      description,
      creator: req.user._id,
      members: [req.user._id], // Creator is automatically a member
      inviteId,
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error creating group', error: error.message });
  }
};

// @desc    Join a group via inviteId
// @route   POST /api/groups/join
// @access  Private
const joinGroup = async (req, res) => {
  const { inviteId } = req.body;

  if (!inviteId) {
    return res.status(400).json({ message: 'Invite ID is required' });
  }

  try {
    const group = await Group.findOne({ inviteId });

    if (!group) {
      return res.status(404).json({ message: 'Group not found with this ID' });
    }

    // Check if user is already a member
    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    group.members.push(req.user._id);
    await group.save();

    res.json({ message: 'Joined group successfully', group });
  } catch (error) {
    res.status(500).json({ message: 'Error joining group' });
  }
};

// @desc    Get groups current user is part of
// @route   GET /api/groups
// @access  Private
const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('creator', 'name')
      .sort({ updatedAt: -1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups' });
  }
};

// @desc    Get messages for a group
// @route   GET /api/groups/:groupId/messages
// @access  Private
const getGroupMessages = async (req, res) => {
  const { groupId } = req.params;

  try {
    // Basic authorization: check if user is a member
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    const messages = await GroupMessage.find({ group: groupId })
      .populate('sender', 'name profilePicture role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

module.exports = {
  createGroup,
  joinGroup,
  getMyGroups,
  getGroupMessages,
};
