const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  roles: {
    User: {
      type: Number,
      default: 2001,
    },
    Manager: Number,
    Admin: Number,
  },

  password: {
    type: String,
    required: true,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  refreshToken: String,
});

module.exports = mongoose.model("User", userSchema);
