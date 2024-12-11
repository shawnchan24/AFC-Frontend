// Base URL for API requests
const BASE_URL = "https://theafc.life"; // Ensure this matches your backend deployment URL

// Load Pending User Requests for Admin Panel
async function loadUserRequests() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/pending-users`);
    if (!response.ok) {
      throw new Error(`Failed to fetch pending user requests. Status: ${response.status}`);
    }

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
    document.getElementById("userRequests").innerHTML = "<p>Error loading user requests. Please try again later.</p>";
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

// Initialize on Page Load
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("userRequests")) loadUserRequests();
});
