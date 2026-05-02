#!/usr/bin/env node

/**
 * Grant Lifetime PHANTOM PRO to Founder Account
 * 
 * Usage: node grantFounder.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const FOUNDER_EMAIL = 'brandsbyempress@gmail.com';

// Initialize with project ID (no service account needed for local admin)
initializeApp({
  projectId: 'the-phantom-app-io'
});

const auth = getAuth();
const db = getFirestore();

async function grantFounderAccess() {
  try {
    console.log('🔍 Finding user:', FOUNDER_EMAIL);
    
    const userRecord = await auth.getUserByEmail(FOUNDER_EMAIL);
    console.log('✅ Found user with UID:', userRecord.uid);
    
    const userRef = db.doc(`users/${userRecord.uid}`);
    
    await userRef.set({
      plan: 'phantom_pro',
      is_admin: true,
      lifetime: true,
      subscription_status: 'lifetime',
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });
    
    console.log('✅ Granted lifetime PHANTOM PRO access!');
    
    const doc = await userRef.get();
    const data = doc.data();
    
    console.log('\n📋 Account Status:');
    console.log('   Email:', data.email);
    console.log('   Plan:', data.plan);
    console.log('   Admin:', data.is_admin);
    console.log('   Lifetime:', data.lifetime);
    console.log('   Status:', data.subscription_status);
    
    console.log('\n🎉 Done! Refresh your app to see the changes.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n💡 User not found. Make sure you\'ve signed up with:', FOUNDER_EMAIL);
    }
    
    process.exit(1);
  }
}

grantFounderAccess();
