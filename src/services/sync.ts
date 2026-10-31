import { collection, doc, setDoc } from 'firebase/firestore';
import { dbRepository } from '@/db/database';
import { isFirebaseConfigured } from './firebase';

export async function syncLocalToFirebase(userId?: string): Promise<{ success: boolean; message: string }> {
  if (!isFirebaseConfigured) {
    return {
      success: false,
      message: 'Firebase belum dikonfigurasi. Masukkan kunci konfigurasi Firebase di src/services/firebase.ts atau file .env.',
    };
  }

  try {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const { firebaseConfig, auth } = await import('./firebase');

    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const uid = userId || auth.currentUser?.uid;

    if (!uid) {
      return {
        success: false,
        message: 'Silakan masuk (login) terlebih dahulu untuk menyinkronkan data ke Cloud Firestore.',
      };
    }

    const [wallets, categories, transactions] = await Promise.all([
      dbRepository.getWallets(),
      dbRepository.getCategories(),
      dbRepository.getTransactions(500),
    ]);

    // Simpan wallets ke sub-koleksi user
    for (const w of wallets) {
      await setDoc(doc(collection(firestore, `users/${uid}/wallets`), w.id), w, { merge: true });
    }

    // Simpan categories ke sub-koleksi user
    for (const c of categories) {
      await setDoc(doc(collection(firestore, `users/${uid}/categories`), c.id), c, { merge: true });
    }

    // Simpan transactions ke sub-koleksi user
    for (const t of transactions) {
      await setDoc(doc(collection(firestore, `users/${uid}/transactions`), t.id), t, { merge: true });
    }

    return {
      success: true,
      message: `Berhasil menyinkronkan ${wallets.length} dompet, ${categories.length} kategori, dan ${transactions.length} transaksi ke Cloud Firestore.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Gagal melakukan sinkronisasi ke Firebase.',
    };
  }
}
