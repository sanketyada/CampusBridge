const mongoose = require('mongoose');
const User = require('../models/User');

// @desc    Get public profile by id
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    _id: user._id,
    name: user.name,
    role: user.role,
    profilePicture: user.profilePicture,
    bio: user.bio,
    department: user.department,
    yearOfStudy: user.yearOfStudy,
    company: user.company,
    achievements: user.achievements,
  });
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.json(users);
};

// @desc    Get all faculty members
// @route   GET /api/users/faculty
// @access  Private
const getFaculty = async (req, res) => {
  const faculty = await User.find({ role: 'faculty' }).select('name role profilePicture bio department');
  res.json(faculty);
};

// @desc    Get all alumni members
// @route   GET /api/users/alumni
// @access  Private
const getAlumni = async (req, res) => {
  const alumni = await User.find({ role: 'alumni' }).select('name role profilePicture bio department company achievements');
  res.json(alumni);
};

// @desc    Get recommended mentors (Faculty or Alumni)
// @route   GET /api/users/mentors
// @access  Private
const getRecommendedMentors = async (req, res) => {
  const mentors = await User.find({ role: { $in: ['alumni', 'faculty'] } })
    .select('name role profilePicture bio department')
    .limit(10);

  res.json(mentors);
};

// @desc    Update user profile (bio, etc.)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  const { bio, company, achievements, department, yearOfStudy } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    user.bio = bio || user.bio;
    user.company = company || user.company;
    user.achievements = achievements || user.achievements;
    user.department = department || user.department;
    user.yearOfStudy = yearOfStudy || user.yearOfStudy;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
      profilePicture: updatedUser.profilePicture,
      department: updatedUser.department,
      yearOfStudy: updatedUser.yearOfStudy,
      company: updatedUser.company,
      achievements: updatedUser.achievements,
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

// @desc    Block user (Admin only)
// @route   PUT /api/users/:id/block
// @access  Private/Admin
const blockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.isBlocked = true;
    await user.save();
    res.json({ message: 'User blocked' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Unblock user (Admin only)
// @route   PUT /api/users/:id/unblock
// @access  Private/Admin
const unblockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.isBlocked = false;
    await user.save();
    res.json({ message: 'User unblocked' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Ban user (Admin only)
// @route   PUT /api/users/:id/ban
// @access  Private/Admin
const banUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.isBanned = true;
    await user.save();
    res.json({ message: 'User banned' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
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
  deleteUser,
};
