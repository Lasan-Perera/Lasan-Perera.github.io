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

/* ---------- Bonus: scroll progress bar + back-to-top button ---------- */
const scrollProgress = document.querySelector("#scrollProgress");
const backToTop = document.querySelector("#backToTop");

function updateScrollUI() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (scrollProgress) scrollProgress.style.width = `${progress}%`;
  if (backToTop) backToTop.classList.toggle("visible", scrollTop > 400);
}

window.addEventListener("scroll", updateScrollUI);
updateScrollUI();

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------- Bonus: active nav-link highlighting while scrolling ---------- */
const spyLinks = document.querySelectorAll(".nav-link[href^='#']:not(.btn)");
const spySections = new Map();

spyLinks.forEach((link) => {
  const section = document.querySelector(link.getAttribute("href"));
  if (section) spySections.set(section, link);
});

if (spySections.size && "IntersectionObserver" in window) {
  const navSpyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = spySections.get(entry.target);
        if (!link || !entry.isIntersecting) return;
        spyLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );

  spySections.forEach((_, section) => navSpyObserver.observe(section));
}

/* ---------- Bonus: copy-to-clipboard with a toast ---------- */
const toast = document.querySelector("#toast");
let toastTimer = null;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 1800);
}

document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard!");
    } catch {
      showToast("Couldn't copy — please copy manually");
    }
  });
});

document.documentElement.classList.add("js-enabled");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 4. Honeycomb profile picture ---------- */
function buildHexAvatar(container, size, radius) {
  const imgSrc = container.dataset.src;
  const img = new Image();

  img.onload = () => {
    const s = size / (3 * radius + 2); // small-hex "radius" (center to corner)
    const hexW = 2 * s;
    const hexH = Math.sqrt(3) * s;
    const tiles = [];

    for (let q = -radius; q <= radius; q++) {
      for (let r = -radius; r <= radius; r++) {
        const hexDist = (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
        if (hexDist > radius) continue;
        tiles.push({
          q,
          r,
          dist: hexDist,
          x: s * 1.5 * q,
          y: s * Math.sqrt(3) * (r + q / 2),
        });
      }
    }

    const minX = Math.min(...tiles.map((t) => t.x)) - hexW / 2;
    const minY = Math.min(...tiles.map((t) => t.y)) - hexH / 2;
    const maxX = Math.max(...tiles.map((t) => t.x)) + hexW / 2;
    const maxY = Math.max(...tiles.map((t) => t.y)) + hexH / 2;
    const width = maxX - minX;
    const height = maxY - minY;

    container.style.width = `${width}px`;
    container.style.height = `${height}px`;

    // Cover-fit the photo across the whole mosaic, same math as CSS background-size: cover
    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const bgW = img.naturalWidth * scale;
    const bgH = img.naturalHeight * scale;
    const bgOffsetX = (width - bgW) / 2;
    const bgOffsetY = (height - bgH) / 2;

    const fragment = document.createDocumentFragment();

    // Particles fly in from random points anywhere across the screen, not just
    // just outside the avatar, so the mosaic reads as "assembling from everywhere"
    const viewportDiag = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);

    tiles.forEach((t) => {
      const left = t.x - minX - hexW / 2;
      const top = t.y - minY - hexH / 2;
      const randomAngle = Math.random() * Math.PI * 2;
      const scatterDist = viewportDiag * (0.45 + Math.random() * 0.55);

      const tile = document.createElement("div");
      tile.className = "hex-tile";
      tile.style.left = `${left}px`;
      tile.style.top = `${top}px`;
      tile.style.width = `${hexW + 1}px`;
      tile.style.height = `${hexH + 1}px`;
      tile.style.backgroundImage = `url('${imgSrc}')`;
      tile.style.backgroundSize = `${bgW}px ${bgH}px`;
      tile.style.backgroundPosition = `${bgOffsetX - left}px ${bgOffsetY - top}px`;
      tile.style.setProperty("--dx", `${Math.cos(randomAngle) * scatterDist}px`);
      tile.style.setProperty("--dy", `${Math.sin(randomAngle) * scatterDist}px`);
      tile.style.setProperty("--drot", `${Math.random() * 180 - 90}deg`);
      tile.style.setProperty("--delay", `${Math.random() * 0.3}s`);
      fragment.appendChild(tile);
    });

    container.appendChild(fragment);
    container.classList.add("built");

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      container.classList.add("active");
      return;
    }

    const avatarObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            container.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    avatarObserver.observe(container);

    // Click (or Enter/Space) replays the assemble animation
    function replay() {
      if (prefersReducedMotion) return;
      container.classList.add("resetting");
      container.classList.remove("active");
      void container.offsetWidth; // force reflow so the reset applies before re-animating
      container.classList.remove("resetting");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => container.classList.add("active"));
      });
    }

    container.style.cursor = "pointer";
    container.setAttribute("tabindex", "0");
    container.setAttribute("title", "Click to replay");
    container.addEventListener("click", replay);
    container.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        replay();
      }
    });
  };

  // Falls back to the plain circular photo already in the DOM if this fails
  img.src = imgSrc;
}

