document.getElementById("loginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const pin = document.getElementById("pin").value;

  if (email === "shawnchan24@gmail.com" && pin === "1532") {
    // Admin login
    localStorage.setItem("isAdmin", true);
    localStorage.setItem("isLoggedIn", true);
    alert("Welcome, Admin!");
    window.location.href = "admin.html";
  } else if (pin === "1234") {
    // Regular user login
    localStorage.setItem("isAdmin", false);
    localStorage.setItem("isLoggedIn", true);
    alert("Login successful!");
    window.location.href = "homepage.html";
  } else {
    // Invalid login
    document.getElementById("loginError").textContent = "Invalid email or pin code.";
  }
});

// Restrict access to the homepage
if (window.location.pathname.includes("homepage.html")) {
  if (!localStorage.getItem("isLoggedIn")) {
    alert("Please log in first.");
    window.location.href = "index.html";
  }
}

// Restrict access to admin panel
if (window.location.pathname.includes("admin.html")) {
  if (!localStorage.getItem("isAdmin")) {
    alert("Access denied! Admins only.");
    window.location.href = "index.html";
  }
}
