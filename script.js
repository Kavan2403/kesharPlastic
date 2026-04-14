const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const navbar = document.querySelector(".navbar");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
menuBtn.setAttribute("aria-expanded", "false");

menuBtn.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("show");
  menuBtn.setAttribute("aria-expanded", String(isOpen));
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("show");
    menuBtn.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("click", (event) => {
  if (!mobileMenu.classList.contains("show")) return;
  const clickInsideMenu = mobileMenu.contains(event.target);
  const clickOnButton = menuBtn.contains(event.target);
  if (!clickInsideMenu && !clickOnButton) {
    mobileMenu.classList.remove("show");
    menuBtn.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobileMenu.classList.contains("show")) {
    mobileMenu.classList.remove("show");
    menuBtn.setAttribute("aria-expanded", "false");
  }
});

const syncNavbarState = () => {
  navbar.classList.toggle("scrolled", window.scrollY > 20);
};

syncNavbarState();
window.addEventListener("scroll", syncNavbarState, { passive: true });

const revealEls = document.querySelectorAll(".reveal");
revealEls.forEach((el, index) => {
  const delay = Math.min(index * 70, 560);
  el.style.setProperty("--reveal-delay", `${delay}ms`);
});

if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });

  revealEls.forEach((el) => revealObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

const counters = document.querySelectorAll(".counter");
let counterStarted = false;

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const animateCounter = (el) => {
  const target = Number.parseInt(el.getAttribute("data-target"), 10);
  const duration = 1700;
  const startTime = performance.now();

  const update = (now) => {
    const linearProgress = Math.min((now - startTime) / duration, 1);
    const easedProgress = easeOutCubic(linearProgress);
    const value = Math.floor(easedProgress * target);
    el.textContent = `${value}+`;
    if (linearProgress < 1) requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
};

const statsSection = document.querySelector(".stats");
const runCounters = () => {
  if (counterStarted) return;
  counterStarted = true;
  counters.forEach((counter) => animateCounter(counter));
};

if (prefersReducedMotion) {
  counters.forEach((counter) => {
    counter.textContent = `${counter.getAttribute("data-target")}+`;
  });
} else if (statsSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) runCounters();
    });
  }, { threshold: 0.32 });

  statsObserver.observe(statsSection);
}

const heroVisual = document.querySelector(".hero-visual");
if (heroVisual && !prefersReducedMotion) {
  let rafId = null;
  const updateTilt = (event) => {
    if (window.innerWidth < 920) return;
    const rect = heroVisual.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateY = (x - 0.5) * 4;
    const rotateX = (0.5 - y) * 3;
    heroVisual.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
  };

  heroVisual.addEventListener("mousemove", (event) => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => updateTilt(event));
  });

  heroVisual.addEventListener("mouseleave", () => {
    heroVisual.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  });
}

document.getElementById("leadForm").addEventListener("submit", (event) => {
  event.preventDefault();
  alert("Thank you! Your enquiry has been received. Our team will contact you shortly.");
  event.target.reset();
});

document.getElementById("year").textContent = new Date().getFullYear();
