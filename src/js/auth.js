// ============================================
//  auth.js
//  Handles Firebase Authentication:
//  login, signup, logout, and route guarding.
//
//  HOW THE AUTH GUARD WORKS
//  ─────────────────────────
//  Firebase's onAuthStateChanged fires once
//  after it resolves the persisted session.
//  We wait for that first call before deciding
//  whether to redirect — this prevents the
//  "flash to dashboard then back to login" bug.
// ============================================

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { auth, database } from "./firebase-config.js";

// ─── Login ───────────────────────────────────────────────────────────────────

/**
 * Sign in with email + password.
 * @returns {{ success: boolean, user?: object, message?: string }}
 */
export async function login(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: credential.user };
  } catch (err) {
    return { success: false, message: friendlyError(err.code) };
  }
}

// ─── Signup ──────────────────────────────────────────────────────────────────

/**
 * Create a new account and save the display name to the Realtime Database.
 * @returns {{ success: boolean, user?: object, message?: string }}
 */
export async function signup(fullName, email, password) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    // Attach display name to the Firebase Auth profile
    await updateProfile(user, { displayName: fullName });

    // Persist extra profile info to the Realtime Database
    await set(ref(database, `admins/${user.uid}`), {
      uid:       user.uid,
      name:      fullName,
      email:     email,
      createdAt: new Date().toISOString(),
      role:      "admin",
    });

    return { success: true, user };
  } catch (err) {
    return { success: false, message: friendlyError(err.code) };
  }
}

// ─── Logout ──────────────────────────────────────────────────────────────────

/**
 * Sign the current user out and redirect to the login page.
 */
export async function logout(loginPath = "/index.html") {
  try {
    await signOut(auth);
    window.location.href = loginPath;
  } catch (err) {
    console.error("Logout error:", err);
  }
}

// ─── Route Guard ─────────────────────────────────────────────────────────────

/**
 * Call this at the top of every PROTECTED page (dashboard, etc.).
 *
 * It hides the page body until Firebase resolves the auth state.
 * If the user is not logged in they are redirected to loginPath.
 *
 * @param {string} loginPath   - Where to redirect unauthenticated users.
 * @returns {Promise<firebase.User>}  Resolves with the logged-in user.
 */
export function requireAuth(loginPath = "/index.html") {
  // Hide the page until we know auth state to prevent flash
  document.body.style.visibility = "hidden";

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Only need the first resolution
      if (user) {
        document.body.style.visibility = "visible";
        resolve(user);
      } else {
        window.location.href = loginPath;
        // Keep body hidden during redirect
      }
    });
  });
}

/**
 * Call this at the top of every PUBLIC page (login, signup).
 *
 * If the user is already logged in, redirect them to the dashboard
 * so they don't have to log in again.
 *
 * @param {string} dashboardPath - Where to send authenticated users.
 */
export function redirectIfLoggedIn(dashboardPath = "/src/html/dashboard.html") {
  document.body.style.visibility = "hidden";

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe();
    document.body.style.visibility = "visible";
    if (user) {
      window.location.href = dashboardPath;
    }
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convert Firebase error codes into human-readable messages.
 */
function friendlyError(code) {
  const messages = {
    "auth/user-not-found":      "No account found with that email.",
    "auth/wrong-password":      "Incorrect password. Please try again.",
    "auth/invalid-email":       "Please enter a valid email address.",
    "auth/email-already-in-use":"An account with this email already exists.",
    "auth/weak-password":       "Password must be at least 6 characters.",
    "auth/too-many-requests":   "Too many attempts. Please wait and try again.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/invalid-credential":  "Invalid email or password.",
  };
  return messages[code] || "Something went wrong. Please try again.";
}
