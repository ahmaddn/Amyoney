import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  subscribeAuth(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  async signUp(email: string, pass: string): Promise<User> {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    return cred.user;
  },

  async signIn(email: string, pass: string): Promise<User> {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return cred.user;
  },

  async signInWithGoogle(): Promise<User> {
    if (typeof window === 'undefined' || !window.document) {
      throw new Error(
        'Login Google via popup hanya didukung pada Web. Di Android/iOS silakan gunakan Masuk dengan Email & Password atau Masuk sebagai Tamu.'
      );
    }
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  },

  async signInWithGoogleIdToken(idToken: string): Promise<User> {
    const credential = GoogleAuthProvider.credential(idToken);
    const cred = await signInWithCredential(auth, credential);
    return cred.user;
  },

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  },
};
