import { requireAuth, logout as firebaseLogout } from "./auth.js";
import { initTheme }      from "./theme.js";
import { showNotification } from "./ui.js";
import {
  listenDashboardStats,
  listenCampusLogs,
  listenAttendance,
  getCampusData,
  getClassroomData,
} from "./attendance.js";

function todayStr() {
  return new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
}

// ─── Boot sequence ───────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();

  const user = await requireAuth("../../index.html");
const rawName = user.displayName || user.email;
const cleanName = rawName.includes("@")
  ? rawName.split("@")[0]   
  : rawName;

const initials = cleanName
  .split(/[.\s]/)       
  .filter(Boolean)          
  .map((n) => n[0])
  .join("")
  .toUpperCase()
  .slice(0, 2);

["userName", "mobileUserName"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.textContent = cleanName;
});

["userInitials", "mobileUserInitials"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.textContent = initials;
});

  // ── Wire up logout buttons ──────────────────────────────────────────────
  document.querySelectorAll("[data-action='logout']").forEach((btn) => {
    btn.addEventListener("click", handleLogout);
  });

  // ── Load initial data ───────────────────────────────────────────────────
  subscribeHomeStats();
  subscribeCampusData();
  subscribeClassroomData();

});

// ─── Logout ──────────────────────────────────────────────────────────────────

async function handleLogout() {
  if (!confirm("Are you sure you want to logout?")) return;
  showNotification("Signing out…", "info");
  await firebaseLogout("../../index.html");
}

// Expose globally so inline onclick still works as a fallback
window.logout = handleLogout;

// ─── Tab Navigation ──────────────────────────────────────────────────────────

window.navigateToTab = function (tabName) {
  document.querySelectorAll(".tab-content").forEach((t) => {
    t.classList.add("hidden");
    t.classList.remove("active");
  });
  document.querySelectorAll(".nav-tab, .mobile-nav-tab").forEach((t) => {
    t.classList.remove("active");
  });

  const tabEl = document.getElementById(`tab-${tabName}`);
  if (tabEl) {
    tabEl.classList.remove("hidden");
    tabEl.classList.add("active");
  }

  document.querySelectorAll(`[data-tab="${tabName}"]`).forEach((t) =>
    t.classList.add("active")
  );

  loadTabData(tabName);
};

// Wire nav-tab clicks
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-tab, .mobile-nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      window.navigateToTab(tab.getAttribute("data-tab"));
      // Close mobile menu if open
      const mobileMenu = document.getElementById("mobileMenu");
      if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
        toggleMobileMenu();
      }
    });
  });

  // Mobile menu toggle
  document.getElementById("mobileMenuToggle")?.addEventListener("click", toggleMobileMenu);

  // User dropdown toggle
  const userMenuBtn  = document.getElementById("userMenuButton");
  const userDropdown = document.getElementById("userDropdown");
  const chevron      = document.getElementById("userMenuChevron");

  userMenuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown?.classList.toggle("hidden");
    chevron?.classList.toggle("rotate-180");
  });

  document.addEventListener("click", () => {
    userDropdown?.classList.add("hidden");
    chevron?.classList.remove("rotate-180");
  });
});

function toggleMobileMenu() {
  const menu     = document.getElementById("mobileMenu");
  const hamburger = document.getElementById("hamburgerIcon");
  const closeBtn  = document.getElementById("closeIcon");
  menu?.classList.toggle("hidden");
  menu?.classList.toggle("active");
  hamburger?.classList.toggle("hidden");
  closeBtn?.classList.toggle("hidden");
}

// ─── Data Loaders ────────────────────────────────────────────────────────────

function loadTabData(tabName) {
  switch (tabName) {
    case "home":      subscribeHomeStats();      break;
    case "campus":    subscribeCampusData();     break;
    case "classroom": subscribeClassroomData();  break;
  }
}

function subscribeHomeStats() {
  listenDashboardStats(todayStr(), (stats) => {
    setEl("stat-total-students", stats.totalStudents);
    setEl("stat-on-campus", stats.onCampus);
    setEl("stat-in-class", stats.inClass);
    setEl("stat-violations", stats.violations);
  });
}


