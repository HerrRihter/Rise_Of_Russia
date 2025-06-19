// Инициализация Firebase для фронтенда
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDOFVYuBRPE2I5seNbs0VjQHAyRXIy1m4Q",
    authDomain: "riseofrussia-47d51.firebaseapp.com",
    projectId: "riseofrussia-47d51",
    storageBucket: "riseofrussia-47d51.firebasestorage.app",
    messagingSenderId: "245045462523",
    appId: "1:245045462523:web:0e8880b8d8eb807f21b75e",
    measurementId: "G-S2676N70ZN"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

export { firebaseApp, auth, firebaseConfig }; 