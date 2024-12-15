const BASE_URL = "https://afc-backend-1.onrender.com"; // Backend URL

// Registration
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value.trim();
  if (!email) {
    alert("Please enter a valid email address.");
    return;
  }
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (response.ok) {
      const data = await response.json();
      document.getElementById("registerSuccess").textContent =
        data.message || "Registration successful. Pending admin approval.";
      document.getElementById("registerSuccess").style.color = "green";
    } else {
      const data = await response.json();
      alert(data.message || "Registration failed. Please check your input.");
    }
  } catch (error) {
    console.error("Error registering user:", error);
    alert("Failed to register due to a network or server issue. Please try again.");
  }
});

// Admin and User Login
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const pin = document.getElementById("loginPin").value.trim();
  if (!email || !pin) {
    alert("Both email and PIN are required.");
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
      if (data.isAdmin) {
        alert("Welcome, Admin!");
        window.location.href = "admin.html";
      } else if (data.approved) {
        alert("Login successful!");
        window.location.href = "homepage.html";
      } else {
        alert("Your account is not yet approved. Please contact the admin.");
      }
    } else {
      const data = await response.json();
      alert(data.message || "Invalid email or PIN.");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    alert("Failed to log in due to a network or server issue. Please try again.");
  }
});

// Admin: Load Pending Users
async function loadUserRequests() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/pending-users`);
    if (!response.ok) throw new Error("Failed to fetch pending users.");
    const users = await response.json();
    const userRequestsDiv = document.getElementById("userRequests");
    if (users.length === 0) {
      userRequestsDiv.innerHTML = "<p>No pending user approvals.</p>";
    } else {
      userRequestsDiv.innerHTML = users
        .map(
          (user) => `
          <div class="user-request">
            <p><strong>Email:</strong> ${user.email}</p>
            <button onclick="approveUser('${user._id}')">Approve</button>
            <button onclick="rejectUser('${user._id}')">Reject</button>
          </div>`
        )
        .join("");
    }
  } catch (error) {
    console.error("Error loading user requests:", error);
    document.getElementById("userRequests").innerHTML =
      "<p>Error loading user requests. Please refresh the page.</p>";
  }
}

// Admin: Approve User and Assign PIN
async function approveUser(userId) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/approve-user/${userId}`, {
      method: "POST",
    });
    if (response.ok) {
      alert("User approved successfully. They can now log in with PIN: 1153.");
      loadUserRequests(); // Refresh the pending user list
    } else {
      const data = await response.json();
      alert(data.message || "Failed to approve user.");
    }
  } catch (error) {
    console.error("Error approving user:", error.message);
    alert("Error approving user. Please try again.");
  }
}

// Reject User
async function rejectUser(userId) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/reject-user/${userId}`, {
      method: "POST",
    });
    if (response.ok) {
      alert("User rejected successfully.");
      loadUserRequests(); // Refresh the pending user list
    } else {
      const data = await response.json();
      alert(data.message || "Failed to reject user.");
    }
  } catch (error) {
    console.error("Error rejecting user:", error.message);
    alert("Error rejecting user. Please try again.");
  }
}

// Load User Stats
async function loadUserStats() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/user-stats`);
    if (!response.ok) throw new Error("Failed to fetch user stats.");
    const { totalUsers, onlineUsers } = await response.json();
    const userStatsDiv = document.getElementById("userStats");
    userStatsDiv.innerHTML = `
      <p><strong>Total Users:</strong> ${totalUsers}</p>
      <p><strong>Online Users:</strong> ${onlineUsers}</p>
    `;
  } catch (error) {
    console.error("Error loading user stats:", error);
    document.getElementById("userStats").innerHTML =
      "<p>Failed to load user stats. Please refresh the page.</p>";
  }
}

// Gallery: Load Photos
async function loadGallery() {
  try {
    const response = await fetch(`${BASE_URL}/api/gallery`);
    if (!response.ok) throw new Error("Failed to load gallery photos.");
    const photos = await response.json();
    const galleryDiv = document.getElementById("photoGallery");
    if (photos.length === 0) {
      galleryDiv.innerHTML = "<p>No photos available in the gallery.</p>";
    } else {
      galleryDiv.innerHTML = photos
        .map(
          (photo) => `
          <div class="gallery-item">
            <img src="${photo.url}" alt="${photo.caption}" />
            <p>${photo.caption}</p>
          </div>`
        )
        .join("");
    }
  } catch (error) {
    console.error("Error loading gallery:", error);
    document.getElementById("photoGallery").innerHTML =
      "<p>Error loading gallery photos. Please refresh the page.</p>";
  }
}

// Logout Functionality
function logout() {
  localStorage.clear();
  alert("You have been logged out.");
  window.location.href = "index.html";
}

// On page load
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("userRequests")) {
    loadUserRequests();
  }
  if (document.getElementById("userStats")) {
    loadUserStats();
  }
  if (document.getElementById("photoGallery")) {
    loadGallery();
  }
});
