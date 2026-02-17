import { ref, get, query, orderByChild, equalTo, onValue }
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { database } from "./firebase-config.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
}

export function listenDashboardStats(date = todayStr(), callback) {
  const campusRef     = ref(database, `campus_logs/${date}`);
  const attendanceRef = ref(database, `attendance/${date}`);


  let latestCampusSnap     = null;
  let latestAttendanceSnap = null;

  function compute() {
    if (!latestCampusSnap || !latestAttendanceSnap) return; 

    const campusLogs = [];
    if (latestCampusSnap.exists()) {
      latestCampusSnap.forEach((child) => {
        const val = child.val();
        if (val.CAMPUS_ENTRY || val.CAMPUS_EXIT) {
          if (val.CAMPUS_ENTRY) campusLogs.push({ studentID: val.CAMPUS_ENTRY.studentID, ...val.CAMPUS_ENTRY });
          if (val.CAMPUS_EXIT)  campusLogs.push({ studentID: val.CAMPUS_EXIT.studentID,  ...val.CAMPUS_EXIT });
        } else {
          campusLogs.push({ studentID: child.key, ...val });
        }
      });
    }

    const attendance = [];
    if (latestAttendanceSnap.exists()) {
      latestAttendanceSnap.forEach((child) => {
        const val = child.val();
        if (val.TIME_IN || val.TIME_OUT) {
          const base = val.TIME_IN || val.TIME_OUT;
          attendance.push({
            studentID:   base.studentID,
            studentName: base.studentName,
            timeIn:      val.TIME_IN?.timeIn  || "",
            timeOut:     val.TIME_OUT?.timeOut || "",
            alarm:       val.TIME_IN?.alarm    || null,
          });
        } else {
          attendance.push({ studentID: child.key, ...val });
        }
      });
    }

    const uniqueOnCampus = new Set(campusLogs.map((l) => l.studentID?.toUpperCase()));
    const inClass        = attendance.filter((r) => r.timeIn && !r.timeOut).length;
    const violations     = attendance.filter(
      (r) => r.alarm?.type === "unauthorized_exit"
    ).length;


    get(ref(database, "students/students")).then((snap) => {
      callback({
        totalStudents: snap.exists() ? snap.size : uniqueOnCampus.size,
        onCampus:      uniqueOnCampus.size,
        inClass,
        violations,
      });
    });
  }

  onValue(campusRef, (snap) => {
    latestCampusSnap = snap;
    compute();
  });

  onValue(attendanceRef, (snap) => {
    latestAttendanceSnap = snap;
    compute();
  });
}


function snapshotToArray(snapshot) {
  const items = [];
  snapshot.forEach((child) => items.push({ key: child.key, ...child.val() }));
  return items;
}

// ─── Students ────────────────────────────────────────────────────────────────

/**
 * Fetch all registered students.
 * @returns {Promise<Array>}
 */
export async function getStudents() {
  try {
    const snap = await get(ref(database, "students/students"));
    if (!snap.exists()) return [];
    const students = [];
    snap.forEach((child) => {
      const val = child.val();
      students.push({
        studentID: child.key,
        name: val.name,
        course: val.course,
        yearLevel: val.yearLevel,
        parentNumber: val.parentNumber,
        alarmID: val.alarmID,
        studentNumber: val.studentNumber,
        LRN: val.LRN,
      });
    });
    console.log("students array:", students);
    return students;
  } catch (err) {
    console.error("getStudents error:", err);
    return [];
  }
}

// ─── Campus Logs ─────────────────────────────────────────────────────────────

/**
 * Fetch campus logs for a given date (defaults to today).
 * @param {string} [date] 
 * @returns {Promise<Array>}
 */
export async function getCampusLogs(date = todayStr()) {
  try {
    const snap = await get(ref(database, `campus_logs/${date}`));
    if (!snap.exists()) return [];

    const logs = [];
    snap.forEach((child) => {
      const val = child.val();

      if (val.CAMPUS_ENTRY || val.CAMPUS_EXIT) {
        if (val.CAMPUS_ENTRY) {
          logs.push({ key: child.key, type: "campus_entry", ...val.CAMPUS_ENTRY });
        }
      } else {
        logs.push({ key: child.key, ...val });
      }
    });
    return logs;
  } catch (err) {
    console.error("getCampusLogs error:", err);
    return [];
  }
}

export function listenCampusLogs(date = todayStr(), callback) {
  const campusRef = ref(database, `campus_logs/${date}`);
  onValue(campusRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const logs = [];
    snapshot.forEach((child) => {
      const val = child.val();
      if (val.CAMPUS_ENTRY || val.CAMPUS_EXIT) {
        if (val.CAMPUS_ENTRY) {
          logs.push({ key: child.key, type: "campus_entry", ...val.CAMPUS_ENTRY });
        }
        if (val.CAMPUS_EXIT) {
          logs.push({ key: child.key, type: "campus_exit", ...val.CAMPUS_EXIT });
        }
      } else {
        logs.push({ key: child.key, ...val });
      }
    });
    callback(logs);
  });
}

// ─── Attendance ──────────────────────────────────────────────────────────────

/**
 * Fetch attendance records for a given date (defaults to today).
 * @param {string} [date] - "YYYY-MM-DD"
 * @returns {Promise<Array>}
 */

