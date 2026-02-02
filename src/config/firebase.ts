// src/config/firebase.ts

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDzkfy2uJvtlWQJaYZpg31Lbv08vF39xHs",
  authDomain: "todolistapp-824ee.firebaseapp.com",
  projectId: "todolistapp-824ee",
  storageBucket: "todolistapp-824ee.firebasestorage.app",
  messagingSenderId: "663415016936",
  appId: "1:663415016936:web:3c645bb76abe94cf7a685d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
