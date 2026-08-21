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

/* ---------- Bonus: project image lightbox ---------- */
const lightbox = document.querySelector("#lightbox");
const lightboxImg = document.querySelector("#lightboxImg");
const lightboxCaption = document.querySelector("#lightboxCaption");
const lightboxClose = document.querySelector("#lightboxClose");
let lightboxTrigger = null;

function extractCardImageUrl(card) {
  const bg = card.style.backgroundImage;
  const match = bg && bg.match(/url\(["']?(.*?)["']?\)/);
  return match ? match[1] : null;
}

function openLightbox(url, caption, trigger) {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = url;
  lightboxImg.alt = caption;
  if (lightboxCaption) lightboxCaption.textContent = caption;
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
  if (!url) return;

  card.classList.add("has-photo");
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");

  const title = card.querySelector(".project-bio h3");
  const caption = title ? title.textContent.trim() : "";

  function trigger(e) {
    if (e.target.closest(".project-link")) return;
    openLightbox(url, caption, card);
  }

  card.addEventListener("click", trigger);
  card.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && !e.target.closest(".project-link")) {
      e.preventDefault();
      openLightbox(url, caption, card);
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

/* ---------- Bonus: a little something for anyone poking at devtools ---------- */
console.log(
  "%cHi, fellow engineer 👋",
  "font-size: 18px; font-weight: bold; color: #ffcd42;"
);
console.log(
  "%cLooking under the hood? I like that.\nLet's build something — lasanperera.lsp@gmail.com",
  "font-size: 13px; color: #a8a8a8;"
);
