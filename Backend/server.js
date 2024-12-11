const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

// Database connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Register a new user
app.post("/api/register", async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const newUser = new User({ email, pin: "1234" });
    await newUser.save();

    // Notify admin
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: "New User Registration",
      text: `A new user has registered with the email: ${email}. Please log in to the admin dashboard to approve or reject the user.`,
    });

    res.status(201).json({ message: "Registration successful. Pending admin approval." });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user." });
  }
});

// Admin fetch pending users
app.get("/api/admin/pending-users", async (req, res) => {
  try {
    const users = await User.find({ approved: false });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ message: "Error fetching pending users." });
  }
});

// Admin approve user
app.post("/api/admin/approve-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndUpdate(userId, { approved: true, pin: "1153" }, { new: true });

    // Notify user
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Approval Notification",
      text: "Your account has been approved! You can now log in using your permanent pin: 1153.",
    });

    res.status(200).json({ message: "User approved successfully." });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Error approving user." });
  }
});

// Admin reject user
app.post("/api/admin/reject-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User rejected successfully." });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ message: "Error rejecting user." });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
