// Dark Mode Toggle
document.getElementById("darkModeToggle")?.addEventListener("change", (e) => {
  document.body.classList.toggle("dark-mode", e.target.checked);
  localStorage.setItem("darkMode", e.target.checked);
});

// Apply dark mode on page load
window.addEventListener("DOMContentLoaded", () => {
  const isDarkMode = JSON.parse(localStorage.getItem("darkMode"));
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) darkModeToggle.checked = true;
  }
});

// Login Functionality
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

// Logout Functionality
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
  }
}

// Post Testimony
document.getElementById("postTestimony")?.addEventListener("click", () => {
  const testimonyText = document.getElementById("testimonyText").value;

  if (testimonyText.trim() === "") {
    alert("Testimony cannot be empty!");
    return;
  }

  const testimonyContainer = document.querySelector(".testimony-container:last-of-type");
  const newTestimony = document.createElement("div");
  newTestimony.classList.add("testimony-item");
  newTestimony.innerHTML = `
    <p>"${testimonyText}"</p>
    <small>- Anonymous</small>
  `;
  testimonyContainer.appendChild(newTestimony);
  document.getElementById("testimonyText").value = ""; // Clear input
});

// Load Gallery
async function loadGallery() {
  try {
    const response = await fetch("http://localhost:5000/api/gallery");
    const galleryItems = await response.json();
    const galleryContainer = document.querySelector(".gallery");

    galleryContainer.innerHTML = galleryItems
      .map(
        (item) => `
      <div class="gallery-item">
        <img src="${item.url}" alt="${item.title}">
        <p>${item.title}</p>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error loading gallery:", error);
  }
}

// Calendar Navigation and Data
const calendarBody = document.getElementById("calendarBody");
const currentMonthYear = document.getElementById("currentMonthYear");

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function updateCalendar(month, year) {
  const firstDay = new Date(year, month).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendarBody.innerHTML = "";
  currentMonthYear.textContent = `${new Date(year, month).toLocaleString("default", {
    month: "long",
  })} ${year}`;

  let date = 1;
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("tr");

    for (let j = 0; j < 7; j++) {
      const cell = document.createElement("td");

      if (i === 0 && j < firstDay) {
        row.appendChild(cell);
      } else if (date > daysInMonth) {
        break;
      } else {
        cell.textContent = date;
        cell.addEventListener("click", () => showDayInfo(date, month, year));
        row.appendChild(cell);
        date++;
      }
    }

    calendarBody.appendChild(row);
  }
}

function showDayInfo(day, month, year) {
  const selectedDate = document.getElementById("selectedDate");
  const eventDetails = document.getElementById("eventDetails");

  selectedDate.textContent = `Selected Date: ${day}/${month + 1}/${year}`;
  eventDetails.innerHTML = "<p>No events for this day.</p>";
}

// Event Listeners for Calendar
document.getElementById("prevMonth")?.addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  updateCalendar(currentMonth, currentYear);
});

document.getElementById("nextMonth")?.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  updateCalendar(currentMonth, currentYear);
});

// Initialize Calendar on Page Load
if (calendarBody) {
  updateCalendar(currentMonth, currentYear);
}

// Initialize Gallery on Page Load
if (document.querySelector(".gallery")) {
  loadGallery();
}

// Initialize Events on Homepage
if (document.getElementById("eventFeed")) {
  loadAllEvents();
}
