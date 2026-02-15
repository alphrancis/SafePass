/**
 * SAFEPASS - Intelligent Attendance Tracking System
 * Main JavaScript File
 * 
 * This file contains all the core functionality including:
 * - Authentication (Login/Signup/Logout)
 * - Theme Management (Light/Dark Mode)
 * - CRUD Operations (Firebase-ready)
 * - Attendance Tracking
 * - Data Management
 */

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.theme);
        this.setupEventListeners();
    }

    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.querySelector('.theme-icon-sun')?.classList.remove('hidden');
            document.querySelector('.theme-icon-moon')?.classList.add('hidden');
        } else {
            document.documentElement.removeAttribute('data-theme');
            document.querySelector('.theme-icon-sun')?.classList.add('hidden');
            document.querySelector('.theme-icon-moon')?.classList.remove('hidden');
        }
        this.theme = theme;
        localStorage.setItem('theme', theme);
    }

    toggle() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }

    setupEventListeners() {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// ============================================================================
// FIREBASE CONFIGURATION (Ready for Integration)
// ============================================================================

/**
 * Firebase Configuration Object
 * Replace these values with your actual Firebase project credentials
 */
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

/**
 * Firebase Initialization Function
 * Uncomment when ready to integrate with Firebase
 */
/*
// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
*/

// ============================================================================
// AUTHENTICATION SYSTEM
// ============================================================================

class AuthenticationSystem {
    constructor() {
        this.currentUser = null;
        this.loadCurrentUser();
    }

    /**
     * User Login
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} - Login result
     */
    async login(email, password) {
        try {
            // TODO: Replace with Firebase Authentication
            /*
            import { signInWithEmailAndPassword } from 'firebase/auth';
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            */

            // Simulated authentication for demo
            await this.simulateDelay(1000);

            // Mock user data
            const user = {
                uid: 'user_' + Date.now(),
                email: email,
                name: email.split('@')[0],
                role: 'admin',
                createdAt: new Date().toISOString()
            };

            // Store user data
            this.currentUser = user;
            localStorage.setItem('safepass_user', JSON.stringify(user));
            localStorage.setItem('safepass_authenticated', 'true');

            return {
                success: true,
                message: 'Login successful',
                user: user
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: 'Invalid credentials. Please try again.'
            };
        }
    }

    /**
     * User Signup/Registration
     * @param {string} name - User full name
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} - Signup result
     */
    async signup(name, email, password) {
        try {
            // TODO: Replace with Firebase Authentication
            /*
            import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            const user = userCredential.user;
            */

            // Simulated signup for demo
            await this.simulateDelay(1500);

            // Create user object
            const user = {
                uid: 'user_' + Date.now(),
                email: email,
                name: name,
                role: 'user',
                createdAt: new Date().toISOString()
            };

            // Store in database (Firebase Realtime Database or Firestore)
            // await Database.createUser(user);

            // Store user data
            this.currentUser = user;
            localStorage.setItem('safepass_user', JSON.stringify(user));
            localStorage.setItem('safepass_authenticated', 'true');

            return {
                success: true,
                message: 'Account created successfully',
                user: user
            };
        } catch (error) {
            console.error('Signup error:', error);
            return {
                success: false,
                message: 'Signup failed. Email may already be in use.'
            };
        }
    }

    /**
     * User Logout
     */
    logout() {
        // TODO: Replace with Firebase signOut
        /*
        import { signOut } from 'firebase/auth';
        await signOut(auth);
        */

        this.currentUser = null;
        localStorage.removeItem('safepass_user');
        localStorage.removeItem('safepass_authenticated');
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return localStorage.getItem('safepass_authenticated') === 'true';
    }

    /**
     * Get current logged-in user
     * @returns {Object|null}
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Load current user from storage
     */
    loadCurrentUser() {
        const userStr = localStorage.getItem('safepass_user');
        if (userStr) {
            this.currentUser = JSON.parse(userStr);
        }
    }

    /**
     * Simulate async delay for demo
     */
    simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize Auth System
const Auth = new AuthenticationSystem();

// ============================================================================
// DATABASE OPERATIONS (Firebase-Ready CRUD)
// ============================================================================

class DatabaseOperations {
    constructor() {
        // Database reference will be initialized with Firebase
        this.db = null;
    }

    /**
     * Initialize Firebase Database
     * Uncomment when integrating with Firebase
     */
    /*
    initializeDatabase() {
        import { getDatabase, ref } from 'firebase/database';
        this.db = getDatabase();
    }
    */

    // ========================================
    // CREATE OPERATIONS
    // ========================================

    /**
     * Add new student to the database
     * @param {Object} studentData - Student information
     * @returns {Promise<Object>}
     */
    async createStudent(studentData) {
        try {
            // TODO: Firebase Implementation
            /*
            import { ref, push, set } from 'firebase/database';
            const studentsRef = ref(this.db, 'students');
            const newStudentRef = push(studentsRef);
            await set(newStudentRef, {
                ...studentData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            return { success: true, id: newStudentRef.key };
            */

            // Simulated for demo
            const studentId = 'STU_' + Date.now();
            const student = {
                id: studentId,
                ...studentData,
                createdAt: new Date().toISOString()
            };

            console.log('Student created:', student);
            return { success: true, id: studentId, data: student };
        } catch (error) {
            console.error('Error creating student:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Record student entry/exit
     * @param {Object} attendanceData - Attendance record
     * @returns {Promise<Object>}
     */
    async createAttendanceRecord(attendanceData) {
        try {
            // TODO: Firebase Implementation
            /*
            import { ref, push, set } from 'firebase/database';
            const attendanceRef = ref(this.db, 'attendance');
            const newRecordRef = push(attendanceRef);
            await set(newRecordRef, {
                ...attendanceData,
                timestamp: new Date().toISOString()
            });
            return { success: true, id: newRecordRef.key };
            */

            const recordId = 'ATT_' + Date.now();
            const record = {
                id: recordId,
                ...attendanceData,
                timestamp: new Date().toISOString()
            };

            console.log('Attendance record created:', record);
            return { success: true, id: recordId, data: record };
        } catch (error) {
            console.error('Error creating attendance record:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create violation record
     * @param {Object} violationData - Violation information
     * @returns {Promise<Object>}
     */
    async createViolation(violationData) {
        try {
            // TODO: Firebase Implementation
            /*
            import { ref, push, set } from 'firebase/database';
            const violationsRef = ref(this.db, 'violations');
            const newViolationRef = push(violationsRef);
            await set(newViolationRef, {
                ...violationData,
                timestamp: new Date().toISOString(),
                resolved: false
            });
            return { success: true, id: newViolationRef.key };
            */

            const violationId = 'VIO_' + Date.now();
            const violation = {
                id: violationId,
                ...violationData,
                timestamp: new Date().toISOString(),
                resolved: false
            };

            console.log('Violation created:', violation);
            return { success: true, id: violationId, data: violation };
        } catch (error) {
            console.error('Error creating violation:', error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // READ OPERATIONS
    // ========================================

    /**
     * Get all students
     * @returns {Promise<Array>}
     */
    async getAllStudents() {
        try {
            // TODO: Firebase Implementation
            /*
            import { ref, get } from 'firebase/database';
            const studentsRef = ref(this.db, 'students');
            const snapshot = await get(studentsRef);
            if (snapshot.exists()) {
                const students = [];
                snapshot.forEach((childSnapshot) => {
                    students.push({
                        id: childSnapshot.key,
                        ...childSnapshot.val()
                    });
                });
                return students;
            }
            return [];
            */

            // Return mock data for demo
            return this.getMockStudents();
        } catch (error) {
            console.error('Error fetching students:', error);
            return [];
        }
    }

    /**
     * Get student by ID
     * @param {string} studentId
     * @returns {Promise<Object|null>}
     */
    async getStudentById(studentId) {
        try {
            // TODO: Firebase Implementation
            /*
            import { ref, get } from 'firebase/database';
            const studentRef = ref(this.db, `students/${studentId}`);
            const snapshot = await get(studentRef);
            if (snapshot.exists()) {
                return { id: studentId, ...snapshot.val() };
            }
            return null;
            */

            const students = await this.getAllStudents();
            return students.find(s => s.id === studentId) || null;
        } catch (error) {
            console.error('Error fetching student:', error);
            return null;
        }
    }

    /**
     * Get attendance records
     * @param {Object} filters - Query filters (date, studentId, etc.)
     * @returns {Promise<Array>}
     */
    async getAttendanceRecords(filters = {}) {
        try {
            // TODO: Firebase Implementation with queries
            /*
            import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
            const attendanceRef = ref(this.db, 'attendance');
            let attendanceQuery = attendanceRef;
            
            if (filters.studentId) {
                attendanceQuery = query(attendanceRef, 
                    orderByChild('studentId'), 
                    equalTo(filters.studentId)
                );
            }
            
            const snapshot = await get(attendanceQuery);
            const records = [];
            snapshot.forEach((childSnapshot) => {
                records.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            return records;
            */

            return this.getMockAttendanceRecords();
        } catch (error) {
            console.error('Error fetching attendance records:', error);
            return [];
        }
    }

    /**
     * Get active violations
     * @returns {Promise<Array>}
     */
    async getActiveViolations() {
        try {
            // TODO: Firebase Implementation
            /*
            import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
            const violationsRef = ref(this.db, 'violations');
            const activeQuery = query(violationsRef, 
                orderByChild('resolved'), 
                equalTo(false)
            );
            const snapshot = await get(activeQuery);
            const violations = [];
            snapshot.forEach((childSnapshot) => {
                violations.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            return violations;
            */

            return this.getMockViolations();
        } catch (error) {
            console.error('Error fetching violations:', error);
            return [];
        }
    }

    // ========================================
    // UPDATE OPERATIONS
    // ========================================

    /**
     * Update student information
     * @param {string} studentId
     * @param {Object} updates
     * @returns {Promise<Object>}
     */
    async updateStudent(studentId, updates) {
        try {
            // TODO: Firebase Implementation
            /*
            import { ref, update } from 'firebase/database';
            const studentRef = ref(this.db, `students/${studentId}`);
            await update(studentRef, {
                ...updates,
                updatedAt: new Date().toISOString()
            });
            return { success: true };
            */

            console.log('Student updated:', studentId, updates);
            return { success: true };
        } catch (error) {
            console.error('Error updating student:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Resolve violation (disable alarm)
     * @param {string} violationId
     * @returns {Promise<Object>}
     */
    async resolveViolation(violationId) {
        try {
            // TODO: Firebase Implementation
            /*
            import { ref, update } from 'firebase/database';
            const violationRef = ref(this.db, `violations/${violationId}`);
            await update(violationRef, {
                resolved: true,
                resolvedAt: new Date().toISOString()
            });
            return { success: true };
            */

            console.log('Violation resolved:', violationId);
            return { success: true };
        } catch (error) {
            console.error('Error resolving violation:', error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // DELETE OPERATIONS
    // ========================================

    /**
     * Delete student record
     * @param {string} studentId
     * @returns {Promise<Object>}
     */
    async deleteStudent(studentId) {
        try {
            // TODO: Firebase Implementation
            /*
            import { ref, remove } from 'firebase/database';
            const studentRef = ref(this.db, `students/${studentId}`);
            await remove(studentRef);
            return { success: true };
            */

            console.log('Student deleted:', studentId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting student:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete attendance record
     * @param {string} recordId
     * @returns {Promise<Object>}
     */
    async deleteAttendanceRecord(recordId) {
        try {
            // TODO: Firebase Implementation
            /*
            import { ref, remove } from 'firebase/database';
            const recordRef = ref(this.db, `attendance/${recordId}`);
            await remove(recordRef);
            return { success: true };
            */

            console.log('Attendance record deleted:', recordId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting record:', error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // MOCK DATA FOR DEMO
    // ========================================

    getMockStudents() {
        return [
            {
                id: 'STU001',
                name: 'John Smith',
                email: 'john.smith@example.com',
                class: 'Computer Science',
                year: '3rd Year'
            },
            {
                id: 'STU002',
                name: 'Emma Johnson',
                email: 'emma.j@example.com',
                class: 'Engineering',
                year: '2nd Year'
            },
            {
                id: 'STU003',
                name: 'Michael Brown',
                email: 'michael.b@example.com',
                class: 'Business',
                year: '4th Year'
            }
        ];
    }

    getMockAttendanceRecords() {
        return [
            {
                id: 'ATT001',
                studentId: 'STU001',
                studentName: 'John Smith',
                type: 'entry',
                location: 'Main Gate',
                timestamp: new Date().toISOString()
            }
        ];
    }

    getMockViolations() {
        return [
            {
                id: 'VIO001',
                studentId: 'STU003',
                studentName: 'Michael Brown',
                type: 'unauthorized_exit',
                exitTime: '10:45 AM',
                class: 'Business 301',
                resolved: false
            }
        ];
    }
}

// Initialize Database
const Database = new DatabaseOperations();

// ============================================================================
// ATTENDANCE SYSTEM
// ============================================================================

class AttendanceTrackingSystem {
    constructor() {
        this.stats = this.generateMockStats();
    }

    /**
     * Get dashboard statistics
     * @returns {Object}
     */
    getStats() {
        return this.stats;
    }

    /**
     * Get campus data
     * @returns {Object}
     */
    getCampusData() {
        return {
            entered: 856,
            exited: 378,
            current: 478,
            students: [
                {
                    id: 'STU001',
                    name: 'Alice Johnson',
                    entryTime: '08:30 AM',
                    location: 'Library',
                    status: 'on_campus'
                },
                {
                    id: 'STU002',
                    name: 'Bob Williams',
                    entryTime: '09:15 AM',
                    location: 'Engineering Block',
                    status: 'on_campus'
                },
                {
                    id: 'STU003',
                    name: 'Carol Davis',
                    entryTime: '08:45 AM',
                    location: 'Computer Lab',
                    status: 'on_campus'
                },
                {
                    id: 'STU004',
                    name: 'David Miller',
                    entryTime: '09:00 AM',
                    location: 'Main Building',
                    status: 'on_campus'
                },
                {
                    id: 'STU005',
                    name: 'Eva Martinez',
                    entryTime: '08:20 AM',
                    location: 'Cafeteria',
                    status: 'on_campus'
                }
            ]
        };
    }

    /**
     * Get classroom data including violations
     * @returns {Object}
     */
    getClassroomData() {
        return {
            present: 342,
            outside: 23,
            violations: [
                {
                    id: 'STU008',
                    name: 'Frank Taylor',
                    exitTime: '10:45 AM',
                    class: 'CS 301',
                    type: 'unauthorized_exit'
                },
                {
                    id: 'STU015',
                    name: 'Grace Anderson',
                    exitTime: '11:20 AM',
                    class: 'ENG 202',
                    type: 'unauthorized_exit'
                },
                {
                    id: 'STU023',
                    name: 'Henry Thomas',
                    exitTime: '09:55 AM',
                    class: 'BUS 401',
                    type: 'unauthorized_exit'
                },
                {
                    id: 'STU031',
                    name: 'Isabella Garcia',
                    exitTime: '10:10 AM',
                    class: 'MATH 205',
                    type: 'unauthorized_exit'
                },
                {
                    id: 'STU042',
                    name: 'Jack Robinson',
                    exitTime: '11:05 AM',
                    class: 'PHY 301',
                    type: 'unauthorized_exit'
                }
            ],
            students: [
                {
                    id: 'STU001',
                    name: 'Alice Johnson',
                    class: 'CS 301',
                    checkInTime: '09:00 AM',
                    status: 'present'
                },
                {
                    id: 'STU002',
                    name: 'Bob Williams',
                    class: 'ENG 202',
                    checkInTime: '10:00 AM',
                    status: 'present'
                },
                {
                    id: 'STU003',
                    name: 'Carol Davis',
                    class: 'BUS 401',
                    checkInTime: null,
                    status: 'outside'
                },
                {
                    id: 'STU004',
                    name: 'David Miller',
                    class: 'MATH 205',
                    checkInTime: '08:45 AM',
                    status: 'present'
                },
                {
                    id: 'STU005',
                    name: 'Eva Martinez',
                    class: 'PHY 301',
                    checkInTime: '09:30 AM',
                    status: 'present'
                }
            ]
        };
    }

    /**
     * Disable alarm for specific student
     * @param {string} studentId
     */
    async disableAlarm(studentId) {
        try {
            // Find and resolve the violation
            await Database.resolveViolation('VIO_' + studentId);
            console.log('Alarm disabled for student:', studentId);
            return { success: true };
        } catch (error) {
            console.error('Error disabling alarm:', error);
            return { success: false };
        }
    }

    /**
     * Disable all active alarms
     */
    async disableAllAlarms() {
        try {
            const violations = await Database.getActiveViolations();
            for (const violation of violations) {
                await Database.resolveViolation(violation.id);
            }
            console.log('All alarms disabled');
            return { success: true };
        } catch (error) {
            console.error('Error disabling all alarms:', error);
            return { success: false };
        }
    }

    /**
     * Generate mock statistics for demo
     */
    generateMockStats() {
        return {
            totalStudents: 1234,
            onCampus: 856,
            inClass: 342,
            violations: 5
        };
    }

    /**
     * Record student entry
     * @param {string} studentId
     * @param {string} location
     */
    async recordEntry(studentId, location = 'Main Gate') {
        const record = {
            studentId: studentId,
            type: 'entry',
            location: location,
            timestamp: new Date().toISOString()
        };
        return await Database.createAttendanceRecord(record);
    }

    /**
     * Record student exit
     * @param {string} studentId
     * @param {string} location
     * @param {boolean} authorized
     */
    async recordExit(studentId, location = 'Main Gate', authorized = true) {
        const record = {
            studentId: studentId,
            type: 'exit',
            location: location,
            authorized: authorized,
            timestamp: new Date().toISOString()
        };
        
        const result = await Database.createAttendanceRecord(record);
        
        // Create violation if unauthorized
        if (!authorized) {
            await Database.createViolation({
                studentId: studentId,
                type: 'unauthorized_exit',
                location: location
            });
        }
        
        return result;
    }
}

// Initialize Attendance System
const AttendanceSystem = new AttendanceTrackingSystem();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format date to readable string
 * @param {Date|string} date
 * @returns {string}
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format time to readable string
 * @param {Date|string} date
 * @returns {string}
 */
function formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format date and time
 * @param {Date|string} date
 * @returns {string}
 */
function formatDateTime(date) {
    return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Generate unique ID
 * @param {string} prefix
 * @returns {string}
 */
function generateId(prefix = 'ID') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate password strength
 * @param {string} password
 * @returns {Object}
 */
function validatePassword(password) {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*]/.test(password),
        isValid: password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)
    };
}

// ============================================================================
// EXPORT FOR MODULE USE (Optional)
// ============================================================================

// If using ES6 modules, uncomment the following:
/*
export {
    Auth,
    Database,
    AttendanceSystem,
    ThemeManager,
    formatDate,
    formatTime,
    formatDateTime,
    generateId,
    validateEmail,
    validatePassword
};
*/

// Console log for debugging
console.log('SAFEPASS System Initialized');
console.log('Authentication System:', Auth);
console.log('Database Operations:', Database);
console.log('Attendance System:', AttendanceSystem);
