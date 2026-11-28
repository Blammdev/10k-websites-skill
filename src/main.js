/* Costello Painting Inc. — interactions.
   No dependencies. Everything here is progressive: the page reads fine without it. */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");

  /* Header state on scroll ------------------------------------------------------ */
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile nav ----------------------------------------------------------------- */
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("is-locked", open);
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
        document.body.classList.remove("is-locked");
      }
    });
  }

  /* Hero parallax -------------------------------------------------------------- */
  var heroImg = document.querySelector(".hero__media img");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (heroImg && !reduced) {
    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = Math.min(window.scrollY, window.innerHeight);
          heroImg.style.transform = "scale(1.06) translateY(" + y * 0.16 + "px)";
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  /* Paint wash intensity tracks scroll ---------------------------------------- */
  var wash = document.getElementById("wash");
  if (wash) {
    window.addEventListener(
      "scroll",
      function () {
        var max = document.body.scrollHeight - window.innerHeight;
        var p = max > 0 ? window.scrollY / max : 0;
        wash.style.opacity = String(Math.min(0.9, p * 1.4));
      },
      { passive: true }
    );
  }

  /* Hero color chip ------------------------------------------------------------ */
  var colors = [
    { name: "Harbor Blue", c: "#2e4a5f" },
    { name: "Barn Red", c: "#7b3f34" },
    { name: "Brass Leaf", c: "#c9973f" },
    { name: "Canvas Cream", c: "#e7ddc9" },
    { name: "Pine Shade", c: "#3c5348" },
    { name: "Mulliken Clay", c: "#9c6b4f" }
  ];
  var colorIndex = 0;
  var colorBtn = document.getElementById("colorBtn");
  var colorName = document.getElementById("colorName");
  var swatches = document.querySelectorAll(".swatch-strip span");

  function paintColors() {
    if (!swatches.length) return;
    swatches.forEach(function (el, i) {
      el.style.setProperty("--c", colors[(colorIndex + i) % colors.length].c);
    });
    if (colorName) colorName.textContent = colors[colorIndex].name;
    document.documentElement.style.setProperty("--harbor", colors[colorIndex].c);
    document.querySelectorAll(".about__media-swatch").forEach(function (el) {
      el.style.background = colors[colorIndex].c;
    });
  }
  if (colorBtn) {
    paintColors();
    colorBtn.addEventListener("click", function () {
      colorIndex = (colorIndex + 1) % colors.length;
      paintColors();
    });
  }

  /* Services accordion --------------------------------------------------------- */
  var services = Array.prototype.slice.call(document.querySelectorAll(".service"));
  services.forEach(function (service) {
    var button = service.querySelector(".service__head");
    if (!button) return;
    button.addEventListener("click", function () {
      var isOpen = service.classList.contains("is-open");
      services.forEach(function (other) {
        other.classList.remove("is-open");
        var b = other.querySelector(".service__head");
        if (b) b.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        service.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* Stat counters -------------------------------------------------------------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !reduced) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = Number(el.getAttribute("data-count")) || 0;
          var start = performance.now();
          var duration = 1100;
          function step(now) {
            var t = Math.min(1, (now - start) / duration);
            var eased = 1 - Math.pow(1 - t, 3);
            el.textContent = String(Math.round(target * eased));
            if (t < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  /* Reveal on scroll ----------------------------------------------------------- */
  var revealItems = document.querySelectorAll("[data-reveal]");
  if (revealItems.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealItems.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Work filters --------------------------------------------------------------- */
  var chips = document.querySelectorAll(".chip");
  var workItems = document.querySelectorAll(".work__item");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-pressed", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-pressed", "true");
      var filter = chip.getAttribute("data-filter");
      workItems.forEach(function (item) {
        item.hidden = filter !== "all" && item.getAttribute("data-cat") !== filter;
      });
    });
  });

  /* Lightbox ------------------------------------------------------------------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCap = document.getElementById("lightboxCap");
  var lightboxClose = document.getElementById("lightboxClose");
  var lightboxPrev = document.getElementById("lightboxPrev");
  var lightboxNext = document.getElementById("lightboxNext");
  var gallery = [];
  var galleryIndex = 0;
  var lastFocused = null;

  function visibleWorkButtons() {
    return Array.prototype.filter.call(document.querySelectorAll(".work__item"), function (item) {
      return !item.hidden;
    }).map(function (item) {
      return item.querySelector("button");
    });
  }

  function showLightbox(index) {
    if (!gallery.length) return;
    galleryIndex = (index + gallery.length) % gallery.length;
    var btn = gallery[galleryIndex];
    lightboxImg.src = btn.getAttribute("data-full");
    lightboxImg.alt = btn.querySelector("img") ? btn.querySelector("img").alt : "";
    lightboxCap.textContent = btn.getAttribute("data-caption") || "";
    lightbox.hidden = false;
    document.body.classList.add("is-locked");
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove("is-locked");
    lightboxImg.src = "";
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll(".work__item button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      gallery = visibleWorkButtons();
      lastFocused = btn;
      showLightbox(gallery.indexOf(btn));
    });
  });

  if (lightbox) {
    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrev.addEventListener("click", function () {
      showLightbox(galleryIndex - 1);
    });
    lightboxNext.addEventListener("click", function () {
      showLightbox(galleryIndex + 1);
    });
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (event) {
      if (lightbox.hidden) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showLightbox(galleryIndex - 1);
      if (event.key === "ArrowRight") showLightbox(galleryIndex + 1);
    });
  }

  /* Quote form ----------------------------------------------------------------- */
  var form = document.getElementById("quoteForm");
  var success = document.getElementById("quoteSuccess");
  var preview = document.getElementById("quotePreview");
  var copyBtn = document.getElementById("copyQuote");
  var editBtn = document.getElementById("editQuote");
  var formWrap = document.getElementById("formWrap");
  var EMAIL = "costellopaintinginc@yahoo.com";

  function fieldError(name, show) {
    var input = form.querySelector("#" + name);
    if (!input) return;
    var wrap = input.closest(".field");
    var msg = form.querySelector('[data-error-for="' + name + '"]');
    if (wrap) wrap.classList.toggle("has-error", show);
    if (msg) msg.hidden = !show;
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function validate() {
    var ok = true;
    var name = form.name.value.trim();
    var phone = form.phone.value.trim();
    var email = form.email.value.trim();
    var service = form.service.value;

    fieldError("name", !name);
    if (!name) ok = false;

    var contactOk = phone.length >= 7 || validEmail(email);
    fieldError("phone", !contactOk);
    if (!contactOk) ok = false;

    var emailOk = validEmail(email);
    fieldError("email", !emailOk);
    if (!emailOk) ok = false;

    fieldError("service", !service);
    if (!service) ok = false;

    return ok ? { name: name, phone: phone, email: email, service: service, details: form.details.value.trim() } : null;
  }

  function buildMessage(data) {
    return [
      "Quote request — Costello Painting Inc.",
      "",
      "Name: " + data.name,
      "Phone: " + data.phone,
      "Email: " + data.email,
      "Service: " + data.service,
      "",
      "Project details:",
      data.details || "(no details provided)"
    ].join("\n");
  }

  if (form) {
    ["name", "phone", "email", "service"].forEach(function (id) {
      var el = form.querySelector("#" + id);
      if (el) el.addEventListener("input", function () { fieldError(id, false); });
      if (el) el.addEventListener("change", function () { fieldError(id, false); });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = validate();
      if (!data) {
        var firstError = form.querySelector(".field.has-error input, .field.has-error select");
        if (firstError) firstError.focus();
        return;
      }

      var message = buildMessage(data);
      var mailto =
        "mailto:" +
        EMAIL +
        "?subject=" +
        encodeURIComponent("Quote request — " + data.service + " — " + data.name) +
        "&body=" +
        encodeURIComponent(message);

      preview.textContent = "To: " + EMAIL + "\n\n" + message;
      form.hidden = true;
      success.hidden = false;
      window.location.href = mailto;
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = preview.textContent || "";
      function done() {
        copyBtn.textContent = "Copied";
        setTimeout(function () {
          copyBtn.textContent = "Copy my message";
        }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallbackCopy);
      } else {
        fallbackCopy();
      }
      function fallbackCopy() {
        var ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
          done();
        } catch (err) {
          /* leave the textarea visible fallback to manual copy */
        }
        document.body.removeChild(ta);
      }
    });
  }

  if (editBtn) {
    editBtn.addEventListener("click", function () {
      success.hidden = true;
      form.hidden = false;
      var name = form.querySelector("#name");
      if (name) name.focus();
    });
  }

  if (formWrap) {
    document.querySelectorAll(".service__inner .text-link, a[href='#contact']").forEach(function (link) {
      link.addEventListener("click", function () {
        if (!success || success.hidden) return;
        success.hidden = true;
        form.hidden = false;
      });
    });
  }

  /* Year ----------------------------------------------------------------------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
