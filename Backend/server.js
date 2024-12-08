const app = require("./app");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose"); // Assuming you're connecting to MongoDB
const User = require("./models/User"); // Adjust path if User model is elsewhere

const PORT = process.env.PORT || 5000;

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use Gmail or another email service
  auth: {
    user: process.env.EMAIL, // Admin email address
    pass: process.env.EMAIL_PASSWORD, // Admin email password
  },
});

// Send notification email when a new user signs up
function sendNotificationEmail(newUserEmail) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: process.env.ADMIN_EMAIL, // Admin email address to receive notifications
    subject: "New User Registration",
    text: `A new user has joined the platform: ${newUserEmail}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

// Example user registration route
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Save the user to the database
    const newUser = await User.create({ email, password });

    // Trigger email notification
    sendNotificationEmail(newUser.email);

    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(400).send("Error registering user");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
