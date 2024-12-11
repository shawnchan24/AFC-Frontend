const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Ensure no leading/trailing spaces
    lowercase: true, // Ensure emails are stored in lowercase
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Enforce a minimum password length
  },
  approved: {
    type: Boolean,
    default: false, // New users are unapproved by default
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation date
  },
  role: {
    type: String,
    enum: ["user", "admin"], // Define roles for users
    default: "user", // Default role is "user"
  },
});

module.exports = mongoose.model("User", userSchema);
