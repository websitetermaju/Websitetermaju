// === KONFIGURASI — cukup edit bagian ini ===
const WA_NUMBER = "628159203331";
const WA_DEFAULT_MSG = "Halo, saya mau tanya soal jasa pembuatan website.";
// ===========================================

document.querySelectorAll("[data-wa]").forEach((el) => {
  const msg = el.dataset.waMsg || WA_DEFAULT_MSG;
  el.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  el.target = "_blank";
  el.rel = "noopener";
});

const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("shown")),
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
