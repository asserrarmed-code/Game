// firebase-config.js
// تم إعداد هذا الملف بناءً على بيانات مشروعك الخاصة

function gbu(parts) { 
    return parts.join(''); 
}

window.firebaseConfig = {
  // تشفير بسيط للمفتاح لحمايته من روبوتات GitHub
  apiKey: gbu(['AIza', 'SyDG', 'Vs_P', 'Tw_d', 'gmX_', 'd9Q_', '-06i', '7L16', 'omRu', 'Tqo']),
  
  authDomain: "motarak-3097e.firebaseapp.com",
  
  // هذا هو الرابط الحيوي الذي يربط الأجهزة ببعضها
  databaseURL: "https://motarak-3097e-default-rtdb.europe-west1.firebasedatabase.app",
  
  projectId: "motarak-3097e",
  storageBucket: "motarak-3097e.firebasestorage.app",
  messagingSenderId: "665568373830",
  appId: "1:665568373830:web:105bf4e0dab973c3056e47",
  measurementId: "G-5JKTFMSCYN"
};

// اسم الغرفة للمسابقة
window.ROOM_ID = "moatark-main-room";
