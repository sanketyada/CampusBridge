const Post = require('../models/Post');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  const { content, isAnonymous } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Content is required' });
  }

  // Extract hashtags from content
  const tags = content.match(/#\w+/g)?.map(tag => tag.substring(1).toLowerCase()) || [];

  const post = await Post.create({
    user: req.user._id,
    content,
    isAnonymous,
    tags
  });

  const populatedPost = await Post.findById(post._id).populate('user', 'name role profilePicture');

  res.status(201).json(populatedPost);
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
  const { sort, page = 1, limit = 10, tag } = req.query;
  const skip = (page - 1) * limit;
  
  let query = {};
  if (tag) query.tags = tag.toLowerCase();

  let postsQuery = Post.find(query)
    .populate('user', 'name role profilePicture')
    .populate('comments.user', 'name role profilePicture');

  // Sorting Logic
  if (sort === 'trending') {
    // Basic trending: Sort by number of likes
    // To do this efficiently at scale, we'd use an aggregation pipeline, but for now:
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
};
