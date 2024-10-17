import { initializeApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
