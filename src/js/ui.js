/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
export function showNotification(message, type = "info") {
  const iconPaths = {
    success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>',
    error:   '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>',
    info:    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
  };

  const notification = document.createElement("div");
  notification.className = `notification notification-${type} animate-slide-in-right`;
  notification.innerHTML = `
    <div class="flex items-center gap-3">
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${iconPaths[type] || iconPaths.info}
      </svg>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("animate-slide-out-right");
    setTimeout(() => notification.remove(), 300);
  }, 3500);
}

/**
 * Set a button to a loading state (spinner + disabled).
 * Returns a function that restores the button.
 * @param {HTMLButtonElement} btn
 * @param {string} loadingText
 * @returns {() => void}  
 */
export function setButtonLoading(btn, loadingText = "Please wait...") {
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `
    <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
    ${loadingText}
  `;
  return () => {
    btn.disabled = false;
    btn.innerHTML = original;
  };
}

export function togglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) field.type = field.type === "password" ? "text" : "password";
}

// Expose togglePassword globally so inline onclick="togglePassword(...)" works
window.togglePassword = togglePassword;
