import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth }        from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase }    from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyCbPMnkeP228ZBVTOmxfNBkOoqa27NmmSU",
  authDomain: "safe-pass-118a0.firebaseapp.com",
  databaseURL: "https://safe-pass-118a0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "safe-pass-118a0",
  storageBucket: "safe-pass-118a0.firebasestorage.app",
  messagingSenderId: "179931919594",
  appId: "1:179931919594:web:82bb83cf9d2d887dc29393",
  measurementId: "G-8D2DW36L03"
};

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const database = getDatabase(app);

export { auth, database };
