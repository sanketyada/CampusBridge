const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['student', 'alumni', 'faculty', 'admin'],
      default: 'student',
    },
    department: {
      type: String,
      enum: ['BCA', 'BBA', 'BCOM', 'BSC', 'BA', 'MCA', 'MBA', 'MSC', 'Other'],
    },
    yearOfStudy: {
      type: Number,
      min: 1,
      max: 5,
    },
    profilePicture: {
      type: String,
      default: 'default-avatar.png',
    },
    bio: {
      type: String,
      maxlength: 200,
    },
    // Alumni-specific fields
    company: {
      type: String,
    },
    achievements: {
      type: String,
      maxlength: 500,
    },
    // Admin moderation fields
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
