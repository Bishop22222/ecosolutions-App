import { fetchPoints } from "./points.js";

export function navigate(page) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(page)?.classList.add("active");

  document.getElementById("screen-title").textContent = page;

  const nav = document.getElementById("main-nav");
  if (nav) {
    nav.style.display =
      page === "login" || page === "register" ? "none" : "flex";
  }

  if (page === "dashboard") {
    fetchPoints();
  }
}
