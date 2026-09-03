// Footer'dagi yilni avtomatik yangilab turadi
document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.querySelector(".footer span:first-child");
  if (yearSpan) {
    yearSpan.textContent = `© ${new Date().getFullYear()} NOVA media`;
  }
});
