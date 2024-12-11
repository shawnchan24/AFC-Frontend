// Base URL for API requests
const BASE_URL = "https://theafc.life"; // Update for production deployment

// Login Functionality
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const pin = document.getElementById("pin").value.trim();

  if (email === "shawnchan24@gmail.com" && pin === "1532") {
    alert("Welcome, Admin!");
    window.location.href = "admin.html";
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, pin }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.isApproved) {
        alert("Login successful!");
        window.location.href = "homepage.html";
      } else {
        alert("Your account is awaiting admin approval.");
      }
    } else {
      document.getElementById("loginError").textContent = "Invalid email or pin code.";
    }
  } catch (error) {
    console.error("Error logging in:", error);
    alert("Failed to login. Please try again.");
  }
});

// Logout Functionality
function logout() {
  localStorage.clear();
  alert("You have logged out.");
  window.location.href = "index.html";
}

// Load Latest Events for Homepage Feed
async function loadLatestEvents() {
  try {
    const response = await fetch(`${BASE_URL}/api/events`);
    if (!response.ok) throw new Error("Failed to fetch events.");

    const events = await response.json();
    const eventFeed = document.getElementById("eventFeed");

    if (events.length === 0) {
      eventFeed.innerHTML = "<p>No upcoming events available.</p>";
      return;
    }

    eventFeed.innerHTML = events
      .slice(0, 2)
      .map(
        (event) => `
      <div class="feed-item">
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <p><strong>${new Date(event.date).toLocaleString()}</strong></p>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading events:", error);
    document.getElementById("eventFeed").innerHTML = "<p>Failed to load events.</p>";
  }
}

// Load Past Events
async function loadPastEvents() {
  try {
    const response = await fetch(`${BASE_URL}/api/events`);
    if (!response.ok) throw new Error("Failed to load past events.");

    const events = await response.json();
    const container = document.getElementById("pastEvents");
    container.innerHTML = events
      .map(
        (event) => `
      <div class="card">
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <img src="${event.mediaUrl}" alt="${event.title}" style="width: 100%; border-radius: 10px;">
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading past events:", error);
    document.getElementById("pastEvents").textContent = "Failed to load events.";
  }
}

// Load Pending User Requests for Admin Panel
async function loadUserRequests() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/pending-users`);
    if (!response.ok) throw new Error("Failed to fetch pending user requests.");

    const users = await response.json();
    const userRequestsDiv = document.getElementById("userRequests");

    if (users.length === 0) {
      userRequestsDiv.innerHTML = "<p>No pending user approvals.</p>";
      return;
    }

    userRequestsDiv.innerHTML = users
      .map(
        (user) => `
      <div class="user-request">
        <p><strong>Email:</strong> ${user.email}</p>
        <button onclick="approveUser('${user._id}')">Approve</button>
        <button onclick="rejectUser('${user._id}')">Reject</button>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading user requests:", error);
    document.getElementById("userRequests").innerHTML = "<p>Error loading user requests.</p>";
  }
}

// Approve User Functionality
async function approveUser(userId) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/approve-user/${userId}`, {
      method: "POST",
    });
    if (response.ok) {
      alert("User approved successfully.");
      loadUserRequests();
    } else {
      alert("Failed to approve user.");
    }
  } catch (error) {
    console.error("Error approving user:", error);
  }
}

// Reject User Functionality
async function rejectUser(userId) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/reject-user/${userId}`, {
      method: "POST",
    });
    if (response.ok) {
      alert("User rejected successfully.");
      loadUserRequests();
    } else {
      alert("Failed to reject user.");
    }
  } catch (error) {
    console.error("Error rejecting user:", error);
  }
}

// Initialize Events on Page Load
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("eventFeed")) loadLatestEvents();
  if (document.getElementById("pastEvents")) loadPastEvents();
  if (document.getElementById("userRequests")) loadUserRequests();
});
