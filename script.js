const BASE_URL = "https://afc-backend-1.onrender.com"; // Updated backend URL

// Registration
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("registerEmail").value.trim();

  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      document.getElementById("registerSuccess").textContent =
        "Registration successful. Pending admin approval.";
    } else {
      const data = await response.json();
      alert(data.message || "Registration failed.");
    }
  } catch (error) {
    console.error("Error registering user:", error);
    alert("Failed to register. Please try again.");
  }
});

// Admin Login
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const pin = document.getElementById("loginPin").value.trim();

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
      } else {
        alert("Login successful!");
        window.location.href = "homepage.html";
      }
    } else {
      alert("Invalid email or PIN.");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    alert("Failed to log in. Please try again.");
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
      "<p>Error loading user requests.</p>";
  }
}

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

// Logout Functionality
function logout() {
  localStorage.clear();
  alert("You have been logged out.");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("userRequests")) {
    loadUserRequests();
  }
});
