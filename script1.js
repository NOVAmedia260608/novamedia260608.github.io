// ==========================================================
// NOVA media — sayt data/site.json'dan avtomatik to'ldiriladi.
// CMS orqali (/admin) shu faylni o'zgartirsangiz, sayt yangilanadi.
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  // Footer'dagi yilni avtomatik yangilab turadi
  const yearSpan = document.querySelector(".footer span:first-child");
  if (yearSpan) {
    yearSpan.textContent = `© ${new Date().getFullYear()} NOVA media`;
  }

  loadSiteContent();
  setupAboutModal();
  setupVideoModal();
});

// ===== Kontentni yuklash =====
async function loadSiteContent() {
  try {
    const res = await fetch("data/site.json", { cache: "no-store" });
    const data = await res.json();

    // Hero video va portret
    const heroVideo = document.getElementById("heroVideo");
    if (heroVideo && data.hero && data.hero.video) {
      heroVideo.src = data.hero.video;
    }

    const heroPortrait = document.getElementById("heroPortrait");
    if (heroPortrait && data.portrait) {
      heroPortrait.src = data.portrait;
    }

    // Men haqimda
    if (data.about) {
      setText("aboutAlias", data.about.alias);
      setText("aboutRole", data.about.role);
      setText("aboutBio", data.about.experience);
      setText("aboutGear", data.about.gear);
      setText("aboutSoftware", data.about.software);
    }

    // Ishlar (works) kartalarini chizish
    const grid = document.getElementById("worksGrid");
    if (grid && Array.isArray(data.works)) {
      grid.innerHTML = data.works.map(renderWorkCard).join("");
    }

    // Yangi chizilgan kartalarga bosish (click) hodisasini ulaymiz
    attachWorkCardEvents();
  } catch (err) {
    console.error("Kontentni yuklashda xatolik:", err);
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.textContent = value;
}

function renderWorkCard(work) {
  const wideClass = work.wide ? " work-card--wide" : "";
  return `
    <article class="work-card${wideClass}" data-video="${work.video}">
      <div class="work-card__media">
        <video class="work-card__preview" src="${work.video}" autoplay muted loop playsinline></video>
        <span class="work-card__play">▶</span>
      </div>
      <div class="work-card__info">
        <h3>${work.title}</h3>
        <p>${work.category}</p>
      </div>
    </article>
  `;
}

// ===== "Men haqimda" modali =====
function setupAboutModal() {
  const aboutBtn = document.getElementById("aboutBtn");
  const aboutOverlay = document.getElementById("aboutOverlay");
  const aboutClose = document.getElementById("aboutClose");

  function openAbout() {
    aboutOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeAbout() {
    aboutOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  if (aboutBtn && aboutOverlay && aboutClose) {
    aboutBtn.addEventListener("click", openAbout);
    aboutClose.addEventListener("click", closeAbout);

    aboutOverlay.addEventListener("click", (e) => {
      if (e.target === aboutOverlay) closeAbout();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAbout();
    });
  }
}

// ===== Video pleyer modali =====
function setupVideoModal() {
  const videoOverlay = document.getElementById("videoOverlay");
  const videoPlayer = document.getElementById("videoPlayer");
  const videoClose = document.getElementById("videoClose");

  if (!videoOverlay || !videoPlayer || !videoClose) return;

  function openVideo(src) {
    videoPlayer.src = src;
    videoOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    videoPlayer.play().catch(() => {});
  }

  function closeVideo() {
    videoOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
    videoPlayer.pause();
    videoPlayer.src = "";
  }

  videoClose.addEventListener("click", closeVideo);
  videoOverlay.addEventListener("click", (e) => {
    if (e.target === videoOverlay) closeVideo();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && videoOverlay.classList.contains("is-open")) closeVideo();
  });

  // Global qilib saqlaymiz, chunki kartalar dinamik chiziladi
  window._openVideoModal = openVideo;
}

// Dinamik chizilgan .work-card'larga bosilganda videoni ochish
function attachWorkCardEvents() {
  document.querySelectorAll(".work-card[data-video]").forEach((card) => {
    card.addEventListener("click", () => {
      const src = card.getAttribute("data-video");
      if (src && window._openVideoModal) window._openVideoModal(src);
    });
  });
}
