const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  likePost,
  addComment,
  sharePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getPosts)
  .post(protect, createPost);

router.put('/:id/like', protect, likePost);
router.put('/:id/share', protect, sharePost);
router.post('/:id/comment', protect, addComment);

module.exports = router;
