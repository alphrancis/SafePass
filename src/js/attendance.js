import { ref, get, onValue }
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { database } from "./firebase-config.js";


function todayStr() {
  return new Date().toISOString().split("T")[0];
}


export function listenDashboardStats(date = todayStr(), callback) {
  const campusRef     = ref(database, `campus_logs/${date}`);
  const attendanceRef = ref(database, `attendance/${date}`);

  let latestCampusSnap     = null;
  let latestAttendanceSnap = null;

  function compute() {
    if (!latestCampusSnap || !latestAttendanceSnap) return;

    const entrySet = new Set();
    const exitSet  = new Set();

    if (latestCampusSnap.exists()) {
      latestCampusSnap.forEach((child) => {
        const val = child.val();
        if (val.CAMPUS_ENTRY) {
          entrySet.add(val.CAMPUS_ENTRY.studentID?.toUpperCase());
        }
        if (val.CAMPUS_EXIT) {
          exitSet.add(val.CAMPUS_EXIT.studentID?.toUpperCase());
        }
      });
    }

    const onCampus = [...entrySet].filter((id) => !exitSet.has(id)).length;

    let inClass    = 0;
    let violations = 0;

    if (latestAttendanceSnap.exists()) {
      latestAttendanceSnap.forEach((child) => {
        const val = child.val();
        const timeIn  = val.TIME_IN?.timeIn  || val.timeIn  || "";
        const timeOut = val.TIME_OUT?.timeOut || val.timeOut || "";
        const alarm   = val.TIME_IN?.alarm   || val.alarm   || null;

        if (timeIn && !timeOut) inClass++;
        if (alarm?.type === "unauthorized_exit") violations++;
      });
    }

    get(ref(database, "students/students")).then((snap) => {
      callback({
        totalStudents: snap.exists() ? snap.size : entrySet.size,
        onCampus,
        inClass,
        violations,
      });
    });
  }

  onValue(campusRef,     (snap) => { latestCampusSnap     = snap; compute(); });
  onValue(attendanceRef, (snap) => { latestAttendanceSnap = snap; compute(); });
}


export async function getStudents() {
  try {
    const snap = await get(ref(database, "students/students"));
    if (!snap.exists()) return [];
    const students = [];
    snap.forEach((child) => {
      const val = child.val();
      students.push({
        studentID:     child.key,
        name:          val.name,
        course:        val.course,
        yearLevel:     val.yearLevel,
        parentNumber:  val.parentNumber,
        alarmID:       val.alarmID,
        studentNumber: val.studentNumber,
        LRN:           val.LRN,
      });
    });
    return students;
  } catch (err) {
    console.error("getStudents error:", err);
    return [];
  }
}


