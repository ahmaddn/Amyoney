import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { PalettePresets, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/context/theme-context';
import { notificationService } from '@/services/notification-service';
import { syncLocalToFirebase } from '@/services/sync';
import { CurrencyCode, SUPPORTED_CURRENCIES } from '@/utils/format';
import AuthScreen from '@/app/auth';
import { PatchNotesModal } from '@/components/settings/patch-notes-modal';
import { Ionicons } from '@expo/vector-icons';

interface SettingsTabProps {
  onClose?: () => void;
}

export function SettingsTab({ onClose }: SettingsTabProps = {}) {
  const { user, isGuest, signOut } = useAuth();
  const {
    themeMode,
    resolvedTheme,
    colorPreset,
    currency,
    colors,
    setThemeMode,
    setColorPreset,
    setCurrency,
  } = useAppTheme();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPatchNotesOpen, setIsPatchNotesOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifStatusMessage, setNotifStatusMessage] = useState<string | null>(null);

  // Muat status toggle notifikasi tersimpan saat layar dibuka
  useEffect(() => {
    let isMounted = true;
    const loadNotificationState = async () => {
      try {
        const savedNotifPref = await AsyncStorage.getItem('@amyoney_notif_enabled');
        const hasPermission = await notificationService.checkPermissions();
        if (isMounted) {
          if (savedNotifPref === 'true' && hasPermission) {
            setNotifEnabled(true);
          } else if (savedNotifPref === 'true' && !hasPermission) {
            // Pengguna sebelumnya on tapi permission belum aktif
            setNotifEnabled(false);
            await AsyncStorage.setItem('@amyoney_notif_enabled', 'false');
          } else {
            setNotifEnabled(false);
          }
        }
      } catch {
        // Fallback
      }
    };
    loadNotificationState();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleNotification = async (enabled: boolean) => {
    if (enabled) {
      const granted = await notificationService.requestPermissions();
      if (granted) {
        setNotifEnabled(true);
        await AsyncStorage.setItem('@amyoney_notif_enabled', 'true');
        await notificationService.scheduleDailyReminder(20, 0);
        await notificationService.sendLocalNotification(
          'Notifikasi Diaktifkan',
          'Amyoney siap mengingatkan pencatatan keuangan harian Anda.'
        );
        setNotifStatusMessage('Notifikasi aktif: Pengingat malam (20:00) & konfirmasi transaksi.');
      } else {
        setNotifEnabled(false);
        await AsyncStorage.setItem('@amyoney_notif_enabled', 'false');
        setNotifStatusMessage('Izin notifikasi ditolak oleh sistem');
      }
    } else {
      setNotifEnabled(false);
      await AsyncStorage.setItem('@amyoney_notif_enabled', 'false');
      await notificationService.cancelReminders();
      setNotifStatusMessage('Notifikasi dinonaktifkan');
    }
    setTimeout(() => setNotifStatusMessage(null), 4000);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Menyinkronkan data...');
    const res = await syncLocalToFirebase(user?.uid);
    setSyncStatus(res.message);
    setIsSyncing(false);
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      signOut();
    } else {
      Alert.alert('Keluar dari Akun', 'Apakah Anda yakin ingin keluar dari akun Amyoney?', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: () => signOut() },
      ]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(300).springify()} style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.screenTitle, { color: colors.text }]}>
            Pengaturan
          </ThemedText>
          <ThemedText style={[styles.subText, { color: colors.textSecondary }]}>
            Kelola profil pengguna, preferensi tema, dan sinkronisasi.
          </ThemedText>
        </View>
        {onClose && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tutup Pengaturan"
            style={[styles.closeModalBtn, { borderColor: colors.border }]}
            onPress={onClose}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        )}
      </Animated.View>

      {/* Profil Pengguna */}
      <Animated.View entering={FadeInDown.delay(100).duration(350).springify()} style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>PROFIL PENGGUNA</ThemedText>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: colors.brandPrimary }]}>
            <ThemedText style={styles.avatarText}>
              {user?.email ? user.email.charAt(0).toUpperCase() : 'G'}
            </ThemedText>
          </View>
          <View style={styles.profileInfo}>
            <ThemedText style={[styles.profileEmail, { color: colors.text }]}>
              {user ? user.email : 'Mode Tamu (Lokal)'}
            </ThemedText>
            <ThemedText style={[styles.profileStatus, { color: user ? colors.income : colors.textSecondary }]}>
              {user ? 'Terhubung ke Cloud Firestore' : 'Penyimpanan lokal SQLite'}
            </ThemedText>
          </View>
        </View>

        {user ? (
          <Pressable
            accessibilityRole="button"
            style={[styles.actionBtn, { backgroundColor: colors.expenseBg, borderColor: colors.expense, marginTop: 14 }]}
            onPress={handleSignOut}
          >
            <ThemedText style={[styles.actionBtnText, { color: colors.expense }]}>
              Keluar dari Akun
            </ThemedText>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            style={[styles.actionBtn, { backgroundColor: colors.brandPrimary, marginTop: 14 }]}
            onPress={() => setIsAuthModalOpen(true)}
          >
            <ThemedText style={[styles.actionBtnText, { color: '#FFFFFF' }]}>
              Masuk atau Buat Akun
            </ThemedText>
          </Pressable>
        )}
      </Animated.View>

      {/* Sinkronisasi Cloud */}
      <Animated.View entering={FadeInDown.delay(150).duration(350).springify()} style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>SINKRONISASI CLOUD</ThemedText>
        <ThemedText style={[styles.settingDesc, { color: colors.textSecondary }]}>
          Sinkronkan catatan mutasi dan pagu anggaran antara database lokal dan Firebase Firestore.
        </ThemedText>

        <Pressable
          accessibilityRole="button"
          style={[styles.outlineBtn, { borderColor: colors.border }]}
          onPress={handleSync}
          disabled={isSyncing}
        >
          <ThemedText style={[styles.outlineBtnText, { color: colors.text }]}>
            {isSyncing ? 'Sedang Menyinkronkan...' : 'Sinkronkan Sekarang'}
          </ThemedText>
        </Pressable>

        {syncStatus && (
          <ThemedText style={[styles.syncStatusText, { color: colors.brandPrimary }]}>
            {syncStatus}
          </ThemedText>
        )}
      </Animated.View>

      {/* Preferensi */}
      <Animated.View entering={FadeInDown.delay(200).duration(350).springify()} style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>TEMA & TAMPILAN</ThemedText>

        <View style={styles.themeSelectorRow}>
          {(['system', 'light', 'dark'] as const).map((mode) => {
            const isSelected = themeMode === mode;
            const labels = { system: 'Sistem', light: 'Terang', dark: 'Gelap' };
            return (
              <Pressable
                key={mode}
                accessibilityRole="button"
                accessibilityLabel={`Pilih tema ${labels[mode]}`}
                style={[
                  styles.themeOptionBtn,
                  {
                    backgroundColor: isSelected ? colors.brandPrimary : colors.backgroundSelected,
                    borderColor: isSelected ? colors.brandPrimary : colors.border,
                  },
                ]}
                onPress={() => setThemeMode(mode)}
              >
                <ThemedText
                  style={[
                    styles.themeOptionText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {labels[mode]}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <ThemedText style={[styles.activeThemeHint, { color: colors.textSecondary }]}>
          Tema aktif saat ini: {resolvedTheme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}
        </ThemedText>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Pilihan Palet Warna Aksen */}
        <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>WARNA AKSEN UTAMA</ThemedText>
        <View style={styles.presetGrid}>
          {(Object.keys(PalettePresets) as (keyof typeof PalettePresets)[]).map((key) => {
            const p = PalettePresets[key];
            const isSelected = colorPreset === key;
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={`Pilih warna ${p.name}`}
                style={[
                  styles.presetBtn,
                  {
                    backgroundColor: isSelected ? colors.backgroundElement : colors.backgroundSelected,
                    borderColor: isSelected ? colors.brandPrimary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => setColorPreset(key)}
              >
                <View style={[styles.colorCircle, { backgroundColor: p.lightPrimary }]} />
                <ThemedText style={[styles.presetName, { color: colors.text, fontWeight: isSelected ? '700' : '500' }]}>
                  {p.name}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Pilihan Mata Uang / Kurs */}
        <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>MATA UANG & KONVERSI KURS</ThemedText>
        <View style={styles.currencyRow}>
          {(Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[]).map((code) => {
            const c = SUPPORTED_CURRENCIES[code];
            const isSelected = currency === code;
            return (
              <Pressable
                key={code}
                accessibilityRole="button"
                accessibilityLabel={`Pilih mata uang ${c.name}`}
                style={[
                  styles.currencyBtn,
                  {
                    backgroundColor: isSelected ? colors.brandPrimary : colors.backgroundSelected,
                    borderColor: isSelected ? colors.brandPrimary : colors.border,
                  },
                ]}
                onPress={() => setCurrency(code)}
              >
                <ThemedText style={[styles.currencyBtnText, { color: isSelected ? '#FFFFFF' : colors.text, fontWeight: isSelected ? '700' : '500' }]}>
                  {c.symbol} {c.code}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <ThemedText style={{ fontSize: 11, color: colors.textSecondary, marginTop: 8, lineHeight: 16 }}>
          💡 Nilai nominal seluruh transaksi, saldo, dan pagu otomatis terkonversi secara matematis sesuai kurs valuta aktif saat mata uang diubah.
        </ThemedText>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <ThemedText style={[styles.cardLabel, { color: colors.textSecondary }]}>NOTIFIKASI & RESPON</ThemedText>
        
        {/* Notifikasi Pengingat */}
        <View style={styles.preferenceRow}>
          <View style={styles.prefTextCol}>
            <ThemedText style={[styles.prefTitle, { color: colors.text }]}>Pengingat Harian & Evaluasi Pagu</ThemedText>
            <ThemedText style={[styles.prefDesc, { color: colors.textSecondary }]}>
              Pengingat catat kas malam (20:00), peringatan pagu hampir habis (80%), dan evaluasi boros/hemat
            </ThemedText>
          </View>
          <Switch
            value={notifEnabled}
            onValueChange={handleToggleNotification}
            trackColor={{ false: colors.border, true: colors.brandPrimary }}
          />
        </View>

        {notifStatusMessage && (
          <ThemedText style={[styles.notifStatusText, { color: colors.brandPrimary }]}>
            {notifStatusMessage}
          </ThemedText>
        )}

        {/* Rincian Cakupan Notifikasi Pintar */}
        <View style={{ marginTop: 8, padding: 10, borderRadius: 8, backgroundColor: colors.backgroundSelected }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Ionicons name="notifications-outline" size={14} color={colors.brandPrimary} />
            <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
              Cakupan Notifikasi Pintar:
            </ThemedText>
          </View>
          <ThemedText style={{ fontSize: 11, color: colors.textSecondary, lineHeight: 16 }}>
            • Pengingat Catat Mutasi: Jam 20:00 WIB setiap malam agar tidak ada struk terlewat.{'\n'}
            • Peringatan Pagu Kritis: Saat pengeluaran kategori mencapai ≥80% dari batas pagu.{'\n'}
            • Evaluasi Sisa Dana: Rekomendasi batas aman belanja harian setiap awal hari.
          </ThemedText>
        </View>

        <View style={styles.preferenceRow}>
          <View style={styles.prefTextCol}>
            <ThemedText style={[styles.prefTitle, { color: colors.text }]}>Getaran Respon (Haptic)</ThemedText>
            <ThemedText style={[styles.prefDesc, { color: colors.textSecondary }]}>Respon sentuhan saat menekan tombol</ThemedText>
          </View>
          <Switch
            value={hapticFeedback}
            onValueChange={setHapticFeedback}
            trackColor={{ false: colors.border, true: colors.brandPrimary }}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Status Sesi</ThemedText>
          <ThemedText style={[styles.infoValue, { color: user ? colors.income : colors.textSecondary }]}>
            {user ? 'Akun Terdaftar (Cloud)' : isGuest ? 'Tamu (Lokal)' : 'Belum Masuk'}
          </ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Versi Aplikasi</ThemedText>
          <ThemedText style={[styles.infoValue, { color: colors.text }]}>1.2.0 (Build 2026)</ThemedText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Buka Catatan Pembaruan"
          style={[styles.patchNoteBtn, { borderColor: colors.border }]}
          onPress={() => setIsPatchNotesOpen(true)}
        >
          <ThemedText style={[styles.patchNoteBtnText, { color: colors.brandPrimary }]}>
            Lihat Catatan Pembaruan (Patch Notes)
          </ThemedText>
        </Pressable>
      </Animated.View>

      {/* Modal Auth */}
      <Modal visible={isAuthModalOpen} animationType="slide">
        <AuthScreen onDismiss={() => setIsAuthModalOpen(false)} />
      </Modal>

      {/* Modal Patch Notes */}
      <PatchNotesModal visible={isPatchNotesOpen} onClose={() => setIsPatchNotesOpen(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subText: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  closeModalBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#F7F8F5',
    fontSize: 20,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  profileStatus: {
    fontSize: 12,
  },
  actionBtn: {
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  themeOptionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOptionText: {
    fontSize: 13,
  },
  activeThemeHint: {
    fontSize: 12,
    marginBottom: 6,
  },
  outlineBtn: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  syncStatusText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  prefTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  prefDesc: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  presetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  colorCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  presetName: {
    fontSize: 12,
  },
  currencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  currencyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  currencyBtnText: {
    fontSize: 12,
  },
  notifStatusText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  patchNoteBtn: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  patchNoteBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
