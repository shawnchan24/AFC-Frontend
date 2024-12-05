// Dark Mode Toggle
document.getElementById("darkModeToggle")?.addEventListener("change", (e) => {
  document.body.classList.toggle("dark-mode", e.target.checked);
  localStorage.setItem("darkMode", e.target.checked);
});

// Load saved dark mode preference
window.addEventListener("DOMContentLoaded", () => {
  const isDarkMode = JSON.parse(localStorage.getItem("darkMode"));
  document.body.classList.toggle("dark-mode", isDarkMode);
  document.getElementById("darkModeToggle").checked = isDarkMode;
});

// Login Form
document.getElementById("loginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const pin = document.getElementById("pin").value;

  if (email === "shawnchan24@gmail.com" && pin === "1532") {
    localStorage.setItem("isAdmin", true);
    localStorage.setItem("isLoggedIn", true);
    alert("Welcome, Admin!");
    window.location.href = "admin.html";
  } else if (pin === "1234") {
    localStorage.setItem("isAdmin", false);
    localStorage.setItem("isLoggedIn", true);
    alert("Login successful!");
    window.location.href = "homepage.html";
  } else {
    document.getElementById("loginError").textContent = "Invalid email or pin code.";
  }
});

// Logout Function
function logout() {
  localStorage.clear();
  alert("You have logged out.");
  window.location.href = "index.html";
}

// Load Events for Homepage Feed
async function loadAllEvents() {
  try {
    const response = await fetch("http://localhost:5000/api/calendar");
    const events = await response.json();
    const eventFeed = document.getElementById("eventFeed");

    eventFeed.innerHTML = events.map(event => `
      <div>
        <img src="assets/user-avatar.png" alt="User Avatar">
        <h3>${event.title}</h3>
        <p>${event.date}</p>
        <p>${event.description}</p>
      </div>
    `).join("");
  } catch (error) {
    console.error("Error loading events:", error);
  }
}

// Carousel Logic for Gallery
async function loadGallery() {
  try {
    const response = await fetch("http://localhost:5000/api/gallery");
    const galleryItems = await response.json();
    const carouselTrack = document.querySelector(".carousel-track");

    carouselTrack.innerHTML = galleryItems.map(item => `
      <li>
        <img src="${item.url}" alt="Gallery Item">
      </li>
    `).join("");

    setupCarousel();
  } catch (error) {
    console.error("Error loading gallery:", error);
  }
}

function setupCarousel() {
  const track = document.querySelector(".carousel-track");
  const slides = Array.from(track.children);
  const nextButton = document.querySelector(".carousel-button.next");
  const prevButton = document.querySelector(".carousel-button.prev");

  let currentSlideIndex = 0;

  function updateCarousel(position) {
    track.style.transform = `translateX(-${position}%)`;
  }

  nextButton.addEventListener("click", () => {
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    updateCarousel(currentSlideIndex * 100);
  });

  prevButton.addEventListener("click", () => {
    currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    updateCarousel(currentSlideIndex * 100);
  });
}

// Load the gallery on page load
if (document.querySelector(".carousel-track")) {
  loadGallery();
}

// Ensure Admin Only Pages are Protected
if (window.location.pathname.includes("admin.html")) {
  if (!localStorage.getItem("isAdmin")) {
    alert("Access denied! Admins only.");
    window.location.href = "index.html";
  }
}
