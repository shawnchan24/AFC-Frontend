// Base URL for API requests
const BASE_URL = "https://theafc.life"; // Update for production deployment

// Ensure DOM is loaded before attaching event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Login Functionality
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Get login form values
      const email = document.getElementById("loginEmail").value.trim();
      const pin = document.getElementById("loginPin").value.trim();

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
  }

  // Logout Functionality
  const logoutButton = document.querySelector("[onclick='logout()']");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.clear();
      alert("You have logged out.");
      window.location.href = "index.html";
    });
  }

  // Load Pending User Requests for Admin Panel
  const userRequestsDiv = document.getElementById("userRequests");
  if (userRequestsDiv) {
    async function loadUserRequests() {
      try {
        const response = await fetch(`${BASE_URL}/api/admin/pending-users`);
        if (!response.ok) throw new Error("Failed to fetch pending user requests.");

        const users = await response.json();

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
        userRequestsDiv.innerHTML = "<p>Error loading user requests.</p>";
      }
    }

    loadUserRequests();
  }

  // Approve User Functionality
  window.approveUser = async (userId) => {
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
  };

  // Reject User Functionality
  window.rejectUser = async (userId) => {
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
  };
});
