const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const User = require("./models/User");
const pendingUsersRoutes = require("./routes/pendingUsersRoutes");
const Announcement = require("./models/Announcement");
const Event = require("./models/Event");
const Donation = require("./models/Donation");

const app = express();

// CORS configuration
const corsOptions = {
  origin: ["https://theafc.life", "http://localhost:5500"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Serve static files
app.use(express.static(path.join(__dirname, "Frontend")));
app.use("/css", express.static(path.join(__dirname, "Frontend/css")));
app.use("/assets", express.static(path.join(__dirname, "Frontend/assets")));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Frontend", "index.html"));
});

// Routes
app.use("/pending-users", pendingUsersRoutes);

// User login route
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

// Announcements API
app.route("/api/announcements")
  .post(async (req, res) => {
    try {
      const { title, content } = req.body;
      const announcement = await Announcement.create({ title, content });
      res.status(201).json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement." });
    }
  })
  .get(async (req, res) => {
    try {
      const announcements = await Announcement.find();
      res.status(200).json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements." });
    }
  });

// Events API
app.route("/api/events")
  .post(async (req, res) => {
    try {
      const { title, mediaUrl, description } = req.body;
      const event = await Event.create({ title, mediaUrl, description });
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

// Fix for `/api/calendar` route
app.get("/api/calendar", async (req, res) => {
  try {
    const events = await Event.find(); // Ensure the Event model exists
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events." });
  }
});

// Donations API
app.route("/api/donations")
  .post(async (req, res) => {
    try {
      const { name, email, amount, purpose } = req.body;
      const donation = await Donation.create({ name, email, amount, purpose });
      res.status(201).json(donation);
    } catch (error) {
      console.error("Error creating donation:", error);
      res.status(500).json({ message: "Failed to process donation." });
    }
  })
  .get(async (req, res) => {
    try {
      const donations = await Donation.find();
      res.status(200).json(donations);
    } catch (error) {
      console.error("Error fetching donations:", error);
      res.status(500).json({ message: "Failed to fetch donations." });
    }
  });

// Fallback route for non-existent routes
app.use((req, res) => {
  res.status(404).json({ message: "Page not found." });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://127.0.0.1:${PORT}`));