async function loadCampusData() {
  try {
    const data = await getCampusData("2026-02-14");
    setEl("campus-entered", data.entered);
    setEl("campus-exited",  data.exited);
    setEl("campus-current", data.current);

    const tbody = document.getElementById("campus-table-body");
    if (!tbody) return;

    if (data.students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-8 text-muted">
            No students on campus today.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = data.students
      .map(
        (s) => `
      <tr>
        <td><span class="font-mono text-primary">${s.id}</span></td>
        <td><span class="font-semibold">${s.name}</span></td>
        <td>${s.entryTime}</td>
        <td>${s.location}</td>
        <td>
          <span class="badge ${s.status === "inside" ? "badge-success" : "badge-warning"}">
            ${s.status}
          </span>
        </td>
      </tr>`
      )
      .join("");
  } catch (err) {
    console.error("loadCampusData:", err);
  }
}

function subscribeCampusData() {
  listenCampusLogs(todayStr(), async () => {
    const data = await getCampusData(todayStr());
    renderCampusData(data);
  });
}

function renderCampusData(data) {
  setEl("campus-entered", data.entered);
  setEl("campus-exited", data.exited);
  setEl("campus-current", data.current);

  const tbody = document.getElementById("campus-table-body");
  if (!tbody) return;

  tbody.innerHTML = data.students.length
    ? data.students.map((s) => `
      <tr>
        <td><span class="font-mono text-primary">${s.id}</span></td>
        <td><span class="font-semibold">${s.name}</span></td>
        <td>${s.entryTime}</td>
        <td>${s.location}</td>
        <td>
          <span class="badge ${s.status === "inside" ? "badge-success" : "badge-warning"}">
            ${s.status}
          </span>
        </td>
      </tr>`).join("")
    : `<tr><td colspan="5" class="text-center py-8 text-muted">No students on campus today.</td></tr>`;
}

function subscribeClassroomData() {
  listenAttendance(todayStr(), async () => {
    const data = await getClassroomData(todayStr());
    renderClassroomData(data);
  });
}

function renderClassroomData(data) {
  setEl("classroom-present", data.present);
  setEl("classroom-outside", data.outside);
  setEl("classroom-violations", data.violations);

  const total = data.students.length;
  const rate = total > 0 ? ((data.present / total) * 100).toFixed(1) : 0;
  setEl("attendance-rate", `${rate}%`);

  const grade10Body = document.getElementById("classroom-grade10-body");
  const grade12Body = document.getElementById("classroom-grade12-body");

  grade10Body.innerHTML = "";
  grade12Body.innerHTML = "";

  data.students.forEach((s) => {
    const row = `
      <tr>
        <td><span class="font-mono text-primary">${s.id}</span></td>
        <td><span class="font-semibold">${s.name}</span></td>
        <td>${s.class}</td>
        <td>${s.checkInTime}</td>
        <td>
          <span class="badge ${s.status === "inside" ? "badge-success" : "badge-warning"}">
            ${s.status}
          </span>
        </td>
      </tr>`;
    if (s.id === "61342C17") {
      grade10Body.innerHTML += row;
    } else {
      grade12Body.innerHTML += row;
    }
  });
}


async function loadClassroomData() {
  try {
    const data = await getClassroomData("2026-02-14");

    setEl("classroom-present", data.present);
    setEl("classroom-outside", data.outside);
    setEl("classroom-violations", data.violations);

    const grade10Body = document.getElementById("classroom-grade10-body");
    const grade12Body = document.getElementById("classroom-grade12-body");

    if (grade10Body) grade10Body.innerHTML = "";
    if (grade12Body) grade12Body.innerHTML = "";

    data.students.forEach((s) => {
      const row = `
        <tr>
          <td><span class="font-mono text-primary">${s.id}</span></td>
          <td><span class="font-semibold">${s.name}</span></td>
          <td>${s.class}</td>
          <td>${s.checkInTime}</td>
          <td>
            <span class="badge ${s.status === "inside" ? "badge-success" : "badge-warning"}">
              ${s.status}
            </span>
          </td>
        </tr>`;

      
      if (s.id === "61342C17") {
        grade10Body.innerHTML += row;
      } else {
        grade12Body.innerHTML += row;
      }
    });
  } catch (err) {
    console.error("loadClassroomData:", err);
  }
}

window.refreshCampusData = async function () {
  showNotification("Refreshing campus data…", "info");
  await loadCampusData();
  showNotification("Data refreshed!", "success");
};

// ─── Util ─────────────────────────────────────────────────────────────────────

function setEl(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? "—";
}