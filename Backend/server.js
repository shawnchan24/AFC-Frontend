const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

// Import Models and Routes
const User = require("./models/User");
const pendingUsersRoutes = require("./routes/pendingUsersRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const churchEventRoutes = require("./routes/churchEventRoutes"); // Updated route
const donationRoutes = require("./routes/donationRoutes");

const app = express();
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

// API Routes
app.use("/pending-users", pendingUsersRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/church-events", churchEventRoutes); // Updated route
app.use("/api/donations", donationRoutes);

// User Registration Route
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).send("User already exists.");

    const newUser = await User.create({ email, password, approved: false });
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: "New User Registration",
      text: `A new user has registered: ${email}. Please log in to approve or reject this user.`,
    });

    res.status(201).send("User registered. Awaiting admin approval.");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Registration failed.");
  }
});

// Admin Login Route
app.post("/login", async (req, res) => {
  const { email, pin } = req.body;

  if (email === process.env.ADMIN_EMAIL && pin === "1532") {
    return res.status(200).send("Admin login successful.");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found.");
    if (!user.approved) return res.status(403).send("User not approved.");

    if (pin === "1234") {
      return res.status(200).send("User login successful.");
    } else {
      return res.status(400).send("Invalid credentials.");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("Login failed.");
  }
});

// Serve Frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Frontend", "index.html"));
});

// Fallback route for non-existent routes
app.use((req, res) => {
  res.status(404).send("Page not found.");
});

// Start Server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));
