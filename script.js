// script.js
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const navLinks = document.getElementById("navLinks");
  const hamburger = document.getElementById("hamburger");
  const scrollProgress = document.getElementById("scrollProgress");
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const heroScrollHint = document.querySelector(".hero-scroll-hint");
  const yearSpan = document.getElementById("year");
  const themeToggle = document.getElementById("themeToggle");
  const sections = document.querySelectorAll("main .section[id]");
  const navAnchors = navLinks ? navLinks.querySelectorAll("a[href^='#']") : [];
  const rolePills = document.querySelectorAll(".role-pill");
  const rolePanels = document.querySelectorAll(".role-panel");
  const workFilters = document.getElementById("workFilters");
  const workCards = document.querySelectorAll(".work-card");
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  /* Year */
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  /* Theme handling */
  const THEME_KEY = "oa-portfolio-theme";

  const applyTheme = (theme) => {
    if (theme === "dark") {
      body.classList.add("theme-dark");
    } else {
      body.classList.remove("theme-dark");
    }
  };

  const storedTheme = window.localStorage.getItem(THEME_KEY);
  if (storedTheme) {
    applyTheme(storedTheme);
  } else {
    // Prefer system dark if available
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = body.classList.toggle("theme-dark");
      window.localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    });
  }

  /* Mobile nav */
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("open");
    });

    navAnchors.forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navLinks.classList.remove("open");
      });
    });
  }

  /* Smooth scroll for internal links */
  const smoothScrollTo = (targetId) => {
    const el = document.querySelector(targetId);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const offset = window.pageYOffset + rect.top - 72; // slight top offset
    window.scrollTo({
      top: offset < 0 ? 0 : offset,
      behavior: "smooth",
    });
  };

  document.querySelectorAll("a[href^='#']").forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      smoothScrollTo(href);
    });
  });

  if (heroScrollHint) {
    const target = heroScrollHint.dataset.scrollTarget || "#about";
    heroScrollHint.addEventListener("click", () => smoothScrollTo(target));
  }

  /* Scroll progress + scroll-top visibility + active nav link */
  const handleScroll = () => {
    const scrollY = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    if (scrollProgress) {
      scrollProgress.style.width = `${progress}%`;
    }

    if (scrollTopBtn) {
      if (scrollY > 400) {
        scrollTopBtn.classList.add("visible");
      } else {
        scrollTopBtn.classList.remove("visible");
      }
    }

    // Active section in nav
    let currentId = null;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const offsetTop = rect.top + window.pageYOffset;
      if (scrollY >= offsetTop - 120 && scrollY < offsetTop + section.offsetHeight - 130) {
        currentId = section.id;
      }
    });

    if (currentId && navAnchors.length) {
      navAnchors.forEach((link) => {
        const href = link.getAttribute("href");
        if (!href) return;
        const id = href.replace("#", "");
        if (id === currentId) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
    }
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll();

  /* Scroll to top button */
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* Reveal animations */
  const revealSections = document.querySelectorAll(".section.reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");

          // Staggered animation for research cards
          if (entry.target.id === "research") {
            const cards = entry.target.querySelectorAll(".research-card");
            cards.forEach((card, index) => {
              card.style.transitionDelay = `${index * 80}ms`;
            });
          }
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -80px 0px",
    }
  );

  revealSections.forEach((section) => io.observe(section));

  /* Role switcher */
  const setRole = (role) => {
    rolePills.forEach((pill) => {
      pill.classList.toggle("is-active", pill.dataset.role === role);
    });
    rolePanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.rolePanel === role);
    });
  };

  if (rolePills.length && rolePanels.length) {
    rolePills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const role = pill.dataset.role;
        if (!role) return;
        setRole(role);
      });
    });
  }

  /* Work filters */
  if (workFilters && workCards.length) {
    const filterButtons = workFilters.querySelectorAll(".chip");

    const applyFilter = (filter) => {
      filterButtons.forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.filter === filter);
      });

      workCards.forEach((card) => {
        const type = card.dataset.type || "all";
        const show = filter === "all" || filter === type;
        card.style.display = show ? "flex" : "none";
      });
    };

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter || "all";
        applyFilter(filter);
      });
    });

    // Default
    applyFilter("all");
  }

  /* Contact form (front-end only) */
  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("name")?.value.trim();
      const email = document.getElementById("email")?.value.trim();
      const message = document.getElementById("message")?.value.trim();

      if (!name || !email || !message) {
        formStatus.textContent = "Please fill in all fields.";
        formStatus.style.color = "#ef4444";
        return;
      }

      formStatus.textContent = "Sending (demo)...";
      formStatus.style.color = "#6b7280";

      setTimeout(() => {
        formStatus.textContent =
          "✓ Message sent (demo). For real projects, please follow up via email or LinkedIn.";
        formStatus.style.color = "#16a34a";
        contactForm.reset();
      }, 1000);
    });
  }

  /* Subtle page fade-in */
  body.style.opacity = "0";
  body.style.transition = "opacity 0.4s ease";
  requestAnimationFrame(() => {
    body.style.opacity = "1";
  });

  console.log("✨ Modern portfolio loaded with role switcher, filters and theme toggle.");
});
