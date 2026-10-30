(function () {
  const header = document.querySelector(".site-header");
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav");

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function closeMenu() {
    nav.classList.remove("is-open");
    menuBtn.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuBtn.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  // Highlight the nav link for the section in view (home page anchors only).
  const sectionLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  if (sectionLinks.length && "IntersectionObserver" in window) {
    const byId = new Map(sectionLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach((a) => a.classList.remove("is-active"));
        const link = byId.get(entry.target.id);
        if (link) link.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    byId.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  // Fade sections in as they scroll into view.
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // Count the stats up once when they appear.
  const counters = document.querySelectorAll("[data-countup]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (counters.length && !reduceMotion && "IntersectionObserver" in window) {
    const countIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.countup);
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / 1400, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + "+";
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countIo.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countIo.observe(el));
  }

  // Enquiry form: build a ready-to-send email.
  const form = document.querySelector("[data-enquiry]");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const get = (key) => String(data.get(key) || "").trim();
      const name = get("name");
      const email = get("email");
      const company = get("company");
      const message = get("message");
      const note = form.querySelector(".form-note");
      if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (note) note.textContent = "Please add your name, a valid email, and a short message.";
        return;
      }
      const body = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Company: ${company || "-"}`,
        `Country: ${get("country") || "-"}`,
        `Product: ${get("interest")}`,
        `Quantity per style: ${get("quantity")}`,
        "",
        message
      ].join("\n");
      const mail = `mailto:zaman@omigafashion.com?subject=${encodeURIComponent("Sourcing enquiry — " + (company || name))}&body=${encodeURIComponent(body)}`;
      const success = document.querySelector("[data-success]");
      form.hidden = true;
      if (success) {
        success.hidden = false;
        const open = success.querySelector("[data-mail]");
        if (open) open.href = mail;
      }
      window.location.href = mail;
    });
  }

  // Shared lightbox for factory photos and gallery styles.
  const lightbox = document.querySelector("[data-lightbox]");
  let lbItems = [];
  let lbIndex = 0;
  function showLightbox(items, index) {
    if (!lightbox || !items.length) return;
    lbItems = items;
    lbIndex = (index + items.length) % items.length;
    const item = lbItems[lbIndex];
    lightbox.querySelector("img").src = item.src;
    lightbox.querySelector("img").alt = item.label;
    lightbox.querySelector(".lb-caption").textContent = `${item.label} · ${lbIndex + 1} / ${lbItems.length}`;
    lightbox.classList.add("is-open");
  }
  const closeLightbox = () => lightbox && lightbox.classList.remove("is-open");
  if (lightbox) {
    lightbox.querySelector(".lb-close").addEventListener("click", closeLightbox);
    lightbox.querySelector(".lb-prev").addEventListener("click", () => showLightbox(lbItems, lbIndex - 1));
    lightbox.querySelector(".lb-next").addEventListener("click", () => showLightbox(lbItems, lbIndex + 1));
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") showLightbox(lbItems, lbIndex + 1);
      if (event.key === "ArrowLeft") showLightbox(lbItems, lbIndex - 1);
    });
  }

  // Factory photo filter.
  const factoryGrid = document.querySelector("[data-factory-grid]");
  if (factoryGrid) {
    const figures = [...factoryGrid.querySelectorAll("figure")];
    const factoryButtons = [...document.querySelectorAll("[data-factory-filters] button")];
    const visibleItems = () => figures.filter((f) => !f.hidden).map((f) => ({
      src: f.querySelector("img").src,
      label: f.querySelector("figcaption").lastChild.textContent.trim()
    }));
    factoryButtons.forEach((btn) => btn.addEventListener("click", () => {
      factoryButtons.forEach((b) => b.classList.toggle("is-active", b === btn));
      figures.forEach((f) => { f.hidden = btn.dataset.f !== "all" && f.dataset.cat !== btn.dataset.f; });
    }));
    figures.forEach((f) => f.addEventListener("click", () => {
      const items = visibleItems();
      showLightbox(items, items.findIndex((i) => i.src === f.querySelector("img").src));
    }));
  }

  const data = window.OMIGA_GALLERY;
  if (!data) return;
  const tag = (list, label) => (list || []).map((src) => ({ src, label }));

  // Style counts on the product cards.
  document.querySelectorAll("[data-count]").forEach((el) => {
    const list = data[el.dataset.count];
    if (list) el.textContent = String(list.length);
  });

  // Auto-scrolling strip of gallery styles on the home page.
  const reel = document.querySelector("[data-reel] .reel-track");
  if (reel) {
    const picks = [data.wovenTops, data.knitTops, data.sweaters, data.wovenBottoms, data.knitBottoms]
      .flatMap((list) => (list || []).slice(0, 5));
    [...picks, ...picks].forEach((src, i) => {
      const a = document.createElement("a");
      a.href = "collections.html";
      if (i >= picks.length) a.setAttribute("aria-hidden", "true");
      a.tabIndex = i >= picks.length ? -1 : 0;
      const img = document.createElement("img");
      img.src = src;
      img.alt = i >= picks.length ? "" : "Style from the OMIGA Fashion gallery";
      img.loading = "lazy";
      a.appendChild(img);
      reel.appendChild(a);
    });
  }

  // Collections gallery.
  const grid = document.querySelector("[data-gallery]");
  if (!grid) return;

  const sets = {
    all: [
      ...tag(data.wovenTops, "Woven top"),
      ...tag(data.wovenBottoms, "Woven bottom"),
      ...tag(data.knitTops, "Knit top"),
      ...tag(data.knitBottoms, "Knit bottom"),
      ...tag(data.sweaters, "Sweater")
    ],
    woven: [...tag(data.wovenTops, "Woven top"), ...tag(data.wovenBottoms, "Woven bottom")],
    "woven-tops": tag(data.wovenTops, "Woven top"),
    "woven-bottoms": tag(data.wovenBottoms, "Woven bottom"),
    knit: [...tag(data.knitTops, "Knit top"), ...tag(data.knitBottoms, "Knit bottom")],
    "knit-tops": tag(data.knitTops, "Knit top"),
    "knit-bottoms": tag(data.knitBottoms, "Knit bottom"),
    sweater: tag(data.sweaters, "Sweater")
  };

  const buttons = [...document.querySelectorAll("[data-filter]")];
  const meta = document.querySelector("[data-gallery-meta]");
  const moreBtn = document.querySelector("[data-more]");
  const PAGE = 16;
  let activeKey = "all";
  let shown = PAGE;
  let currentItems = sets.all;

  function render() {
    currentItems = sets[activeKey];
    grid.innerHTML = "";
    currentItems.slice(0, shown).forEach((item, index) => {
      const figure = document.createElement("figure");
      figure.className = "tile";
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.label + " from the OMIGA Fashion collection";
      img.loading = "lazy";
      img.addEventListener("error", () => figure.remove());
      const cap = document.createElement("figcaption");
      cap.textContent = item.label;
      figure.append(img, cap);
      figure.addEventListener("click", () => showLightbox(currentItems.slice(0, shown), index));
      grid.appendChild(figure);
    });
    if (meta) meta.textContent = `Showing ${Math.min(shown, currentItems.length)} of ${currentItems.length} styles`;
    if (moreBtn) moreBtn.hidden = shown >= currentItems.length;
  }

  function setFilter(key) {
    activeKey = sets[key] ? key : "all";
    shown = PAGE;
    buttons.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.filter === activeKey));
    render();
  }

  buttons.forEach((btn) => btn.addEventListener("click", () => {
    history.replaceState(null, "", "#" + btn.dataset.filter);
    setFilter(btn.dataset.filter);
  }));
  if (moreBtn) moreBtn.addEventListener("click", () => { shown += PAGE; render(); });
  window.addEventListener("hashchange", () => setFilter(location.hash.slice(1)));

  setFilter(location.hash.slice(1) || "all");
})();
