/* =========================================================
   script.js — three small jobs:
   1. open/close the mobile menu
   2. switch between light and dark mode (and remember it)
   3. print the current year in the footer
   ========================================================= */

/* ---------- 1. Mobile menu ---------- */
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

function toggleMenu() {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
}

hamburger.addEventListener("click", toggleMenu);
hamburger.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toggleMenu();
  }
});

// Close the menu after a link is tapped
document.querySelectorAll(".nav-link").forEach((link) =>
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  })
);

/* ---------- 2. Dark mode ---------- */
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

function switchTheme(e) {
  const theme = e.target.checked ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

toggleSwitch.addEventListener("change", switchTheme, false);

// Load the visitor's saved choice, defaulting to dark
const savedTheme = localStorage.getItem("theme") || "dark";

document.documentElement.setAttribute("data-theme", savedTheme);
toggleSwitch.checked = savedTheme === "dark";

/* ---------- 3. Footer year ---------- */
document.querySelector("#datee").innerHTML = new Date().getFullYear();

/* ---------- Bonus: subtle border on the navbar once you scroll ---------- */
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 10);
});
