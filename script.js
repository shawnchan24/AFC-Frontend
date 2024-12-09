// Login Functionality
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const pin = document.getElementById("pin").value.trim();

  try {
    const response = await fetch("http://localhost:5500/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, pin }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.isAdmin) {
        alert("Welcome, Admin!");
        window.location.href = "admin.html";
      } else if (data.isApproved) {
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

// Load Events for Homepage Feed
async function loadAllEvents() {
  try {
    const response = await fetch("http://localhost:5500/api/calendar");
    if (!response.ok) throw new Error("Failed to fetch events.");
    const events = await response.json();

    const eventFeed = document.getElementById("eventFeed");
    eventFeed.innerHTML = events
      .map(
        (event) => `
      <div class="feed-item">
        <h3>${event.title}</h3>
        <p>${event.date}</p>
        <p>${event.description}</p>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading events:", error);
    document.getElementById("eventFeed").innerHTML = "<p>Error loading events.</p>";
  }
}

// Load pending users on admin page load
async function loadUserRequests() {
  try {
    const response = await fetch("http://localhost:5500/pending-users");
    if (!response.ok) throw new Error("Failed to fetch pending users.");
    const users = await response.json();
    const userRequestsDiv = document.getElementById("userRequests");

    if (users.length === 0) {
      userRequestsDiv.innerHTML = "<p>No pending user approvals.</p>";
      return;
    }

    userRequestsDiv.innerHTML = ""; // Clear existing content
    users.forEach((user) => {
      const userDiv = document.createElement("div");
      userDiv.className = "user-request";

      userDiv.innerHTML = `
        <p><strong>Email:</strong> ${user.email}</p>
        <button onclick="approveUser('${user._id}')">Approve</button>
        <button onclick="rejectUser('${user._id}')">Reject</button>
      `;

      userRequestsDiv.appendChild(userDiv);
    });
  } catch (error) {
    console.error("Error loading user requests:", error);
    document.getElementById("userRequests").innerHTML = "<p>Error loading user requests.</p>";
  }
}

// Approve user
async function approveUser(userId) {
  try {
    const response = await fetch(`http://localhost:5500/approve-user/${userId}`, {
      method: "POST",
    });
    if (response.ok) {
      alert("User approved successfully.");
      loadUserRequests(); // Reload user requests
    } else {
      alert("Failed to approve user.");
    }
  } catch (error) {
    console.error("Error approving user:", error);
  }
}

// Reject user
async function rejectUser(userId) {
  try {
    const response = await fetch(`http://localhost:5500/reject-user/${userId}`, {
      method: "POST",
    });
    if (response.ok) {
      alert("User rejected successfully.");
      loadUserRequests(); // Reload user requests
    } else {
      alert("Failed to reject user.");
    }
  } catch (error) {
    console.error("Error rejecting user:", error);
  }
}

// Event Listeners for Calendar and Initialization
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("userRequests")) loadUserRequests();
  if (document.getElementById("eventFeed")) loadAllEvents();
});
