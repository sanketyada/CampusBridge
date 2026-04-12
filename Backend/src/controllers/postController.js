const Post = require('../models/Post');
const { checkAbusiveContent } = require('../utils/moderation');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Content is required' });
  }

  // Content Moderation check
  if (!checkAbusiveContent(content)) {
    return res.status(400).json({ 
      message: 'Post contains inappropriate or abusive language and cannot be published.' 
    });
  }

  // Extract hashtags from content
  const tags = content.match(/#\w+/g)?.map(tag => tag.substring(1).toLowerCase()) || [];

  const post = await Post.create({
    user: req.user._id,
    content,
    tags
  });

  const populatedPost = await Post.findById(post._id).populate('user', 'name role profilePicture department');

  res.status(201).json(populatedPost);
};

// @desc    Record a share (one per user; used for counts + social proof)
// @route   PUT /api/posts/:id/share
// @access  Private
const sharePost = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const uid = req.user._id.toString();
  const already = post.shares.some((id) => id.toString() === uid);
  if (!already) {
    post.shares.push(req.user._id);
    await post.save();
  }

  res.json(post.shares);
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
  const { sort, page = 1, limit = 10, tag, search, mine } = req.query;
  const skip = (page - 1) * limit;
  
  let query = {};
  
  // Tag filter
  if (tag) query.tags = tag.toLowerCase();
  
  // Search filter
  if (search) {
    query.content = { $regex: search, $options: 'i' };
  }
  
  // Filter by user's own posts ("Personal")
  if (mine === 'true' && req.user) {
    query.user = req.user._id;
  }

  let postsQuery = Post.find(query)
    .populate('user', 'name role profilePicture department')
    .populate('comments.user', 'name role profilePicture department');

  // Sorting Logic
  if (sort === 'trending') {
    // Basic trending: Sort by number of likes
    postsQuery = postsQuery.sort({ 'likes.length': -1, createdAt: -1 });
  } else {
    postsQuery = postsQuery.sort({ createdAt: -1 });
  }

  const posts = await postsQuery.skip(skip).limit(Number(limit));
  const total = await Post.countDocuments(query);

  res.json({
    posts,
    page: Number(page),
    pages: Math.ceil(total / limit),
    total
  });
};

// @desc    Like / Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const isLiked = post.likes.includes(req.user._id);

  if (isLiked) {
    post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
  } else {
    post.likes.push(req.user._id);
  }

  await post.save();
  res.json(post.likes);
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res) => {
  const { text } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  // Content Moderation check for comments
  if (!checkAbusiveContent(text)) {
    return res.status(400).json({ 
      message: 'Comment contains inappropriate or abusive language.' 
    });
  }

  const newComment = {
    user: req.user._id,
    text,
    name: req.user.name,
  };

  post.comments.push(newComment);
  await post.save();

  const updatedPost = await Post.findById(post._id).populate('comments.user', 'name role profilePicture');
  res.status(201).json(updatedPost.comments);
};

module.exports = {
  createPost,
  getPosts,
  likePost,
  addComment,
  sharePost,
};
