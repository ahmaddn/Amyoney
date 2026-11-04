import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  Auth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
} from 'firebase/auth';
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

// Adapter persistensi React Native khusus menggunakan AsyncStorage
// Mengimplementasikan interface Persistence Firebase v13 secara mandiri dan aman dari error bundling
function createReactNativePersistence(storage: typeof ReactNativeAsyncStorage) {
  return class ReactNativeStoragePersistence {
    static type = 'LOCAL';
    type = 'LOCAL';

    async _isAvailable(): Promise<boolean> {
      try {
        if (!storage) return false;
        await storage.setItem('__sak', '1');
        await storage.removeItem('__sak');
        return true;
      } catch {
        return false;
      }
    }

    _set(key: string, value: any): Promise<void> {
      return storage.setItem(key, JSON.stringify(value));
    }

    async _get(key: string): Promise<any> {
      const json = await storage.getItem(key);
      return json ? JSON.parse(json) : null;
    }

    _remove(key: string): Promise<void> {
      return storage.removeItem(key);
    }

    _addListener(_key: string, _listener: any): void {}
    _removeListener(_key: string, _listener: any): void {}
  };
}

let authInstance: Auth;
try {
  if (Platform.OS !== 'web') {
    authInstance = initializeAuth(app, {
      persistence: createReactNativePersistence(ReactNativeAsyncStorage) as any,
    });
  } else {
    authInstance = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    });
  }
} catch {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const firestore = getFirestore(app);

export const isFirebaseConfigured = true;
