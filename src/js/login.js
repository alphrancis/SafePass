// ============================================
//  login.js
//  Entry-point script for index.html (login).
// ============================================

import { login, redirectIfLoggedIn } from "./auth.js";
import { initTheme }                  from "./theme.js";
import { showNotification, setButtonLoading } from "./ui.js";

// ── On page load ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initTheme();

  // If user is already logged in, skip the login page
  redirectIfLoggedIn("./src/html/dashboard.html");

  const form      = document.getElementById("loginForm");
  const submitBtn = form.querySelector('[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const restore = setButtonLoading(submitBtn, "Signing in...");
    const result  = await login(email, password);
    restore();

    if (result.success) {
      showNotification("Login successful! Redirecting…", "success");
      // Small delay so the user sees the success message
      setTimeout(() => {
        window.location.href = "./src/html/dashboard.html";
      }, 800);
    } else {
      showNotification(result.message, "error");
    }
  });
});
