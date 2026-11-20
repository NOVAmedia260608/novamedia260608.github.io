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

  const modal = overlay.querySelector(".video-modal");

  function openVideo(src) {
    const yt = youtubeId(src);
    frame.innerHTML = "";
    modal.classList.toggle("is-vertical", !yt); // o'z videolarimiz vertikal (Reels)

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
      video.addEventListener("loadedmetadata", () => {
        modal.classList.toggle("is-vertical", video.videoHeight > video.videoWidth);
      });
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

  /* ---------- Video kartalar ---------- */
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  document.querySelectorAll(".reel").forEach((card) => {
    const src = (card.dataset.video || "").trim();
    if (!src) return;

    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.addEventListener("click", () => openVideo(src));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openVideo(src);
      }
    });

    // Kompyuterda sichqoncha ustiga kelganda ovozsiz oldindan ko'rish
    if (!canHover || youtubeId(src)) return;
    const thumb = card.querySelector(".reel__thumb");
    let preview = null;

    card.addEventListener("mouseenter", () => {
      if (card.closest(".reels__track").classList.contains("is-dragging")) return;
      if (!preview) {
        preview = document.createElement("video");
        preview.src = src;
        preview.muted = true;
        preview.loop = true;
        preview.playsInline = true;
        preview.preload = "auto";
        preview.setAttribute("aria-hidden", "true");
        thumb.insertBefore(preview, thumb.querySelector(".reel__num"));
      }
      preview.play().then(() => card.classList.add("is-previewing")).catch(() => {});
    });

    card.addEventListener("mouseleave", () => {
      card.classList.remove("is-previewing");
      if (preview) preview.pause();
    });
  });

  /* ---------- Gorizontal lentalar: strelkalar, progress, sichqoncha bilan tortish ---------- */
  document.querySelectorAll(".reels").forEach((wrap) => {
    const track = wrap.querySelector(".reels__track");
    const prevBtn = wrap.querySelector(".reels__prev");
    const nextBtn = wrap.querySelector(".reels__next");
    const bar = wrap.querySelector(".reels__bar");

    const step = () => {
      const card = track.querySelector(".reel");
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const per = card ? card.offsetWidth + gap : 300;
      return Math.max(per, Math.floor(track.clientWidth / per) * per);
    };

    prevBtn.addEventListener("click", () => track.scrollBy({ left: -step() }));
    nextBtn.addEventListener("click", () => track.scrollBy({ left: step() }));

    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const ratio = max > 0 ? track.scrollLeft / max : 0;
      const visible = max > 0 ? track.clientWidth / track.scrollWidth : 1;
      bar.style.width = `${visible * 100}%`;
      bar.style.transform = `translateX(${(ratio * (1 - visible) / visible) * 100}%)`;
      prevBtn.disabled = track.scrollLeft <= 2;
      nextBtn.disabled = track.scrollLeft >= max - 2;
    };
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    // Sichqoncha bilan tortib surish (telefonda barmoq bilan o'zi ishlaydi)
    let startX = 0, startLeft = 0, moved = false, down = false;

    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false;
      startX = e.clientX; startLeft = track.scrollLeft;
    });

    window.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        track.classList.add("is-dragging");
      }
      if (moved) track.scrollLeft = startLeft - dx;
    });

    window.addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      // Tortish paytida kartalar bosilmaydi (pointer-events: none),
      // shuning uchun qo'yib yuborilganda video ochilib ketmaydi
      if (moved) setTimeout(() => track.classList.remove("is-dragging"), 0);
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