export function listenAttendance(date = todayStr(), callback) {
  const attendanceRef = ref(database, `attendance/${date}`);
  onValue(attendanceRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const records = [];
    snapshot.forEach((child) => {
      const val = child.val();
      if (val.TIME_IN || val.TIME_OUT) {
        const base = val.TIME_IN || val.TIME_OUT;
        records.push({
          studentID: base.studentID,
          studentName: base.studentName,
          timeIn: val.TIME_IN?.timeIn || "",
          timeOut: val.TIME_OUT?.timeOut || "",
          date: base.date,
          alarm: val.TIME_IN?.alarm || null,
        });
      } else {
        records.push({ key: child.key, ...val });
      }
    });
    callback(records);
  });
}

export async function getAttendance(date = todayStr()) {
  try {
    const snap = await get(ref(database, `attendance/${date}`));
    if (!snap.exists()) return [];

    const records = [];
    snap.forEach((child) => {
      const val = child.val();

      if (val.TIME_IN || val.TIME_OUT) {
        const base = val.TIME_IN || val.TIME_OUT;
        records.push({
          studentID:   base.studentID,
          studentName: base.studentName,
          timeIn:      val.TIME_IN?.timeIn  || "",
          timeOut:     val.TIME_OUT?.timeOut || "",
          date:        base.date,
          alarm:       val.TIME_IN?.alarm || null,
          authorizedExit: val.TIME_IN?.authorizedExit ?? true
        });
      } else {
        records.push({ key: child.key, ...val });
      }
    });
    return records;
  } catch (err) {
    console.error("getAttendance error:", err);
    return [];
  }
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

/**
 * Compute summary stats for the Home tab.
 * @returns {Promise<{totalStudents, onCampus, inClass, violations}>}
 */
export async function getDashboardStats(date = todayStr()) {
  const [students, campusLogs, attendance] = await Promise.all([
    getStudents(),
    getCampusLogs(date),
    getAttendance(date),
  ]);

  const uniqueOnCampus = new Set(campusLogs.map((l) => l.studentID?.toUpperCase()));

  const inClass = attendance.filter((r) => r.timeIn && !r.timeOut).length;

  const violations = attendance.filter(
    (r) =>
      r.alarm?.type === "unauthorized_exit" ||
      r.TIME_IN?.alarm?.type === "unauthorized_exit"
  ).length;


  return {
    totalStudents: students.length,
    onCampus:      uniqueOnCampus.size,
    inClass,
    violations,
  };
}

/**
 * Build the data needed for the Campus Monitoring tab.
 * @returns {Promise<{entered, exited, current, students}>}
 */
export async function getCampusData(date = todayStr()) {
  const [campusLogs, students] = await Promise.all([getCampusLogs(date), getStudents()]);

  const nameLookup = {};
  students.forEach((s) => { nameLookup[s.studentID?.toUpperCase()] = s.name; });

  const latestByStudent = {};
  campusLogs.forEach((log) => {
    const id = log.studentID?.toUpperCase();
    if (!id) return;
    if (!latestByStudent[id] || log.time > latestByStudent[id].time) {
      latestByStudent[id] = log;
    }
  });

  const studentsOnCampus = Object.values(latestByStudent).map((log) => {
    let status = "outside";
    if (log.type?.toLowerCase() === "campus_entry" || log.entryTime) status = "inside";
    if (log.type?.toLowerCase() === "campus_exit" || log.exitTime) status = "outside";

    return {
      id: log.studentID,
      name: log.studentName || nameLookup[log.studentID?.toUpperCase()] || "Unknown",
      entryTime: log.time || log.entryTime || "—",
      location: log.monitor === "ON" ? "Monitored Zone" : "Campus",
      status,
    };
  });

  return {
    entered: campusLogs.length,
    current: studentsOnCampus.filter((s) => s.status === "inside").length,
    exited: studentsOnCampus.filter((s) => s.status === "outside").length,
    students: studentsOnCampus,
  };
}

/**
 * Build the data needed for the Classroom Monitoring tab.
 * @returns {Promise<{present, outside, students}>}
 */
export async function getClassroomData(date = todayStr()) {
  const [attendance, students] = await Promise.all([getAttendance(date), getStudents()]);

  const nameLookup = {};
  students.forEach((s) => { nameLookup[s.studentID?.toUpperCase()] = s; });

  let violationCount = 0;

  const rows = attendance.map((r) => {
    const info = nameLookup[r.studentID?.toUpperCase()];
    let status = "outside";
    let checkInTime = "—";
    let name = info?.name || "Unknown";

    if (r.TIME_IN) {
      status = "inside";
      checkInTime = r.TIME_IN.timeIn || "—";
      name = r.TIME_IN.studentName || name;
      if (r.TIME_IN.alarm?.type === "unauthorized_exit") {
        violationCount++;
      }
    }
    if (r.TIME_OUT) {
      status = "outside";
      checkInTime = r.TIME_OUT.timeOut || checkInTime;
      name = r.TIME_OUT.studentName || name;
    }

    if (r.timeIn && !r.timeOut) {
      status = "inside";
      checkInTime = r.timeIn;
    }
    if (r.timeOut) {
      status = "outside";
      checkInTime = r.timeOut;
    }
    if (r.alarm?.type === "unauthorized_exit") {
      violationCount++;
    }

    return {
      id: r.studentID,
      name,
      class: info?.course || "—",
      checkInTime,
      status,
    };
  });

  return {
    present: rows.filter((r) => r.status === "inside").length,
    outside: rows.filter((r) => r.status === "outside").length,
    violations: violationCount,
    students: rows,
  };
}
