document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Footer'dagi yil ---------- */
  const copyright = document.getElementById("copyright");
  if (copyright) copyright.textContent = `© ${new Date().getFullYear()} NOVA media`;

  /* ---------- Nav: skroll qilinganda fon paydo bo'ladi ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Telefon menyusi ---------- */
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menyuni yopish" : "Menyuni ochish");
    links.classList.toggle("is-open", open);
    document.body.classList.toggle("no-scroll", open);
  }

  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- Skroll qilganda elementlar asta chiqib keladi ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  // Bir guruhdagi elementlar ketma-ket (kichik kechikish bilan) chiqadi
  const groups = new Map();
  revealEls.forEach((el) => {
    const parent = el.parentElement;
    const i = groups.get(parent) || 0;
    el.style.setProperty("--delay", `${Math.min(i * 0.12, 0.6)}s`);
    groups.set(parent, i + 1);
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Video pleyer ---------- */
  const overlay = document.getElementById("videoOverlay");
  const frame = document.getElementById("videoFrame");
  const closeBtn = document.getElementById("videoClose");
  let lastFocus = null;

  // YouTube havolasidan video ID ni ajratib oladi
  function youtubeId(url) {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    return m ? m[1] : null;
  }

  function openVideo(src) {
    const yt = youtubeId(src);
    frame.innerHTML = "";

    if (yt) {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`;
      iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      iframe.title = "Video";
      frame.appendChild(iframe);
    } else {
      const video = document.createElement("video");
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      frame.appendChild(video);
    }

    lastFocus = document.activeElement;
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("is-open"));
    document.body.classList.add("no-scroll");
    closeBtn.focus();
  }

  function closeVideo() {
    if (overlay.hidden) return;
    overlay.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    setTimeout(() => {
      overlay.hidden = true;
      frame.innerHTML = ""; // videoni to'xtatadi
    }, 300);
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll(".reel").forEach((card) => {
    const src = (card.dataset.video || "").trim();

    if (!src) {
      card.classList.add("is-soon");
      return;
    }

    // Instagram videolarini saytga joylab bo'lmaydi — yangi oynada ochiladi
    if (/instagram\.com/.test(src)) {
      card.classList.add("is-playable");
      card.addEventListener("click", () => window.open(src, "_blank", "noopener"));
      return;
    }

    card.classList.add("is-playable");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.addEventListener("click", () => openVideo(src));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openVideo(src);
      }
    });
  });

  closeBtn.addEventListener("click", closeVideo);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeVideo();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeVideo();
    if (links.classList.contains("is-open")) setMenu(false);
  });
});
