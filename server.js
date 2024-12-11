const BASE_URL = "https://theafc.life";

// User registration
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();

  try {
    const response = await fetch(`${BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      alert("Registration successful. Pending admin approval.");
    } else {
      const data = await response.json();
      alert(data.message || "Error registering user.");
    }
  } catch (error) {
    console.error("Error registering user:", error);
  }
});

// Load pending users for admin
async function loadPendingUsers() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/pending-users`);
    const users = await response.json();

    const userRequestsDiv = document.getElementById("userRequests");
    userRequestsDiv.innerHTML = users
      .map(
        (user) => `
      <div>
        <p>Email: ${user.email}</p>
        <button onclick="approveUser('${user._id}')">Approve</button>
        <button onclick="rejectUser('${user._id}')">Reject</button>
      </div>`
      )
      .join("");
  } catch (error) {
    console.error("Error loading pending users:", error);
  }
}

// Approve user
async function approveUser(userId) {
  try {
    await fetch(`${BASE_URL}/api/admin/approve-user/${userId}`, { method: "POST" });
    loadPendingUsers();
  } catch (error) {
    console.error("Error approving user:", error);
  }
}

// Reject user
async function rejectUser(userId) {
  try {
    await fetch(`${BASE_URL}/api/admin/reject-user/${userId}`, { method: "POST" });
    loadPendingUsers();
  } catch (error) {
    console.error("Error rejecting user:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("userRequests")) loadPendingUsers();
});
