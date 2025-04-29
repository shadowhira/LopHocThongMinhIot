// config.js
require('dotenv').config();

module.exports = {
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  },
  simulationInterval: 5000, // Cập nhật dữ liệu cảm biến mỗi 5 giây
  defaultStudents: [
    { rfidId: "rfid_id_1", studentId: "2021607374", name: "Nguyễn Nhất Tâm", class: "2021DHKTMT02" },
    { rfidId: "rfid_id_2", studentId: "2021607123", name: "Nguyễn Việt Hoàn", class: "2021DHKTMT02" },
    { rfidId: "rfid_id_3", studentId: "2021608036", name: "Bùi Tiến Phúc", class: "2021DHKTMT02" }
  ]
};
