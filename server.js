const express = require("express");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors"); // Import cors
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
  origin: ["https://theafc.life", "http://localhost:5500"], // Allow these origins
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
  credentials: true, // Allow cookies and authentication headers
};
app.use(cors(corsOptions)); // Use CORS middleware

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
    if (!user) return res.status(404).send("User not found.");
    if (!user.approved) return res.status(403).send("User not approved.");

    if (pin === "1234") {
      return res.status(200).json({ isApproved: true });
    } else {
      return res.status(400).send("Invalid credentials.");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("Login failed.");
  }
});

// Fallback route for non-existent routes
app.use((req, res) => {
  res.status(404).send("Page not found.");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));