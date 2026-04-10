const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  getRecommendedMentors, 
  updateProfile, 
  updateProfilePicture 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Ensure profiles directory exists
const profilesDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

// Multer Config for Profile Pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles');
  },
  filename: (req, file, cb) => {
    cb(null, `profile-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images only (jpeg/jpg/png)');
    }
  },
});

router.get('/mentors', getRecommendedMentors);
router.put('/profile', protect, updateProfile);
router.post('/profile-picture', protect, upload.single('image'), updateProfilePicture);

module.exports = router;
