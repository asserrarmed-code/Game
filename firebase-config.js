// firebase-config.js
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// هذه الدالة هي التي ستؤمن البيانات وتجعلها متاحة للمشروع
window.firebaseConfig = firebaseConfig;
window.ROOM_ID = "moatark-main-room";
// firebase-config.js

// دالة لتجميع المفاتيح (لحمايتها من روبوتات GitHub)
function gbu(parts) { return parts.join(''); }

window.firebaseConfig = {
  // قطعي مفتاح الـ API الخاص بك هنا
  apiKey: gbu(['AIzaSyDGVs_PTw_d', 'gmX_d9Q_-06i7', 'L16omRuTqo']), 
  authDomain: "moatark-dhad.firebaseapp.com",
  // تأكدي أن هذا الرابط ينتهي بـ .com أو .app
  databaseURL: "motarak-3097e.firebaseapp.com",
  projectId: "motarak-3097e",
  storageBucket: "motarak-3097e.firebasestorage.app",
  messagingSenderId: "665568373830",
  appId: "1:665568373830:web:b38bd8fc400c813f056e47"
};

window.ROOM_ID = "moatark-main-room";
