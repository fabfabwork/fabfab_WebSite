document.addEventListener("DOMContentLoaded", () => {

  // ── Loader ────────────────────────────────────────────────
  const loader = document.getElementById("loader");
  if (loader) {
    window.addEventListener("load", () => {
      loader.classList.add("hidden");
    });
    // fallback: hide after 3s even if load never fires
    setTimeout(() => loader.classList.add("hidden"), 3000);
  }

  // ── Contact Form ──────────────────────────────────────────
  const form = document.getElementById("contactForm");
  if (form) {
    const name    = document.getElementById("name");
    const email   = document.getElementById("email");
    const message = document.getElementById("message");

    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    function error(el, state) {
      el.style.border = state ? "2px solid red" : "";
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      let valid = true;

      if (!name.value.trim())                { error(name,    true);  valid = false; } else error(name,    false);
      if (!isValidEmail(email.value.trim())) { error(email,   true);  valid = false; } else error(email,   false);
      if (message.value.trim().length < 10)  { error(message, true);  valid = false; } else error(message, false);

      if (!valid) {
        swal({ title: "Please fill in all fields!", text: "Please complete all required fields correctly.", icon: "error", button: "I will fill them in!" });
        return;
      }

      const btn = form.querySelector("button[type='submit']");
      if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { "Accept": "application/json" }
        });

        if (response.ok) {
          swal({ title: "Thank you!", text: "Your message has been sent! I'll get back to you soon.", icon: "success", button: "Close" })
            .then(() => form.reset());
        } else {
          swal({ title: "Oops!", text: "Something went wrong. Please try again.", icon: "error", button: "Try again" });
        }
      } catch (err) {
        swal({ title: "No connection", text: "Check your internet and try again.", icon: "error", button: "Ok" });
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = "Send"; }
      }
    });

    window.resetForm = () => form.reset();
  }

  // ── Hamburger Menu ────────────────────────────────────────
  const hamburger  = document.getElementById("hamburger");
  const mainNav    = document.getElementById("mainNav");
  const navOverlay = document.getElementById("navOverlay");

  if (hamburger && mainNav && navOverlay) {
    function closeNav() {
      hamburger.classList.remove("open");
      mainNav.classList.remove("open");
      navOverlay.classList.remove("open");
    }

    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      mainNav.classList.toggle("open");
      navOverlay.classList.toggle("open");
    });

    navOverlay.addEventListener("click", closeNav);
    mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeNav));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });
  }

  // ── Portfolio Filter ──────────────────────────────────────
  const filterButtons = document.querySelectorAll(".filter-buttons button");
  const items         = document.querySelectorAll(".galleryblock div");
  const noResults     = document.getElementById("noResults");

  if (filterButtons.length) {
    filterButtons.forEach(button => {
      button.addEventListener("click", () => {
        const filter = button.getAttribute("data-filter");

        filterButtons.forEach(b => b.classList.remove("active"));
        button.classList.add("active");

        let visibleCount = 0;

        items.forEach(item => {
          const category = item.getAttribute("data-category");
          if (filter === "all" || !category || filter === category) {
            item.classList.remove("hide");
            visibleCount++;
          } else {
            item.classList.add("hide");
          }
        });

        if (noResults) {
          noResults.classList.toggle("visible", visibleCount === 0);
        }
      });
    });

    const allButton = document.querySelector('[data-filter="all"]');
    if (allButton) allButton.classList.add("active");
  }

  // ── Hover Overlay (inject dynamically) ───────────────────
  document.querySelectorAll(".galleryblock div").forEach(div => {
    const img   = div.querySelector("img");
    if (!img) return;

    const title = img.alt || "";
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.innerHTML = `
      <span class="overlay-title">${title}</span>
      <span class="overlay-icon">&#128065;</span>
    `;
    div.appendChild(overlay);
  });

  // ── Back to Top ───────────────────────────────────────────
  const backToTop       = document.getElementById("backToTop");
  const portfolioScroll = document.querySelector(".portfolio-container");

  if (backToTop && portfolioScroll) {
    portfolioScroll.addEventListener("scroll", () => {
      backToTop.classList.toggle("visible", portfolioScroll.scrollTop > 300);
    });

    backToTop.addEventListener("click", () => {
      portfolioScroll.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ── Lightbox ──────────────────────────────────────────────
  const lightbox        = document.getElementById("lightbox");
  const lightboxImg     = document.getElementById("lightboxImg");
  const lightboxClose   = document.getElementById("lightboxClose");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxPrev    = document.getElementById("lightboxPrev");
  const lightboxNext    = document.getElementById("lightboxNext");
  const lightboxSpinner = document.getElementById("lightboxSpinner");

  if (lightbox && lightboxImg && lightboxClose && lightboxCaption && lightboxPrev && lightboxNext) {
    const galleryImgs = Array.from(document.querySelectorAll(".galleryblock div img"));
    let currentIndex  = 0;

    function openLightbox(index) {
      currentIndex = index;
      const img  = galleryImgs[index];
      const link = img.getAttribute("data-link") || "";

      // show spinner, hide image until loaded
      if (lightboxSpinner) lightboxSpinner.classList.add("visible");
      lightboxImg.style.opacity = "0";

      lightboxImg.src             = img.src;
      lightboxCaption.textContent = img.alt || "";
      lightboxCaption.href        = link;

      lightboxCaption.style.pointerEvents = link ? "auto"    : "none";
      lightboxCaption.style.cursor        = link ? "pointer" : "default";

      lightbox.classList.add("open");
    }

    // hide spinner when image finishes loading
    lightboxImg.addEventListener("load", () => {
      if (lightboxSpinner) lightboxSpinner.classList.remove("visible");
      lightboxImg.style.opacity = "1";
      lightboxImg.style.transition = "opacity 0.3s ease";
    });

    function closeLightbox() {
      lightbox.classList.remove("open");
    }

    function navigate(direction) {
      const visible      = galleryImgs.filter(img => !img.closest("div").classList.contains("hide"));
      const visibleIndex = visible.indexOf(galleryImgs[currentIndex]);
      const newVisible   = (visibleIndex + direction + visible.length) % visible.length;
      currentIndex       = galleryImgs.indexOf(visible[newVisible]);
      openLightbox(currentIndex);
    }

    galleryImgs.forEach((img, index) => {
      img.style.cursor = "pointer";
      img.addEventListener("click", () => openLightbox(index));
    });

    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrev.addEventListener("click",  () => navigate(-1));
    lightboxNext.addEventListener("click",  () => navigate(1));

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape")     closeLightbox();
      if (e.key === "ArrowLeft")  navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    });

    // ── Swipe gestures ──────────────────────────────────────
    let touchStartX = 0;
    let touchStartY = 0;

    lightbox.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    lightbox.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;

      // only trigger if horizontal swipe is dominant
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        dx < 0 ? navigate(1) : navigate(-1);
      }
    }, { passive: true });
  }

});

