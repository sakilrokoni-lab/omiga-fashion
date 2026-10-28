(function () {
  const header = document.querySelector(".site-header");
  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav");

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuBtn.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        menuBtn.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  const form = document.querySelector("[data-enquiry]");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const company = String(data.get("company") || "").trim();
      const country = String(data.get("country") || "").trim();
      const interest = String(data.get("interest") || "").trim();
      const message = String(data.get("message") || "").trim();
      if (!name || !email || !message || !email.includes("@")) {
        const note = form.querySelector(".form-note");
        if (note) note.textContent = "Please add your name, a valid email, and a short message.";
        return;
      }
      const body = [
        `Name: ${name}`,
        `Company: ${company || "-"}`,
        `Country: ${country || "-"}`,
        `Interest: ${interest}`,
        "",
        message
      ].join("\n");
      const mail = `mailto:zaman@omigafashion.com?subject=${encodeURIComponent("Buying programme enquiry — " + (company || name))}&body=${encodeURIComponent(body)}`;
      const success = document.querySelector("[data-success]");
      form.hidden = true;
      if (success) {
        success.hidden = false;
        const open = success.querySelector("[data-mail]");
        if (open) open.href = mail;
      }
    });
  }

  const grid = document.querySelector("[data-gallery]");
  if (!grid || !window.OMIGA_GALLERY) return;

  const data = window.OMIGA_GALLERY;
  function tag(list, label) {
    return (list || []).map((src) => ({ src, label }));
  }
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
  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImg = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector(".lb-caption");
  let activeKey = "all";
  let shown = 12;
  let currentItems = sets.all;
  let lightboxIndex = 0;

  function render() {
    currentItems = sets[activeKey] || sets.all;
    const slice = currentItems.slice(0, shown);
    grid.innerHTML = "";
    slice.forEach((item, index) => {
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
      figure.addEventListener("click", () => openLightbox(index));
      grid.appendChild(figure);
    });
    if (meta) meta.textContent = `${Math.min(shown, currentItems.length)} of ${currentItems.length} styles`;
    if (moreBtn) moreBtn.hidden = shown >= currentItems.length;
  }

  function setFilter(key) {
    activeKey = sets[key] ? key : "all";
    shown = 12;
    buttons.forEach((btn) => btn.classList.toggle("is-active", btn.dataset.filter === activeKey));
    render();
  }

  function openLightbox(index) {
    const visible = [...grid.querySelectorAll(".tile img")];
    lightboxIndex = index;
    const item = currentItems[index];
    if (!item) return;
    lightboxImg.src = item.src;
    lightboxImg.alt = item.label;
    lightboxCaption.textContent = `${item.label} · ${index + 1} / ${Math.min(shown, currentItems.length)}`;
    lightbox.classList.add("is-open");
    lightbox.dataset.count = String(visible.length);
  }

  function step(dir) {
    const max = Math.min(shown, currentItems.length);
    lightboxIndex = (lightboxIndex + dir + max) % max;
    openLightbox(lightboxIndex);
  }

  buttons.forEach((btn) => btn.addEventListener("click", () => {
    history.replaceState(null, "", "#" + btn.dataset.filter);
    setFilter(btn.dataset.filter);
  }));
  if (moreBtn) moreBtn.addEventListener("click", () => { shown += 12; render(); });

  lightbox.querySelector(".lb-close").addEventListener("click", () => lightbox.classList.remove("is-open"));
  lightbox.querySelector(".lb-prev").addEventListener("click", () => step(-1));
  lightbox.querySelector(".lb-next").addEventListener("click", () => step(1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.classList.remove("is-open");
  });
  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") lightbox.classList.remove("is-open");
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  });

  const hash = location.hash.replace("#", "");
  setFilter(hash || "all");
})();
