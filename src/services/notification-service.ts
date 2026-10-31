import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Konfigurasi bagaimana notifikasi ditampilkan saat aplikasi aktif
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  /**
   * Minta izin notifikasi ke sistem operasi
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        }
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch {
      return false;
    }
  },

  /**
   * Periksa status izin notifikasi saat ini
   */
  async checkPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
      }
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  },

  /**
   * Kirim notifikasi lokal seketika (misal saat transaksi berhasil dicatat)
   */
  async sendLocalNotification(title: string, body: string) {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) return;

      if (Platform.OS === 'web') {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/assets/images/icon.png' });
        }
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: null, // kirim langsung
      });
    } catch {
      // ignore
    }
  },

  /**
   * Jadwalkan pengingat malam hari (jam 20:00)
   */
  async scheduleDailyReminder(hour: number = 20, minute: number = 0) {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) return;

      if (Platform.OS !== 'web') {
        // Batalkan notifikasi berulang sebelumnya agar tidak duplikat
        await Notifications.cancelAllScheduledNotificationsAsync();

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Amyoney Pengingat',
            body: 'Sudahkah Anda mencatat pengeluaran dan pemasukan hari ini?',
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
          },
        });
      }
    } catch {
      // ignore
    }
  },

  async cancelReminders() {
    try {
      if (Platform.OS !== 'web') {
        await Notifications.cancelAllScheduledNotificationsAsync();
      }
    } catch {
      // ignore
    }
  },
};
