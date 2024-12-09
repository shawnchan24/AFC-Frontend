const express = require("express");
const path = require("path"); // Import 'path' for resolving paths
const app = express();

app.use(express.json()); // Middleware for parsing JSON

// Serve static files from the 'Frontend' directory
app.use(express.static(path.join(__dirname, "Frontend")));

// Routes
app.post("/login", (req, res) => {
  const { email, pin } = req.body;

  if (email === "shawnchan24@gmail.com" && pin === "1532") {
    return res.json({ isAdmin: true });
  } else if (pin === "1234") {
    return res.json({ isAdmin: false, isApproved: true }); // Change logic for approval as needed
  } else {
    return res.status(401).send("Invalid credentials");
  }
});

app.get("/pending-users", (req, res) => {
  // Replace this with actual DB logic
  const dummyUsers = [
    { _id: "1", email: "user1@example.com" },
    { _id: "2", email: "user2@example.com" }
  ];
  res.json(dummyUsers);
});

app.post("/approve-user/:id", (req, res) => {
  const userId = req.params.id;
  // Logic to approve user in DB
  console.log(`User ${userId} approved`);
  res.sendStatus(200);
});

app.post("/reject-user/:id", (req, res) => {
  const userId = req.params.id;
  // Logic to reject user in DB
  console.log(`User ${userId} rejected`);
  res.sendStatus(200);
});

// Handle root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Frontend", "index.html"));
});

// Start the server
const PORT = 5500;
app.listen(PORT, () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