export async function getCampusLogs(date = todayStr()) {
  try {
    const snap = await get(ref(database, `campus_logs/${date}`));
    if (!snap.exists()) return [];

    const logs = [];
    snap.forEach((child) => {
      const val = child.val();
      if (val.CAMPUS_ENTRY) {
        logs.push({ key: child.key, type: "campus_entry", ...val.CAMPUS_ENTRY });
      }
      if (val.CAMPUS_EXIT) {
        logs.push({ key: child.key, type: "campus_exit", ...val.CAMPUS_EXIT });
      }
      if (!val.CAMPUS_ENTRY && !val.CAMPUS_EXIT) {
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
    if (!snapshot.exists()) { callback([]); return; }

    const logs = [];
    snapshot.forEach((child) => {
      const val = child.val();
      if (val.CAMPUS_ENTRY) {
        logs.push({ key: child.key, type: "campus_entry", ...val.CAMPUS_ENTRY });
      }
      if (val.CAMPUS_EXIT) {
        logs.push({ key: child.key, type: "campus_exit", ...val.CAMPUS_EXIT });
      }
      if (!val.CAMPUS_ENTRY && !val.CAMPUS_EXIT) {
        logs.push({ key: child.key, ...val });
      }
    });
    callback(logs);
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
          studentID:      base.studentID,
          studentName:    base.studentName,
          timeIn:         val.TIME_IN?.timeIn   || "",
          timeOut:        val.TIME_OUT?.timeOut  || "",
          date:           base.date,
          alarm:          val.TIME_IN?.alarm     || null,
          authorizedExit: val.TIME_IN?.authorizedExit ?? true,
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

export function listenAttendance(date = todayStr(), callback) {
  const attendanceRef = ref(database, `attendance/${date}`);
  onValue(attendanceRef, (snapshot) => {
    if (!snapshot.exists()) { callback([]); return; }

    const records = [];
    snapshot.forEach((child) => {
      const val = child.val();
      if (val.TIME_IN || val.TIME_OUT) {
        const base = val.TIME_IN || val.TIME_OUT;
        records.push({
          studentID:   base.studentID,
          studentName: base.studentName,
          timeIn:      val.TIME_IN?.timeIn  || "",
          timeOut:     val.TIME_OUT?.timeOut || "",
          date:        base.date,
          alarm:       val.TIME_IN?.alarm   || null,
        });
      } else {
        records.push({ key: child.key, ...val });
      }
    });
    callback(records);
  });
}


export async function getCampusData(date = todayStr()) {
  const [campusLogs, students] = await Promise.all([getCampusLogs(date), getStudents()]);

  const nameLookup = {};
  students.forEach((s) => { nameLookup[s.studentID?.toUpperCase()] = s.name; });

  const entryByStudent = {};
  const exitByStudent  = {};

  campusLogs.forEach((log) => {
    console.log("RAW LOG:", JSON.stringify(log));
    const id = log.studentID?.toUpperCase();
    if (!id) return;
    if (log.type === "campus_exit") {
      exitByStudent[id] = log;
    } else {
      entryByStudent[id] = log;
    }
  });


  const studentsOnCampus = Object.keys(entryByStudent).map((id) => {
    const entryLog  = entryByStudent[id];
    const exitLog   = exitByStudent[id];
    const hasExited = !!exitByStudent[id]; 

    return {
      id:        entryLog.studentID,
      name:      entryLog.studentName || nameLookup[id] || "Unknown",
      entryTime: entryLog.entryTime || entryLog.time || "—",
      exitTime:  hasExited ? (exitLog.exitTime || exitLog.time || "—") : "—",
      location:  entryLog.monitor === "ON" ? "Monitored Zone" : "Campus",
      status:    hasExited ? "outside" : "inside",
    };
  });

  return {
    entered: Object.keys(entryByStudent).length,
    current: studentsOnCampus.filter((s) => s.status === "inside").length,
    exited:  studentsOnCampus.filter((s) => s.status === "outside").length,
    students: studentsOnCampus,
  };
}


export async function getClassroomData(date = todayStr()) {
  const [attendance, students] = await Promise.all([getAttendance(date), getStudents()]);

  const nameLookup = {};
  students.forEach((s) => { nameLookup[s.studentID?.toUpperCase()] = s; });

  let violationCount = 0;

  const rows = attendance.map((r) => {
    const info = nameLookup[r.studentID?.toUpperCase()];

    const status       = r.timeIn && !r.timeOut ? "inside" : "outside";
    const checkInTime  = r.timeOut || r.timeIn  || "—";
    const name         = r.studentName || info?.name || "Unknown";

    if (r.alarm?.type === "unauthorized_exit") violationCount++;

    return {
      id: r.studentID,
      name,
      class:       info?.course || "—",
      checkInTime,
      status,
    };
  });

  return {
    present:    rows.filter((r) => r.status === "inside").length,
    outside:    rows.filter((r) => r.status === "outside").length,
    violations: violationCount,
    students:   rows,
  };
}


export async function getDashboardStats(date = todayStr()) {
  const [students, campusLogs, attendance] = await Promise.all([
    getStudents(),
    getCampusLogs(date),
    getAttendance(date),
  ]);

  const entrySet = new Set();
  const exitSet  = new Set();
  campusLogs.forEach((log) => {
    const id = log.studentID?.toUpperCase();
    if (log.type === "campus_exit") exitSet.add(id);
    else entrySet.add(id);
  });

  const onCampus   = [...entrySet].filter((id) => !exitSet.has(id)).length;
  const inClass    = attendance.filter((r) => r.timeIn && !r.timeOut).length;
  const violations = attendance.filter((r) => r.alarm?.type === "unauthorized_exit").length;

  return {
    totalStudents: students.length,
    onCampus,
    inClass,
    violations,
  };
}