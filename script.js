// Footer'dagi yilni avtomatik yangilab turadi
document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.querySelector(".footer span:first-child");
  if (yearSpan) {
    yearSpan.textContent = `© ${new Date().getFullYear()} NOVA media`;
  }

  // "Men haqimda" modalini ochish/yopish
  const aboutBtn = document.getElementById("aboutBtn");
  const aboutOverlay = document.getElementById("aboutOverlay");
  const aboutClose = document.getElementById("aboutClose");

  function openAbout() {
    aboutOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden"; // orqa fon skroll bo'lmasin
  }

  function closeAbout() {
    aboutOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  if (aboutBtn && aboutOverlay && aboutClose) {
    aboutBtn.addEventListener("click", openAbout);
    aboutClose.addEventListener("click", closeAbout);

    // Overlay'ning tashqi (qorong'i) qismiga bosilsa ham yopiladi
    aboutOverlay.addEventListener("click", (e) => {
      if (e.target === aboutOverlay) closeAbout();
    });

    // Escape tugmasi bilan yopish
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAbout();
    });
  }
});