// ── Age Gate ──────────────────────────────────────────────
  const ageGate  = document.getElementById("ageGate");
  const ageEnter = document.getElementById("ageEnter");
  const ageLeave = document.getElementById("ageLeave");

  if (ageGate) {
    // show gate unless already confirmed this session
    if (sessionStorage.getItem("ageVerified") === "yes") {
      ageGate.classList.add("hidden");
    }

    if (ageEnter) {
      ageEnter.addEventListener("click", () => {
        sessionStorage.setItem("ageVerified", "yes");
        ageGate.classList.add("hidden");
      });
    }

    if (ageLeave) {
      ageLeave.addEventListener("click", () => {
        window.location.href = "index.html";
      });
    }
  }

// ── Analytics ──────────────────────────────────────────────
  ageEnter.addEventListener("click", () => {
  sessionStorage.setItem("ageVerified", "yes");
  ageGate.classList.add("hidden");
  gtag("event", "age_verified", { event_category: "Age Gate", event_label: "Entered" });
});

ageLeave.addEventListener("click", () => {
  gtag("event", "age_refused", { event_category: "Age Gate", event_label: "Left" });
  window.location.href = "index.html";
});

if (response.ok) {
  gtag("event", "form_submit", { event_category: "Contact", event_label: "Success" });
  swal({ title: "Thank you!", ...
