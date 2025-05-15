import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey) throw new Error('Missing Firebase API Key');
if (!firebaseConfig.authDomain) throw new Error('Missing Firebase Auth Domain');
if (!firebaseConfig.projectId) throw new Error('Missing Firebase Project ID');
if (!firebaseConfig.storageBucket) throw new Error('Missing Firebase Storage Bucket');
if (!firebaseConfig.messagingSenderId) throw new Error('Missing Firebase Messaging Sender ID');
if (!firebaseConfig.appId) throw new Error('Missing Firebase App ID');

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app); 