const hexAvatar = document.querySelector("#hexAvatar");

if (hexAvatar) buildHexAvatar(hexAvatar, 150, 6);

/* ---------- 5. Scroll-reveal animations ---------- */

// Mark up the groups of elements that should animate in as the page scrolls
const revealGroups = [
  { selector: "#about .content-text", direction: "" },
  { selector: "#about .skill-group", direction: "" },
  { selector: "#publications .content-text", direction: "" },
  { selector: ".publication", direction: "" },
  { selector: "#experience .content-text", direction: "" },
  { selector: ".timeline-item", direction: "reveal-left" },
  { selector: "#projects .content-text", direction: "" },
  { selector: "#projects .card", direction: "reveal-3d" },
  { selector: "#awards .content-text", direction: "" },
  { selector: ".award", direction: "" },
];

revealGroups.forEach(({ selector, direction }) => {
  document.querySelectorAll(selector).forEach((el, index) => {
    el.classList.add("reveal");
    if (direction) el.classList.add(direction);
    // Small stagger so groups of cards/items don't all pop in at once
    el.style.setProperty("--reveal-delay", `${Math.min(index, 6) * 0.08}s`);
  });
});

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("active"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add("active");
          observer.unobserve(el);
          // Once settled, drop the reveal classes so elements that define their
          // own hover transition (.card, .award, .content-text h2) get it back
          // instead of it staying overridden by the reveal transition forever.
          setTimeout(() => {
            el.classList.remove("reveal", "reveal-left", "reveal-right", "reveal-3d", "active");
          }, 1400);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
}

/* ---------- 6. Animated stat counters ---------- */
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || "";
  if (Number.isNaN(target)) return;

  if (prefersReducedMotion) {
    el.textContent = target + suffix;
    return;
  }

  const duration = 1200;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

const statEls = document.querySelectorAll(".stat strong[data-count]");

if (statEls.length && "IntersectionObserver" in window) {
  const statObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statEls.forEach((el) => statObserver.observe(el));
} else {
  statEls.forEach((el) => animateCount(el));
}

/* ---------- Bonus: project image + details lightbox ---------- */
const lightbox = document.querySelector("#lightbox");
const lightboxImg = document.querySelector("#lightboxImg");
const lightboxBadge = document.querySelector("#lightboxBadge");
const lightboxTitle = document.querySelector("#lightboxTitle");
const lightboxTech = document.querySelector("#lightboxTech");
const lightboxDesc = document.querySelector("#lightboxDesc");
const lightboxHighlights = document.querySelector("#lightboxHighlights");
const lightboxTags = document.querySelector("#lightboxTags");
const lightboxLinks = document.querySelector("#lightboxLinks");
const lightboxClose = document.querySelector("#lightboxClose");
let lightboxTrigger = null;

// Small inline icons for the link buttons in the detail view — kept minimal
// so we don't need a brand icon for every possible host (Drive, Canva, ...).
const LIGHTBOX_LINK_ICONS = {
  github:
    '<svg viewBox="0 0 496 512" aria-hidden="true" focusable="false"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"/></svg>',
  youtube:
    '<svg viewBox="0 0 576 512" aria-hidden="true" focusable="false"><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/></svg>',
  link:
    '<svg viewBox="0 0 512 512" aria-hidden="true" focusable="false"><path d="M432 320h-32a16 16 0 0 0 -16 16V456H64V152H208a16 16 0 0 0 16-16V104a16 16 0 0 0 -16-16H48A48 48 0 0 0 0 136V464a48 48 0 0 0 48 48H376a48 48 0 0 0 48-48V336a16 16 0 0 0 -16-16zM488 0H360c-21.37 0-32.05 25.91-17 41l35.73 35.73L135.29 320.29a24 24 0 0 0 0 33.94l22.48 22.48a24 24 0 0 0 33.94 0L435.28 133.28 471 169c15.06 15.06 41 4.38 41-17V24A24 24 0 0 0 488 0z"/></svg>',
};

