const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const User = require("./models/User");
const Announcement = require("./models/Announcement");
const Event = require("./models/Event");
const Donation = require("./models/Donation");

const app = express();

// Configure CORS Middleware
app.use(
  cors({
    origin: ["http://localhost:5500", "https://theafc.life"], // Allow local and production domains
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow cookies and authentication headers
  })
);

app.use(express.json()); // Parse JSON requests
app.use(express.static(path.join(__dirname, "Frontend"))); // Serve static files from the frontend directory

// Configure Nodemailer for email notifications
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Root Route (Serve the homepage)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Frontend", "index.html"));
});

// Login Endpoint
app.post("/login", async (req, res) => {
  const { email, pin } = req.body;

  // Admin login bypass
  if (email === process.env.ADMIN_EMAIL && pin === "1532") {
    return res.status(200).json({ isAdmin: true });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!user.approved) return res.status(403).json({ message: "User not approved." });

    if (pin === "1234") {
      return res.status(200).json({ isApproved: true });
    } else {
      return res.status(400).json({ message: "Invalid credentials." });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed." });
  }
});

// API Routes for Events
app.route("/api/events")
  .post(async (req, res) => {
    try {
      const { title, description, mediaUrl, date } = req.body;
      const event = await Event.create({ title, description, mediaUrl, date });
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event." });
    }
  })
  .get(async (req, res) => {
    try {
      const events = await Event.find().sort({ date: -1 }); // Sort events by most recent
      res.status(200).json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events." });
    }
  });

// API Route for Pending Users
app.get("/api/admin/pending-users", async (req, res) => {
  try {
    const users = await User.find({ approved: false });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ message: "Failed to fetch pending users." });
  }
});

// Approve User Endpoint
app.post("/api/admin/approve-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndUpdate(userId, { approved: true });
    res.status(200).json({ message: "User approved successfully." });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Failed to approve user." });
  }
});

// Reject User Endpoint
app.post("/api/admin/reject-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User rejected successfully." });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ message: "Failed to reject user." });
  }
});

// Donations Endpoint
app.post("/api/donations", async (req, res) => {
  try {
    const { name, email, amount, purpose } = req.body;
    const donation = await Donation.create({ name, email, amount, purpose });

    // Send confirmation email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Thank you for your donation!",
      text: `Thank you for your generous donation of $${amount} towards ${purpose}.`,
    });

    res.status(201).json(donation);
  } catch (error) {
    console.error("Error processing donation:", error);
    res.status(500).json({ message: "Failed to process donation." });
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
