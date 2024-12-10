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

// CORS configuration
app.use(
  cors({
    origin: ["https://theafc.life", "http://localhost:5500"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "Frontend")));

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Root Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Frontend", "index.html"));
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, pin } = req.body;

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

// Events API
app.route("/api/events")
  .post(async (req, res) => {
    try {
      const { title, description, mediaUrl } = req.body;
      const event = await Event.create({ title, description, mediaUrl });
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event." });
    }
  })
  .get(async (req, res) => {
    try {
      const events = await Event.find();
      res.status(200).json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events." });
    }
  });

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://127.0.0.1:${PORT}`));
