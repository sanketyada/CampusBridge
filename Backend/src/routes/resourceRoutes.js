const express = require('express');
const router = express.Router();
const multer = require('multer');
const { resourceStorage } = require('../config/cloudinary');
const {
  uploadResource,
  getResources,
  upvoteResource,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ 
  storage: resourceStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.route('/')
  .get(getResources)
  .post(protect, upload.single('file'), uploadResource);

router.put('/:id/upvote', protect, upvoteResource);

module.exports = router;
