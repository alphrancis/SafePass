const STORAGE_KEY = "safepass-theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);

  const sunIcons  = document.querySelectorAll(".theme-icon-sun");
  const moonIcons = document.querySelectorAll(".theme-icon-moon");

  if (theme === "dark") {
    sunIcons.forEach(el  => el.classList.remove("hidden"));
    moonIcons.forEach(el => el.classList.add("hidden"));
  } else {
    sunIcons.forEach(el  => el.classList.add("hidden"));
    moonIcons.forEach(el => el.classList.remove("hidden"));
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  applyTheme(current === "dark" ? "light" : "dark");
}


export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY) || "light";
  applyTheme(saved);

  document.querySelectorAll("#themeToggle").forEach((btn) => {
    btn.addEventListener("click", toggleTheme);
  });
}
