import {initializeApp} from "firebase/app";
import {getDatabase} from "firebase/database";
import {initializeAuth, getReactNativePersistence, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
    databaseURL: process.env.EXPO_PUBLIC_DATABASE_URL,
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_APP_ID
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const logoutAdmin = async () => {
    try {
        await signOut(auth);
        console.log("Admin logged out successfully");
    } catch (error) {
        console.error("Admin logout failed:", error.message);
    }
};

export const loginAsAdmin = async () => {
    const adminEmail = process.env.EXPO_PUBLIC_ADMIN_EMAIL;
    const adminPassword = process.env.EXPO_PUBLIC_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        console.error("Admin email or password is not defined");
        return;
    }

    try {
        console.log("Attempting to log in with email:", adminEmail);
        const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        const user = userCredential.user;
        console.log("Admin logged in successfully:", user.email);
    } catch (error) {
        console.error("Admin login failed:", error.code, error.message);
    }
};

