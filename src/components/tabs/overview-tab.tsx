import { useState } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BudgetCard } from '@/components/money/budget-card';
import { ConfirmationModal } from '@/components/money/confirmation-modal';
import { EmptyState } from '@/components/money/empty-state';
import { ManageWalletsModal } from '@/components/money/manage-wallets-modal';
import { TransactionItem } from '@/components/money/transaction-item';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/context/theme-context';
import { useMoneyData } from '@/hooks/use-money-data';
import { formatRupiah } from '@/utils/format';

interface OverviewTabProps {
  onOpenAddModal: () => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onOpenBudget: () => void;
  onOpenStats: () => void;
  onRequireAuth: (featureName: string) => void;
}

const PRESET_ICONS = {
  forest: require('@/assets/images/icon-forest.png'),
  sapphire: require('@/assets/images/icon-sapphire.png'),
  obsidian: require('@/assets/images/icon-obsidian.png'),
  terracotta: require('@/assets/images/icon-terracotta.png'),
};

export function OverviewTab({ onOpenAddModal, onOpenAuth, onOpenSettings, onOpenBudget, onOpenStats, onRequireAuth }: OverviewTabProps) {
  const { colors, resolvedTheme, colorPreset, currency } = useAppTheme();
  const { user, isGuest } = useAuth();

  const {
    loading,
    wallets,
    categories,
    transactions,
    overview,
    budgetProgress,
    refresh,
    deleteTransaction,
    updateWallet,
    addWallet,
    deleteWallet,
    resetAllWalletBalances,
  } = useMoneyData();

  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [isResetWalletsModalOpen, setIsResetWalletsModalOpen] = useState(false);
  const [isManageWalletsModalOpen, setIsManageWalletsModalOpen] = useState(false);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const walletMap = new Map(wallets.map((w) => [w.id, w]));
  const recentTransactions = transactions.slice(0, 5);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.brandPrimary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Ringkas dengan Logo Ikon & Status Akun */}
      <Animated.View entering={FadeInDown.duration(300).springify()} style={styles.topBar}>
        <View style={styles.brandRow}>
          <Image
            source={PRESET_ICONS[colorPreset] || PRESET_ICONS.forest}
            style={styles.brandLogoIcon}
            resizeMode="cover"
          />
          <View>
            <ThemedText style={[styles.brandWordmark, { color: colors.text }]}>
              Amyoney<ThemedText style={{ color: colors.brandAccent }}>.</ThemedText>
            </ThemedText>
            <ThemedText style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
              {user ? user.email : 'Mode Tamu (Lokal)'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.topRightActions}>
          {/* Tombol Statistik Akses Cepat */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Buka Statistik & Laporan"
            style={[styles.settingsTopBtn, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
            onPress={onOpenStats}
          >
            <Ionicons name="pie-chart-outline" size={18} color={colors.text} />
          </Pressable>

          {/* Tombol Pengaturan Akses Cepat */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Buka Pengaturan"
            style={[styles.settingsTopBtn, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
            onPress={onOpenSettings}
          >
            <Ionicons name="settings-outline" size={18} color={colors.text} />
          </Pressable>
        </View>
      </Animated.View>

      {/* 2. Hero Balance Card (Dynamic per preset & dark/light) */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(350).springify()}
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.heroBg,
            shadowColor: colors.heroBg,
          },
        ]}
      >
        <ThemedText style={[styles.heroLabel, { color: 'rgba(255, 255, 255, 0.75)' }]}>
          TOTAL KEKAYAAN BERSIH
        </ThemedText>
        <View style={styles.heroAmountRow}>
          <ThemedText style={[styles.heroAmount, { color: colors.heroText }]}>
            {formatRupiah(overview.totalBalance, currency)}
          </ThemedText>
        </View>

        {/* Arus Kas Bulanan */}
        <View style={styles.heroCashflowRow}>
          <View style={styles.cashflowCol}>
            <ThemedText style={[styles.heroSubLabel, { color: 'rgba(255, 255, 255, 0.75)' }]}>Pemasukan Bulan Ini</ThemedText>
            <ThemedText style={[styles.incomeAmount, { color: colors.heroAccent }]}>
              +{formatRupiah(overview.monthlyIncome, currency)}
            </ThemedText>
          </View>

          <View style={styles.cashflowDivider} />

          <View style={styles.cashflowCol}>
            <ThemedText style={[styles.heroSubLabel, { color: 'rgba(255, 255, 255, 0.75)' }]}>Pengeluaran Bulan Ini</ThemedText>
            <ThemedText style={[styles.expenseAmount, { color: '#FFA48D' }]}>
              -{formatRupiah(overview.monthlyExpense, currency)}
            </ThemedText>
          </View>
        </View>

        {/* Rekapan Harian & Saran Evaluasi Keuangan */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Buka detail pagu anggaran dan evaluasi harian"
          style={styles.heroPacingBanner}
          onPress={onOpenBudget}
        >
          <View style={styles.heroPacingLeft}>
            <View style={styles.heroPacingBadge}>
              <Ionicons
                name={
                  overview.totalAllocatedBudget > 0 &&
                  overview.totalBudgetSpent > (overview.totalAllocatedBudget * new Date().getDate()) / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() + 0.1
                    ? 'alert-circle'
                    : 'checkmark-circle'
                }
                size={14}
                color={colors.heroAccent}
              />
              <ThemedText style={[styles.heroPacingTitle, { color: colors.heroText }]}>
                {overview.totalAllocatedBudget > 0
                  ? `Batas Aman: ${formatRupiah(
                      Math.max(
                        0,
                        Math.round(
                          (overview.totalAllocatedBudget - overview.totalBudgetSpent) /
                            Math.max(
                              1,
                              new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() -
                                new Date().getDate()
                            )
                        )
                      ),
                      currency
                    )}/hari`
                  : 'Atur Pagu Anggaran'}
              </ThemedText>
            </View>
            <ThemedText style={[styles.heroPacingSub, { color: 'rgba(255, 255, 255, 0.8)' }]}>
              {overview.totalAllocatedBudget > 0
                ? 'Ketuk untuk melihat laporan evaluasi boros/hemat & rincian per kategori'
                : 'Tentukan pagu bulanan untuk mendapatkan saran ritme belanja harian'}
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={16} color="rgba(255, 255, 255, 0.75)" />
        </Pressable>

        {/* 3. Aksi Cepat + Catat Transaksi Terintegrasi (Dynamic Accent Button) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Catat Transaksi Baru"
          style={[styles.heroActionBtn, { backgroundColor: colors.brandAccent }]}
          onPress={onOpenAddModal}
        >
          <ThemedText style={[styles.heroActionText, { color: resolvedTheme === 'dark' ? '#111614' : colors.brandPrimary }]}>
            + Catat Transaksi
          </ThemedText>
        </Pressable>
      </Animated.View>

      {/* 4. Ringkasan Dompet & Akun (Horizontal Glance) */}
      <Animated.View entering={FadeInDown.delay(150).duration(350).springify()}>
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Akun & Dompet
          </ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kelola & Atur Saldo Dompet"
              onPress={() => setIsManageWalletsModalOpen(true)}
              style={[styles.resetWalletsBtn, { borderColor: colors.brandPrimary, backgroundColor: colors.backgroundSelected }]}
            >
              <Ionicons name="settings-outline" size={13} color={colors.brandPrimary} />
              <ThemedText style={[styles.resetWalletsText, { color: colors.brandPrimary }]}>
                Atur Saldo
              </ThemedText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Atur Ulang Saldo Dompet"
              onPress={() => setIsResetWalletsModalOpen(true)}
              style={[styles.resetWalletsBtn, { borderColor: colors.border, backgroundColor: colors.backgroundSelected }]}
            >
              <Ionicons name="refresh-outline" size={13} color={colors.textSecondary} />
              <ThemedText style={[styles.resetWalletsText, { color: colors.textSecondary }]}>
                Nol-kan
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.walletScroll}>
          {wallets
            .filter((w) => w.isActive !== false)
            .map((w) => (
              <Pressable
                key={w.id}
                onPress={() => setIsManageWalletsModalOpen(true)}
                style={[
                  styles.walletCard,
                  { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                ]}
              >
                <ThemedText style={[styles.walletName, { color: colors.textSecondary }]} numberOfLines={1}>
                  {w.name}
                </ThemedText>
                <ThemedText style={[styles.walletBalance, { color: colors.text }]}>
                  {formatRupiah(w.balance, currency)}
                </ThemedText>
              </Pressable>
            ))}
        </ScrollView>
      </Animated.View>

      {/* 5. Alokasi Budget Bulan Ini */}
      <Animated.View entering={FadeInDown.delay(200).duration(350).springify()}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Buka detail pagu anggaran"
          style={styles.sectionHeader}
          onPress={onOpenBudget}
        >
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Pagu Anggaran
          </ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: colors.brandPrimary, fontWeight: '600' }]}>
            Kelola Pagu →
          </ThemedText>
        </Pressable>

        {budgetProgress.length === 0 ? (
          <EmptyState
            title="Belum Ada Pagu Anggaran"
            description="Atur batas pagu bulanan di tab Anggaran untuk memantau pengeluaran Anda."
          />
        ) : (
          budgetProgress.slice(0, 3).map((bp) => (
            <BudgetCard key={bp.category.id} progress={bp} />
          ))
        )}
      </Animated.View>

      {/* 6. Transaksi Terkini */}
      <Animated.View entering={FadeInDown.delay(250).duration(350).springify()}>
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Transaksi Terkini
          </ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Mutasi Terakhir
          </ThemedText>
        </View>

        {recentTransactions.length === 0 ? (
          <EmptyState
            title="Belum Ada Transaksi"
            description="Mulai catat pengeluaran atau pemasukan pertama Anda hari ini."
          />
        ) : (
          <View style={[styles.flatListCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            {recentTransactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                category={tx.categoryId ? categoryMap.get(tx.categoryId) : undefined}
                wallet={walletMap.get(tx.walletId)}
                toWallet={tx.toWalletId ? walletMap.get(tx.toWalletId) : undefined}
                onPressDelete={(id) => setTransactionToDelete(id)}
              />
            ))}
          </View>
        )}
      </Animated.View>

      {/* Modal Konfirmasi Hapus Transaksi */}
      <ConfirmationModal
        visible={Boolean(transactionToDelete)}
        title="Hapus Transaksi?"
        message="Transaksi yang dihapus tidak dapat dikembalikan dan saldo dompet akan disesuaikan kembali."
        confirmLabel="Hapus"
        onConfirm={async () => {
          if (transactionToDelete) {
            await deleteTransaction(transactionToDelete);
            setTransactionToDelete(null);
          }
        }}
        onCancel={() => setTransactionToDelete(null)}
      />

      {/* Modal Konfirmasi Nol-kan Saldo Dompet */}
      <ConfirmationModal
        visible={isResetWalletsModalOpen}
        title="Nol-kan Seluruh Saldo Dompet?"
        message="Semua saldo dompet akan diatur ulang menjadi Rp 0. Anda bisa memasukkan saldo awal yang baru atau mencatat transaksi dari awal."
        confirmLabel="Nol-kan Saldo"
        onConfirm={async () => {
          await resetAllWalletBalances();
          setIsResetWalletsModalOpen(false);
        }}
        onCancel={() => setIsResetWalletsModalOpen(false)}
      />

      {/* Modal Kelola Saldo & Tampilan Dompet */}
      <ManageWalletsModal
        visible={isManageWalletsModalOpen}
        wallets={wallets}
        onUpdateWallet={updateWallet}
        onAddWallet={async (w) => {
          await addWallet(w);
        }}
        onDeleteWallet={deleteWallet}
        onClose={() => setIsManageWalletsModalOpen(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandLogoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  brandWordmark: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  brandSubtitle: {
    fontSize: 12,
    marginTop: 1,
    fontWeight: '500',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  syncBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  authBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  authBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingsTopBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBanner: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusBannerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  heroCard: {
    backgroundColor: '#173D32',
    borderRadius: 20,
    padding: 22,
    marginBottom: 24,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  heroLabel: {
    color: '#A2B3AC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 10,
  },
  heroAmount: {
    color: '#F7F8F5',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 40,
    includeFontPadding: false,
    fontVariant: ['tabular-nums'],
  },
  heroCashflowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    marginBottom: 18,
  },
  cashflowCol: {
    flex: 1,
  },
  cashflowDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 12,
  },
  heroSubLabel: {
    color: '#A2B3AC',
    fontSize: 11,
    marginBottom: 3,
  },
  incomeAmount: {
    color: '#C9F36A',
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  expenseAmount: {
    color: '#E58A73',
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  heroPacingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  heroPacingLeft: {
    flex: 1,
    marginRight: 8,
  },
  heroPacingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  heroPacingTitle: {
    color: '#F7F8F5',
    fontSize: 13,
    fontWeight: '700',
  },
  heroPacingSub: {
    color: '#A2B3AC',
    fontSize: 11,
    lineHeight: 15,
  },
  heroActionBtn: {
    backgroundColor: '#C9F36A',
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActionText: {
    color: '#173D32',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  resetWalletsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  resetWalletsText: {
    fontSize: 11,
    fontWeight: '600',
  },
  walletScroll: {
    marginBottom: 24,
  },
  walletCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 140,
    marginRight: 10,
  },
  walletName: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    fontVariant: ['tabular-nums'],
  },
  flatListCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
});
