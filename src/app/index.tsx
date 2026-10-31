import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AddTransactionModal } from '@/components/money/add-transaction-modal';
import { GuestLockModal } from '@/components/money/guest-lock-modal';
import { OnlineSyncPromptModal } from '@/components/money/online-sync-prompt-modal';
import { CustomTabBar, TabKey } from '@/components/navigation/custom-tab-bar';
import { PatchNotesModal, APP_PATCH_NOTES } from '@/components/settings/patch-notes-modal';
import { BudgetTab } from '@/components/tabs/budget-tab';
import { OverviewTab } from '@/components/tabs/overview-tab';
import { SavingsDebtsTab } from '@/components/tabs/savings-debts-tab';
import { SettingsTab } from '@/components/tabs/settings-tab';
import { StatsTab } from '@/components/tabs/stats-tab';
import { TransactionsTab } from '@/components/tabs/transactions-tab';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/context/theme-context';
import { useMoneyData } from '@/hooks/use-money-data';
import { syncLocalToFirebase } from '@/services/sync';
import AuthScreen from './auth';

const LAST_SEEN_PATCH_VERSION_KEY = '@amyoney_last_seen_patch_version';

export default function MainApp() {
  const { colors } = useAppTheme();

  const { user, isGuest, loading: authLoading, exitGuestMode } = useAuth();
  const { wallets, categories, addTransaction, addCategory } = useMoneyData();

  const [activeTab, setActiveTab] = useState<TabKey>('index');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState<string | null>(null);
  const [showOnlineSyncPrompt, setShowOnlineSyncPrompt] = useState(false);
  const [isSyncingFromPrompt, setIsSyncingFromPrompt] = useState(false);
  const [showNewUpdateModal, setShowNewUpdateModal] = useState(false);

  // Deteksi pembaruan versi baru: Otomatis tampilkan modal patch notes saat ada versi baru
  useEffect(() => {
    if (authLoading) return;
    if (!user && !isGuest) return;

    let isMounted = true;

    const checkNewVersion = async () => {
      try {
        const latestVersion = APP_PATCH_NOTES[0]?.version;
        if (!latestVersion) return;

        const lastSeen = await AsyncStorage.getItem(LAST_SEEN_PATCH_VERSION_KEY);
        if (lastSeen !== latestVersion && isMounted) {
          // Berikan jeda kecil agar screen index selesai me-render sebelum memunculkan modal
          setTimeout(() => {
            if (isMounted) {
              setShowNewUpdateModal(true);
            }
          }, 350);
        }
      } catch {
        // Fallback jika storage gagal diakses
      }
    };

    checkNewVersion();

    return () => {
      isMounted = false;
    };
  }, [user, isGuest, authLoading]);

  // Deteksi transisi dari offline ke online
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleOnline = () => {
        // Tampilkan modal perintah sync jika pengguna bukan tamu atau memiliki akun
        if (user && !isGuest) {
          setShowOnlineSyncPrompt(true);
        }
      };

      window.addEventListener('online', handleOnline);
      return () => {
        window.removeEventListener('online', handleOnline);
      };
    }
  }, [user, isGuest]);

  const handleExecutePromptSync = async () => {
    setIsSyncingFromPrompt(true);
    await syncLocalToFirebase();
    setIsSyncingFromPrompt(false);
    setShowOnlineSyncPrompt(false);
  };

  // 1. Jika masih memeriksa auth, biarkan splash screen menutupi
  if (authLoading) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  // 2. Auth Gate: Jika belum login dan bukan tamu, tampilkan layar Login
  if (!user && !isGuest) {
    return <AuthScreen />;
  }

  // Judul halaman untuk universal header
  const getPageTitle = (tab: TabKey) => {
    switch (tab) {
      case 'transactions':
        return 'Riwayat Transaksi';
      case 'savings':
        return 'Tabungan & Hutang';
      case 'stats':
        return 'Statistik Finansial';
      case 'budget':
        return 'Pagu Anggaran';
      case 'settings':
        return 'Pengaturan';
      default:
        return 'Amyoney';
    }
  };

  // 3. User sudah login atau masuk sebagai tamu: Tampilkan Dashboard utama
  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Universal Top Header (Tampil di setiap tab selain Beranda yang sudah memiliki header terintegrasi) */}
      {activeTab !== 'index' && (
        <View style={[styles.universalTopBar, { backgroundColor: colors.backgroundElement, borderBottomColor: colors.border }]}>
          <ThemedText style={[styles.universalPageTitle, { color: colors.text }]}>
            {getPageTitle(activeTab)}
          </ThemedText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Buka Pengaturan Universal"
            style={[styles.universalSettingsBtn, { backgroundColor: colors.backgroundSelected, borderColor: colors.border }]}
            onPress={() => setIsSettingsModalOpen(true)}
          >
            <Ionicons name="settings-outline" size={18} color={colors.text} />
          </Pressable>
        </View>
      )}

      {/* Konten Tab Aktif */}
      <View style={styles.contentArea}>
        {activeTab === 'index' && (
          <OverviewTab
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenAuth={() => setIsSettingsModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenBudget={() => {
              if (isGuest) {
                setLockedFeatureName('Pagu Anggaran Bulanan');
                return;
              }
              setActiveTab('budget');
            }}
            onOpenStats={() => {
              if (isGuest) {
                setLockedFeatureName('Statistik & Analisis Keuangan');
                return;
              }
              setActiveTab('stats');
            }}
            onRequireAuth={(name) => setLockedFeatureName(name)}
          />
        )}
        {activeTab === 'transactions' && <TransactionsTab />}
        {activeTab === 'savings' && <SavingsDebtsTab />}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </View>

      {/* Persistent Bottom Navigation Bar */}
      <CustomTabBar
        currentTab={activeTab}
        onSelectTab={(tab) => {
          if (isGuest && (tab === 'stats' || tab === 'budget' || tab === 'savings')) {
            const name =
              tab === 'stats'
                ? 'Statistik & Analisis Keuangan'
                : tab === 'savings'
                ? 'Tabungan & Buku Hutang'
                : 'Pagu Anggaran Bulanan';
            setLockedFeatureName(name);
            return;
          }
          setActiveTab(tab);
        }}
        onPressAdd={() => setIsAddModalOpen(true)}
      />

      {/* Bottom Sheet Modal Catat Transaksi */}
      <AddTransactionModal
        visible={isAddModalOpen}
        wallets={wallets}
        categories={categories}
        onClose={() => setIsAddModalOpen(false)}
        onRequireAuth={(name) => setLockedFeatureName(name)}
        onAddCategory={async (newCat) => {
          await addCategory({
            ...newCat,
            monthlyBudget: 0,
          });
        }}
        onSubmit={async (data) => {
          await addTransaction({
            id: `tx_${Date.now()}`,
            ...data,
          });
        }}
      />

      {/* Dialog Proteksi Fitur Khusus Tamu */}
      <GuestLockModal
        visible={Boolean(lockedFeatureName)}
        featureName={lockedFeatureName || ''}
        onClose={() => setLockedFeatureName(null)}
        onLogin={() => {
          setLockedFeatureName(null);
          exitGuestMode();
        }}
      />

      {/* Modal Perintah Sync Otomatis Saat Kembali Online */}
      <OnlineSyncPromptModal
        visible={showOnlineSyncPrompt}
        isSyncing={isSyncingFromPrompt}
        onClose={() => setShowOnlineSyncPrompt(false)}
        onSync={handleExecutePromptSync}
      />

      {/* Modal Pengaturan Universal (Bisa dibuka dari halaman manapun) */}
      <Modal
        visible={isSettingsModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsSettingsModalOpen(false)}
      >
        <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
          <SettingsTab onClose={() => setIsSettingsModalOpen(false)} />
        </SafeAreaView>
      </Modal>

      {/* Modal Otomatis: Tampil saat ada pembaruan fitur / versi baru */}
      <PatchNotesModal
        visible={showNewUpdateModal}
        onClose={async () => {
          setShowNewUpdateModal(false);
          const latestVersion = APP_PATCH_NOTES[0]?.version;
          if (latestVersion) {
            await AsyncStorage.setItem(LAST_SEEN_PATCH_VERSION_KEY, latestVersion);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
  universalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  universalPageTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  universalSettingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
