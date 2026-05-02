#!/usr/bin/env node

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDWLxGqKJYxqxqxqxqxqxqxqxqxqxqxqxq",
  authDomain: "the-phantom-app-io.firebaseapp.com",
  projectId: "the-phantom-app-io",
  storageBucket: "the-phantom-app-io.firebasestorage.app",
  messagingSenderId: "367209793577",
  appId: "1:367209793577:web:xxxxxxxxxxxxx"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const EMAIL = 'brandsbyempress@gmail.com';

async function grantProAccess() {
  try {
    console.log('🔍 Getting user UID for:', EMAIL);
    
    // You need to be signed in to update your own document
    const userCredential = await signInWithEmailAndPassword(auth, EMAIL, process.argv[2]);
    const uid = userCredential.user.uid;
    
    console.log('✅ Signed in with UID:', uid);
    
    const userRef = doc(db, 'users', uid);
    
    await setDoc(userRef, {
      plan: 'phantom_pro',
      is_admin: true,
      lifetime: true,
      subscription_status: 'lifetime',
      updated_at: serverTimestamp(),
    }, { merge: true });
    
    console.log('✅ Granted lifetime PHANTOM PRO access!');
    console.log('🎉 Refresh your app to see the changes.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

grantProAccess();
