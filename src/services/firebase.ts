import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const firebaseConfig = {
  apiKey: "AIzaSyAsZSpLPPlnPZ7Nm9SJsa0K7Q3Po0BIE30",
  authDomain: "amyoney-c1ce5.firebaseapp.com",
  projectId: "amyoney-c1ce5",
  storageBucket: "amyoney-c1ce5.firebasestorage.app",
  messagingSenderId: "794729862927",
  appId: "1:794729862927:web:9147f74b40df805748507a",
  measurementId: "G-DLH973XL2Y",
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let authInstance: Auth;
try {
  if (Platform.OS !== 'web') {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } else {
    authInstance = getAuth(app);
  }
} catch {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const firestore = getFirestore(app);

export const isFirebaseConfigured = true;
