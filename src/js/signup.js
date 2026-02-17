// ============================================
//  signup.js
//  Entry-point script for signup.html.
// ============================================

import { signup, redirectIfLoggedIn } from "./auth.js";
import { initTheme }                   from "./theme.js";
import { showNotification, setButtonLoading } from "./ui.js";

// ── Password requirement checker ─────────────────────────────────────────────
function initPasswordChecker() {
  const passwordInput = document.getElementById("password");
  if (!passwordInput) return;

  const checks = {
    length: { el: document.getElementById("req-length"), test: (v) => v.length >= 8 },
    upper:  { el: document.getElementById("req-upper"),  test: (v) => /[A-Z]/.test(v) },
    number: { el: document.getElementById("req-number"), test: (v) => /[0-9]/.test(v) },
  };

  passwordInput.addEventListener("input", (e) => {
    const val = e.target.value;
    Object.values(checks).forEach(({ el, test }) => {
      if (!el) return;
      const dot  = el.querySelector("div");
      const text = el.querySelector("span");
      const ok   = test(val);
      dot.className  = `w-1.5 h-1.5 rounded-full ${ok ? "bg-secondary" : "bg-muted"}`;
      text.className = `${ok ? "text-secondary" : "text-muted"}`;
    });
  });
}

// ── On page load ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initPasswordChecker();

  // If already logged in, go straight to dashboard
  redirectIfLoggedIn("./dashboard.html");

  const form      = document.getElementById("signupForm");
  const submitBtn = form.querySelector('[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName       = document.getElementById("fullName").value.trim();
    const email          = document.getElementById("email").value.trim();
    const password       = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // ── Client-side validation ────────────────────────────────────────────
    if (!fullName) {
      showNotification("Please enter your full name.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showNotification("Passwords do not match!", "error");
      return;
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      showNotification("Please meet all password requirements.", "error");
      return;
    }

    // ── Firebase signup ───────────────────────────────────────────────────
    const restore = setButtonLoading(submitBtn, "Creating account…");
    const result  = await signup(fullName, email, password);
    restore();

    if (result.success) {
      showNotification("Account created! Redirecting to dashboard…", "success");
      setTimeout(() => {
        window.location.href = "./dashboard.html";
      }, 1200);
    } else {
      showNotification(result.message, "error");
    }
  });
});
