const express = require('express');
const router = express.Router();
const multer = require('multer');
const { profileStorage } = require('../config/cloudinary');
const { 
  getUserById,
  getAllUsers,
  getFaculty,
  getAlumni,
  getRecommendedMentors, 
  updateProfile, 
  updateProfilePicture,
  blockUser,
  unblockUser,
  banUser,
  deleteUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const upload = multer({ 
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 }
});

// Public / Protected user routes
router.get('/', protect, admin, getAllUsers);
router.get('/faculty', protect, getFaculty);
router.get('/alumni', protect, getAlumni);
router.get('/mentors', protect, getRecommendedMentors);
router.get('/:id', protect, getUserById);
router.put('/profile', protect, updateProfile);
router.post('/profile-picture', protect, upload.single('image'), updateProfilePicture);

// Admin only routes
router.put('/:id/block', protect, admin, blockUser);
router.put('/:id/unblock', protect, admin, unblockUser);
router.put('/:id/ban', protect, admin, banUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
