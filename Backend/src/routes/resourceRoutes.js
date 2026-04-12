const express = require('express');
const router = express.Router();
const multer = require('multer');
const { resourceStorage } = require('../config/cloudinary');
const {
  uploadResource,
  getResources,
  getResourceById,
  upvoteResource,
  shareResource,
  addResourceComment,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ 
  storage: resourceStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.route('/')
  .get(getResources)
  .post(protect, upload.single('file'), uploadResource);

router.get('/:id', getResourceById);
router.put('/:id/upvote', protect, upvoteResource);
router.put('/:id/share', protect, shareResource);
router.post('/:id/comment', protect, addResourceComment);

module.exports = router;