// Curated write-ups pulled from each project's README / the CV — keyed by
// the exact title shown on the card. Anything not listed here still opens
// the lightbox with whatever the card itself has (title/tech/description
// scraped from the DOM, plus a single GitHub link if the card has one).
const PROJECT_DETAILS = {
  "6-DOF Robotic Arm": {
    badge: "Active Development",
    stack: ["STM32H743", "SolidWorks", "Altium Designer", "MATLAB / Simscape", "Web Serial API", "AS5047P Encoders"],
    highlights: [
      "Tiered motor strategy: NEMA 23/24 with closed-loop CL57T/DM542 drivers on the high-torque base joints, NEMA 17 with silent TMC2209 drivers on the wrist.",
      "A single command drives the physical arm and a Simscape Multibody digital twin simultaneously, in sync, in real time.",
      "AS5047P absolute encoders on all six joints close the loop over SPI; a 2 kHz control loop runs on the STM32H743 at 420 MHz.",
      "Browser-native control panel built on the Web Serial API — no drivers or desktop app required.",
    ],
    links: [
      { label: "Design Files & CAD", href: "https://github.com/Lasan-Perera/6-dof-arm-neuralnexus/releases/tag/v1.0", icon: "github" },
      { label: "Firmware Repo", href: "https://github.com/Lasan-Perera/neuralnexusarm-codebase", icon: "github" },
      { label: "Pick & Place Demo", href: "https://drive.google.com/file/d/1faK7I7ZX_agUlC0IrAXy0S09C4y3s5h2/view?usp=sharing", icon: "link" },
      { label: "Full Progress Video", href: "https://drive.google.com/file/d/1Re87R6V8fl_Va-D2lkvHRHDZWcIKDiEP/view?usp=drive_link", icon: "link" },
    ],
  },
  "Fully Analog Line Follower": {
    stack: ["TCRT5000 x8", "LM324 Op-amps", "L293D", "4-Layer PCB"],
    highlights: [
      "Tracks a 3 cm white line on black with zero microcontroller and zero lines of code — every stage is discrete analog electronics.",
      "8-sensor IR array feeds a weighted-summation error signal: (weighted right) minus (weighted left).",
      "Analog PD control — the proportional term corrects position error, the derivative term damps oscillation.",
      "Fully analog PWM: a Schmitt-trigger/integrator triangular-wave generator compared against the control voltage, diode-clamped to a unipolar drive signal.",
      "4-layer PCB with a dedicated ground plane and separated motor-power routing to keep the analog stages quiet.",
    ],
    links: [{ label: "GitHub Repo", href: "https://github.com/Lasan-Perera/fully-analog-line-follower", icon: "github" }],
  },
  "Smart Infusion Pump Monitor": {
    badge: "Finalist — Startup Spark 2.0 & Pitch Arena 2025",
    stack: ["ESP32", "Python (REST API)", "React.js", "OLED + 7-Segment"],
    highlights: [
      "IR beam-interruption drop sensing, chosen after evaluating a vision-based approach against frame-rate, optics and MCU limits.",
      "Interrupt-driven firmware: real-time drops-per-minute calculation, circular buffering, non-blocking three-state alarm (Normal / Warning / Critical).",
      "IoT dashboard for ward-level visibility — live graphs and historical logging over Wi-Fi, aimed at resource-limited hospital settings.",
      "Battery-backed operation via TP4056 charging, in a custom 3D-printed enclosure.",
    ],
    links: [{ label: "GitHub Repo", href: "https://github.com/Lasan-Perera/adaptive-gravity-based-infusion-pump", icon: "github" }],
  },
  "Multi-Task Autonomous Robot — SLRC 2026": {
    badge: "Champions — Sri Lanka Robotics Challenge 2026",
    stack: ["4-DOF Arm", "AprilTag Detection", "Colour Sorting", "Wall Navigation"],
    highlights: [
      "Complete hardware platform designed from scratch for the 2026 competition arena.",
      "4-DOF robotic arm with an onboard box-storage unit for pick, sort and place tasks.",
      "Detects and sorts boxes by colour, reads AprilTags for identification and task sequencing, and navigates by wall-following.",
      "Won the Championship of Sri Lanka Robotics Challenge 2026, organised by the University of Moratuwa.",
    ],
    links: [{ label: "GitHub Profile", href: "https://github.com/Lasan-Perera", icon: "github" }],
  },
  "Multi-Task Autonomous Robot — SLRC 2025": {
    badge: "Finalists — Sri Lanka Robotics Challenge 2025",
    stack: ["2-DOF Arm", "Water System", "Colour Sorting", "Grid Following"],
    highlights: [
      "Complete hardware platform combining a 2-DOF robotic arm with a water storage unit and pumping arm.",
      "Grabs, stores and sorts ping-pong balls by colour while following a grid and detecting walls.",
      "Finalists at Sri Lanka Robotics Challenge 2025, organised by the University of Moratuwa.",
    ],
    links: [{ label: "GitHub Profile", href: "https://github.com/Lasan-Perera", icon: "github" }],
  },
  "Reconfigurable Mobile Robot": {
    stack: ["ROS 2 Humble", "ros2_control", "Gazebo", "Nav2 (planned)"],
    highlights: [
      "Physically reconfigures between a wide 4-wheel stance and a compact 2-wheel differential-drive stance by folding an actuated wheel pair.",
      "Each folding wheel is a two-joint kinematic chain — a hinge fold joint (0–90°) kept separate from the continuous drive/spin joint — so folding and driving never conflict.",
      "A dedicated ROS 2 node sequences reconfiguration: deactivate the active drive controller, command the fold joints, wait for completion, then activate the matching controller via ros2_control's switch_controller service.",
      "Modular URDF/Xacro description and Gazebo physics built from scratch; a SLAM + Nav2 navigation pipeline is in progress.",
    ],
    links: [{ label: "GitHub Repo", href: "https://github.com/Lasan-Perera/reconfigurable-mobile-robot", icon: "github" }],
  },
  "DropToPrint — 3D Printer WiFi Automation": {
    stack: ["ESP32-S3", "ESP-IDF", "USB OTG (CDC-ACM VCP)", "Custom SMD PCB"],
    highlights: [
      "Adds WiFi connectivity and automation to legacy, non-networked 3D printers without any extra external hardware.",
      "Firmware written in ESP-IDF using USB OTG in CDC-ACM VCP mode, so the ESP32-S3 talks to the printer's existing serial protocol directly.",
      "Web-based UI for remote control, paired with a fully SMD, market-ready PCB design.",
    ],
    links: [{ label: "GitHub Profile", href: "https://github.com/Lasan-Perera", icon: "github" }],
  },
  "MazeRunner V1–V3 — Micromouse Robot": {
    badge: "Champions — MazeMaster 2026",
    stack: ["STM32F411CEU6", "ICM-20602 IMU", "Encoder Motors", "Custom PCB"],
    highlights: [
      "Three hardware generations (V1–V3) built for speed, stability and accurate maze-solving.",
      "Complete hardware platform — motor drivers, PCB and an STM32F411CEU6 — integrated with encoder motors and an ICM-20602 IMU for fast, sharp-turn runs.",
      "Champions, MazeMaster 2026. 1st runner-up, InnovMind 2026. 2nd runner-up, MicroMaze 2.0 and RoboFest 2025.",
    ],
    links: [{ label: "GitHub Profile", href: "https://github.com/Lasan-Perera", icon: "github" }],
  },
  "Project Phoenix — Cube Satellite": {
    badge: "Ongoing",
    stack: ["ADCS", "High-Altitude Balloon"],
    highlights: [
      "Stage 1 launches a high-altitude balloon into the stratosphere as a precursor test platform.",
      "Batch coordinator for the project, and a member of the Attitude Determination and Control Subsystem (ADCS) team.",
    ],
    links: [{ label: "GitHub Profile", href: "https://github.com/Lasan-Perera", icon: "github" }],
  },
  "Multi-Task Autonomous Robot (EN2533)": {
    stack: ["Arduino Mega", "NEMA 17 + DRV8825", "TCS34725", "C++"],
    highlights: [
      "Built for EN2533 Robot Design and Competition — challenges announced two months out: line following, maze solving, box handling, ramp climbing, dashed-line navigation, barcode detection, ball pickup, wall following, arrow-based navigation and ball shooting.",
      "Hardware: Arduino Mega Mini, an 8-channel TCRT5000 reflective sensor array, two NEMA 17 steppers on DRV8825 drivers, a TCS34725 colour sensor, five SHARP IR distance sensors and three obstacle-avoidance IR modules.",
      "C++ firmware built in the Arduino IDE (AccelStepper/MultiStepper, Adafruit TCS34725/SSD1306) driving fully autonomous navigation and task execution.",
    ],
    links: [
      { label: "GitHub Repo", href: "https://github.com/Lasan-Perera/EN2533_Team_MarshMello", icon: "github" },
      { label: "Watch Demo", href: "https://youtu.be/oBLyfxPuTzA", icon: "youtube" },
    ],
  },
  "Net-Warden — Network Manager": {
    badge: "Finalist — HackVenture 1.0",
    stack: ["Node.js", "MySQL", "Ubuntu"],
    highlights: [
      "Home/SOHO network manager that monitors per-device usage and throttles connections once they exceed an allocated data limit.",
      "Node.js backend with a MySQL store for usage history, plus a web interface for setting and reviewing limits.",
      "Finalist at HackVenture 1.0, organised by the University of Kelaniya.",
    ],
    links: [{ label: "GitHub Profile", href: "https://github.com/Lasan-Perera", icon: "github" }],
  },
  "Analog PID DC Motor Speed Controller": {
    stack: ["TL072 Op-amps", "IRLZ44N MOSFET", "Analog PID", "Frequency-to-Voltage"],
    highlights: [
      "Closed-loop DC motor speed control with zero microcontrollers or digital signal processing — feedback acquisition through PWM generation is entirely op-amps and discrete power electronics.",
      "Designed the sensing/feedback stage: a custom frequency-to-voltage converter with a precision rectifier that turns encoder pulses into a proportional analog voltage.",
      "PWM is generated by a Schmitt-trigger oscillator driving an integrator and voltage comparator; an IRLZ44N logic-level MOSFET drives the motor.",
      "Built as part of Team Neural Nexus.",
    ],
    links: [
      { label: "GitHub Repo", href: "https://github.com/denethp/fully-analog-dc-motor-speed-controller", icon: "github" },
      { label: "Project Presentation", href: "https://canva.link/gsjmjxzgy5exvvy", icon: "link" },
    ],
  },
};

