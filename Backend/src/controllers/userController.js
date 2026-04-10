const User = require('../models/User');

// @desc    Get recommended mentors (Alumni)
// @route   GET /api/users/mentors
// @access  Private
const getRecommendedMentors = async (req, res) => {
  const mentors = await User.find({ role: 'alumni' })
    .select('name role profilePicture bio')
    .limit(5);

  res.json(mentors);
};

// @desc    Update user profile (bio, etc.)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  const { bio } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    user.bio = bio || user.bio;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
      profilePicture: updatedUser.profilePicture,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update profile picture
// @route   POST /api/users/profile-picture
// @access  Private
const updateProfilePicture = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image' });
  }

  const user = await User.findById(req.user._id);
  if (user) {
    user.profilePicture = req.file.path; // Cloudinary full URL
    await user.save();
    res.json({ profilePicture: user.profilePicture });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  getRecommendedMentors,
  updateProfile,
  updateProfilePicture,
};
