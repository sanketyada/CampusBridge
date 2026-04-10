const express = require('express');
const router = express.Router();
const multer = require('multer');
const { profileStorage } = require('../config/cloudinary');
const { 
  getRecommendedMentors, 
  updateProfile, 
  updateProfilePicture 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ 
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 }
});

router.get('/mentors', getRecommendedMentors);
router.put('/profile', protect, updateProfile);
router.post('/profile-picture', protect, upload.single('image'), updateProfilePicture);

module.exports = router;
