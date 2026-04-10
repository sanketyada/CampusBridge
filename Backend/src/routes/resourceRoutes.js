const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  uploadResource,
  getResources,
  upvoteResource,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf|docx|png|jpg|jpeg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only academic documents (PDF, DOCX, Images) are allowed!'));
    }
  },
});

router.route('/')
  .get(getResources)
  .post(protect, upload.single('file'), uploadResource);

router.put('/:id/upvote', protect, upvoteResource);

module.exports = router;
