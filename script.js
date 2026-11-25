(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Footer year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const toggle = $(".nav-toggle");
  const nav = $("#site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }));
  }

  // Reveal on scroll
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => revealObs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Active nav link
  const links = $$(".site-nav a");
  const sections = links
    .map((a) => $(a.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const navObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => navObs.observe(s));
  }

  // Hero cursor reveal: moves a soft light across the hidden layer
  const hidden = $(".hero-hidden");
  if (hidden && !reduceMotion) {
    hidden.addEventListener("pointermove", (e) => {
      const r = hidden.getBoundingClientRect();
      hidden.style.setProperty("--x", `${e.clientX - r.left}px`);
      hidden.style.setProperty("--y", `${e.clientY - r.top}px`);
    });
    // Touch: tap toggles the reveal instead of hover
    hidden.addEventListener("click", () => hidden.classList.toggle("is-touched"));
  }

  // Magnetic buttons (fine pointers only)
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.2;
        const y = (e.clientY - r.top - r.height / 2) * 0.2;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  // Contact form: posts to Formspree (replace YOUR_FORM_ID in index.html)
  const form = $(".contact-form");
  const status = $(".form-status");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = "Please fill in each field with a valid value.";
        return;
      }
      if (form.action.includes("YOUR_FORM_ID")) {
        status.textContent = "Contact form not configured yet. Please email directly.";
        return;
      }
      status.textContent = "Sending…";
      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          form.reset();
          status.textContent = "Thank you. Your message has been sent.";
        } else {
          throw new Error(res.statusText);
        }
      } catch {
        status.textContent = "Something went wrong. Please try again later.";
      }
    });
  }
})();
