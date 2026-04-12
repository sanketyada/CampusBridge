const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const { checkAbusiveContent } = require('../utils/moderation');

// @desc    Upload a new resource
// @route   POST /api/resources
// @access  Private
const uploadResource = async (req, res) => {
  const { title, category, subject } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const resource = await Resource.create({
    user: req.user._id,
    title,
    category,
    subject,
    fileUrl: req.file.path, // Cloudinary provides the full URL in .path
  });

  const populatedResource = await Resource.findById(resource._id).populate('user', 'name role');
  res.status(201).json(populatedResource);
};

// @desc    Get all resources with filters
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res) => {
  const { category, subject, search } = req.query;
  let query = {};

  if (category) query.category = category;
  if (subject) query.subject = { $regex: subject, $options: 'i' };
  if (search) query.title = { $regex: search, $options: 'i' };

  const resources = await Resource.find(query)
    .sort({ createdAt: -1 })
    .populate('user', 'name role profilePicture department')
    .populate('comments.user', 'name profilePicture role');

  res.json(resources);
};

// @desc    Get one resource (e.g. detail + comments)
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid resource id' });
  }

  const resource = await Resource.findById(req.params.id)
    .populate('user', 'name role profilePicture department')
    .populate('comments.user', 'name profilePicture role');

  if (!resource) {
    return res.status(404).json({ message: 'Resource not found' });
  }

  res.json(resource);
};

// @desc    Upvote a resource
// @route   PUT /api/resources/:id/upvote
// @access  Private
const upvoteResource = async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    return res.status(404).json({ message: 'Resource not found' });
  }

  const isUpvoted = resource.upvotes.includes(req.user._id);

  if (isUpvoted) {
    resource.upvotes = resource.upvotes.filter((id) => id.toString() !== req.user._id.toString());
  } else {
    resource.upvotes.push(req.user._id);
  }

  await resource.save();
  res.json(resource.upvotes);
};

// @desc    Share resource (count once per user)
// @route   PUT /api/resources/:id/share
// @access  Private
const shareResource = async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    return res.status(404).json({ message: 'Resource not found' });
  }

  const uid = req.user._id.toString();
  const already = resource.shares.some((id) => id.toString() === uid);
  if (!already) {
    resource.shares.push(req.user._id);
    await resource.save();
  }

  res.json(resource.shares);
};

// @desc    Add comment on resource
// @route   POST /api/resources/:id/comment
// @access  Private
const addResourceComment = async (req, res) => {
  const { text } = req.body;
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    return res.status(404).json({ message: 'Resource not found' });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  if (!checkAbusiveContent(text)) {
    return res.status(400).json({
      message: 'Comment contains inappropriate or abusive language.',
    });
  }

  resource.comments.push({
    user: req.user._id,
    text: text.trim(),
    name: req.user.name,
  });
  await resource.save();

  const updated = await Resource.findById(resource._id).populate('comments.user', 'name profilePicture role');
  res.status(201).json(updated.comments);
};

module.exports = {
  uploadResource,
  getResources,
  getResourceById,
  upvoteResource,
  shareResource,
  addResourceComment,
};
