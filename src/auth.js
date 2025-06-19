import { auth } from './firebaseClient.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged as fbOnAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firebaseApp } from './firebaseClient.js';

const db = getFirestore(firebaseApp);

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signUp(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  // Создаём профиль с дефолтными значениями
  const profileRef = doc(db, 'profiles', user.uid);
  await setDoc(profileRef, {
    political_power: 100,
    abilities: {}, // можно задать стартовые способности
    created_at: new Date().toISOString(),
    // другие стартовые поля по необходимости
  });
  return userCredential;
}

export function signOut() {
  return fbSignOut(auth);
}

export function onAuthStateChanged(callback) {
  return fbOnAuthStateChanged(auth, callback);
} 