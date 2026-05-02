const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const FOUNDER_EMAIL = 'brandsbyempress@gmail.com';

async function grantFounderAccess() {
  try {
    console.log('Finding user with email:', FOUNDER_EMAIL);
    
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(FOUNDER_EMAIL);
    console.log('Found user:', userRecord.uid);
    
    // Update Firestore user doc
    const userRef = admin.firestore().doc(`users/${userRecord.uid}`);
    await userRef.set({
      plan: 'phantom_pro',
      is_admin: true,
      lifetime: true,
      subscription_status: 'lifetime',
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    console.log('✅ Successfully granted lifetime PHANTOM PRO to', FOUNDER_EMAIL);
    console.log('UID:', userRecord.uid);
    
    // Verify
    const doc = await userRef.get();
    console.log('Current plan:', doc.data()?.plan);
    console.log('Is admin:', doc.data()?.is_admin);
    console.log('Lifetime:', doc.data()?.lifetime);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

grantFounderAccess();
