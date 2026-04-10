const Resource = require('../models/Resource');

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
    fileUrl: `/uploads/${req.file.filename}`,
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
    .populate('user', 'name role');

  res.json(resources);
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

module.exports = {
  uploadResource,
  getResources,
  upvoteResource,
};