function extractCardImageUrl(card) {
  const bg = card.style.backgroundImage;
  const match = bg && bg.match(/url\(["']?(.*?)["']?\)/);
  return match ? match[1] : null;
}

function fillList(el, items, render) {
  if (!el) return;
  el.innerHTML = "";
  const list = items || [];
  list.forEach((item) => el.appendChild(render(item)));
  el.hidden = list.length === 0;
}

function openLightbox(project, trigger) {
  if (!lightbox || !lightboxImg) return;
  const lightboxPanel = lightbox.querySelector(".lightbox-panel");
  const lightboxMedia = lightbox.querySelector(".lightbox-media");
  const hasImage = Boolean(project.image);
  if (lightboxMedia) lightboxMedia.hidden = !hasImage;
  if (lightboxPanel) lightboxPanel.classList.toggle("no-media", !hasImage);
  if (hasImage) {
    lightboxImg.src = project.image;
    lightboxImg.alt = project.title;
  }
  if (lightboxTitle) lightboxTitle.textContent = project.title;
  if (lightboxTech) lightboxTech.textContent = project.tech;
  if (lightboxDesc) lightboxDesc.textContent = project.description;

  if (lightboxBadge) {
    lightboxBadge.textContent = project.badge || "";
    lightboxBadge.hidden = !project.badge;
  }

  fillList(lightboxHighlights, project.highlights, (text) => {
    const li = document.createElement("li");
    li.textContent = text;
    return li;
  });

  fillList(lightboxTags, project.stack, (text) => {
    const li = document.createElement("li");
    li.textContent = text;
    return li;
  });

  fillList(lightboxLinks, project.links, (link) => {
    const a = document.createElement("a");
    a.href = link.href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "btn btn-outline lightbox-link";
    a.innerHTML = `${LIGHTBOX_LINK_ICONS[link.icon] || LIGHTBOX_LINK_ICONS.link} ${link.label}`;
    return a;
  });

  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  lightboxTrigger = trigger;
  if (lightboxClose) lightboxClose.focus();
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lightboxTrigger) lightboxTrigger.focus();
}

document.querySelectorAll("#projects .card").forEach((card) => {
  const url = extractCardImageUrl(card);

  card.classList.add("is-clickable");
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");

  const titleEl = card.querySelector(".project-bio h3");
  const techEl = card.querySelector(".project-bio p");
  const descEl = card.querySelector(".card-detail");
  const githubEl = card.querySelector(".project-link a");
  const title = titleEl ? titleEl.textContent.trim() : "";
  const details = PROJECT_DETAILS[title] || {};

  const project = {
    image: url,
    title,
    tech: techEl ? techEl.textContent.trim() : "",
    description: descEl ? descEl.textContent.trim() : "",
    badge: details.badge,
    stack: details.stack,
    highlights: details.highlights,
    links: details.links || (githubEl ? [{ label: "View on GitHub", href: githubEl.href, icon: "github" }] : []),
  };

  function trigger(e) {
    if (e.target.closest(".project-link")) return;
    openLightbox(project, card);
  }

  card.addEventListener("click", trigger);
  card.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && !e.target.closest(".project-link")) {
      e.preventDefault();
      openLightbox(project, card);
    }
  });
});

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);

