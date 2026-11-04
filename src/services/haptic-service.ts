import { Vibration, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HAPTIC_PREF_KEY = '@amyoney_haptic_enabled';

class HapticService {
  private enabled: boolean = true;
  private initialized: boolean = false;

  async init() {
    if (this.initialized) return;
    try {
      const stored = await AsyncStorage.getItem(HAPTIC_PREF_KEY);
      if (stored !== null) {
        this.enabled = stored === 'true';
      }
    } catch {
      // Default to true if storage fails
      this.enabled = true;
    }
    this.initialized = true;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async setEnabled(val: boolean) {
    this.enabled = val;
    try {
      await AsyncStorage.setItem(HAPTIC_PREF_KEY, val ? 'true' : 'false');
    } catch {
      // ignore
    }
  }

  /**
   * Getaran sangat singkat (12-15ms) untuk feedback ketuk tombol keypad, tab, atau toggle
   */
  light() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      Vibration.vibrate(15);
    } catch {
      // ignore vibration errors
    }
  }

  /**
   * Getaran medium (25ms) untuk aksi konfirmasi ringan atau switch mode
   */
  medium() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      Vibration.vibrate(25);
    } catch {
      // ignore
    }
  }

  /**
   * Getaran sukses berirama ganda (2 ketukan halus) saat berhasil menyimpan transaksi atau update
   */
  success() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      // Pola getar: jeda 0ms, getar 25ms, jeda 40ms, getar 35ms
      Vibration.vibrate([0, 25, 40, 35]);
    } catch {
      // fallback
      try {
        Vibration.vibrate(35);
      } catch {
        // ignore
      }
    }
  }

  /**
   * Getaran peringatan / delete item
   */
  warning() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      Vibration.vibrate([0, 40, 50, 40]);
    } catch {
      // ignore
    }
  }
}

export const hapticService = new HapticService();