if (lightbox) {
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox && lightbox.classList.contains("open")) {
    closeLightbox();
  }
});

/* ---------- Contact details modal ---------- */
const contactModal = document.querySelector("#contactModal");
const contactModalOpen = document.querySelector("#contactModalOpen");
const contactModalClose = document.querySelector("#contactModalClose");

function openContactModal() {
  if (!contactModal) return;
  contactModal.classList.add("open");
  contactModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  if (contactModalClose) contactModalClose.focus();
}

function closeContactModal() {
  if (!contactModal) return;
  contactModal.classList.remove("open");
  contactModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (contactModalOpen) contactModalOpen.focus();
}

/* ---------- Race-car launch on the nav CTAs ----------
   The button revs, tears off to the right, then the action fires and it slides
   back into place. Skipped on the mobile dropdown, where the menu is already
   sliding away underneath it, and whenever reduced motion is requested. */
const LAUNCH_MS = 500;

function launchThen(el, action) {
  if (!el || prefersReducedMotion || window.innerWidth <= 670) {
    action();
    return;
  }

  el.classList.remove("btn-return");
  el.classList.add("btn-launch");
  document.documentElement.classList.add("btn-flying"); // suppress h-scrollbar

  setTimeout(() => {
    action();
    el.classList.remove("btn-launch");
    void el.offsetWidth; // reflow, so the return animation restarts cleanly
    el.classList.add("btn-return");
    setTimeout(() => {
      el.classList.remove("btn-return");
      document.documentElement.classList.remove("btn-flying");
    }, 400);
  }, LAUNCH_MS);
}

if (contactModalOpen) {
  contactModalOpen.addEventListener("click", () => {
    launchThen(contactModalOpen, openContactModal);
  });
}

const requestCvBtn = document.querySelector('.nav-menu a[href*="drive.google.com"]');

if (requestCvBtn) {
  requestCvBtn.addEventListener("click", (e) => {
    // Leave modified clicks (ctrl/cmd/middle) to the browser so "open in new
    // tab" keeps working.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (prefersReducedMotion || window.innerWidth <= 670) return; // native nav

    e.preventDefault();
    const url = requestCvBtn.href;
    launchThen(requestCvBtn, () => {
      // Opening a tab this long after the click can trip a popup blocker —
      // fall back to same-tab navigation if it does.
      const win = window.open(url, "_blank", "noopener");
      if (!win) window.location.href = url;
    });
  });
}

if (contactModalClose) contactModalClose.addEventListener("click", closeContactModal);

if (contactModal) {
  contactModal.addEventListener("click", (e) => {
    if (e.target === contactModal) closeContactModal();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && contactModal && contactModal.classList.contains("open")) {
    closeContactModal();
  }
});

/* ---------- Bonus: a little something for anyone poking at devtools ---------- */
console.log(
  "%cHi, fellow engineer 👋",
  "font-size: 18px; font-weight: bold; color: #ffcd42;"
);
console.log(
  "%cLooking under the hood? I like that.\nLet's build something — lasanperera.lsp@gmail.com",
  "font-size: 13px; color: #a8a8a8;"
);
