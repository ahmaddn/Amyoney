import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ConfirmationModal } from '@/components/money/confirmation-modal';
import { EmptyState } from '@/components/money/empty-state';
import { TransactionItem } from '@/components/money/transaction-item';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
import { useMoneyData } from '@/hooks/use-money-data';
import { Transaction, TransactionType } from '@/types/money';
import { formatDateIndo, formatRupiah } from '@/utils/format';

type FilterType = 'all' | TransactionType;
type GroupMode = 'all' | 'daily' | 'monthly';

export function TransactionsTab() {
  const { colors, currency } = useAppTheme();
  const { transactions, categories, wallets, deleteTransaction } = useMoneyData();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [groupMode, setGroupMode] = useState<GroupMode>('daily');
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const walletMap = useMemo(() => new Map(wallets.map((w) => [w.id, w])), [wallets]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType = filterType === 'all' || tx.type === filterType;
      const cat = tx.categoryId ? categoryMap.get(tx.categoryId) : undefined;
      const catName = cat?.name.toLowerCase() ?? '';
      const note = (tx.note ?? '').toLowerCase();
      const query = search.toLowerCase();
      const matchesSearch = !query || note.includes(query) || catName.includes(query);
      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, categoryMap, search]);

  // Rekap Per Hari (Daily Grouping)
  const dailyGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        date: string;
        transactions: Transaction[];
        totalExpense: number;
        totalIncome: number;
        net: number;
      }
    > = {};

    for (const tx of filteredTransactions) {
      const dayKey = tx.date ? tx.date.slice(0, 10) : 'Tanpa Tanggal';
      if (!groups[dayKey]) {
        groups[dayKey] = {
          date: dayKey,
          transactions: [],
          totalExpense: 0,
          totalIncome: 0,
          net: 0,
        };
      }
      groups[dayKey].transactions.push(tx);
      if (tx.type === 'expense') {
        groups[dayKey].totalExpense += tx.amount;
        groups[dayKey].net -= tx.amount;
      } else if (tx.type === 'income') {
        groups[dayKey].totalIncome += tx.amount;
        groups[dayKey].net += tx.amount;
      }
    }

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredTransactions]);

  // Rekap Per Bulan (Monthly Grouping)
  const monthlyGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        monthKey: string;
        monthLabel: string;
        transactions: Transaction[];
        totalExpense: number;
        totalIncome: number;
        net: number;
      }
    > = {};

    for (const tx of filteredTransactions) {
      const monthKey = tx.date ? tx.date.slice(0, 7) : 'Tanpa Bulan';
      if (!groups[monthKey]) {
        let monthLabel = monthKey;
        try {
          if (tx.date) {
            const d = new Date(tx.date);
            monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(d);
          }
        } catch {
          // fallback
        }

        groups[monthKey] = {
          monthKey,
          monthLabel,
          transactions: [],
          totalExpense: 0,
          totalIncome: 0,
          net: 0,
        };
      }
      groups[monthKey].transactions.push(tx);
      if (tx.type === 'expense') {
        groups[monthKey].totalExpense += tx.amount;
        groups[monthKey].net -= tx.amount;
      } else if (tx.type === 'income') {
        groups[monthKey].totalIncome += tx.amount;
        groups[monthKey].net += tx.amount;
      }
    }

    return Object.values(groups).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [filteredTransactions]);

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'expense', label: 'Pengeluaran' },
    { key: 'income', label: 'Pemasukan' },
    { key: 'transfer', label: 'Transfer' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(300).springify()}>
        <ThemedText style={[styles.screenTitle, { color: colors.text }]}>
          Riwayat Transaksi
        </ThemedText>
        <ThemedText style={[styles.subText, { color: colors.textSecondary }]}>
          Rekap pengeluaran & pemasukan per hari dan per bulan secara detail.
        </ThemedText>
      </Animated.View>

      {/* Input Pencarian */}
      <Animated.View entering={FadeInDown.delay(100).duration(350).springify()}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Cari transaksi atau catatan..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </Animated.View>

      {/* Mode Rekap / Tab Pengelompokan */}
      <Animated.View entering={FadeInDown.delay(120).duration(350).springify()} style={styles.groupModeRow}>
        <Pressable
          accessibilityRole="button"
          style={[
            styles.groupModeBtn,
            {
              backgroundColor: groupMode === 'daily' ? colors.brandPrimary : colors.backgroundElement,
              borderColor: groupMode === 'daily' ? colors.brandPrimary : colors.border,
            },
          ]}
          onPress={() => setGroupMode('daily')}
        >
          <ThemedText
            style={[
              styles.groupModeBtnText,
              { color: groupMode === 'daily' ? '#FFFFFF' : colors.textSecondary, fontWeight: groupMode === 'daily' ? '700' : '500' },
            ]}
          >
            Rekap Harian
          </ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={[
            styles.groupModeBtn,
            {
              backgroundColor: groupMode === 'monthly' ? colors.brandPrimary : colors.backgroundElement,
              borderColor: groupMode === 'monthly' ? colors.brandPrimary : colors.border,
            },
          ]}
          onPress={() => setGroupMode('monthly')}
        >
          <ThemedText
            style={[
              styles.groupModeBtnText,
              { color: groupMode === 'monthly' ? '#FFFFFF' : colors.textSecondary, fontWeight: groupMode === 'monthly' ? '700' : '500' },
            ]}
          >
            Rekap Bulanan
          </ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={[
            styles.groupModeBtn,
            {
              backgroundColor: groupMode === 'all' ? colors.brandPrimary : colors.backgroundElement,
              borderColor: groupMode === 'all' ? colors.brandPrimary : colors.border,
            },
          ]}
          onPress={() => setGroupMode('all')}
        >
          <ThemedText
            style={[
              styles.groupModeBtnText,
              { color: groupMode === 'all' ? '#FFFFFF' : colors.textSecondary, fontWeight: groupMode === 'all' ? '700' : '500' },
            ]}
          >
            Semua
          </ThemedText>
        </Pressable>
      </Animated.View>

      {/* Segmented Filter Pills */}
      <Animated.View entering={FadeInDown.delay(150).duration(350).springify()} style={styles.filterRow}>
        {filterTabs.map((f) => {
          const isActive = filterType === f.key;
          return (
            <Pressable
              key={f.key}
              accessibilityRole="button"
              accessibilityLabel={`Filter ${f.label}`}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isActive ? colors.brandPrimary : colors.backgroundElement,
                  borderColor: isActive ? colors.brandPrimary : colors.border,
                },
              ]}
              onPress={() => setFilterType(f.key)}
            >
              <ThemedText
                style={[
                  styles.filterPillText,
                  { color: isActive ? '#FFFFFF' : colors.textSecondary, fontWeight: isActive ? '700' : '500' },
                ]}
              >
                {f.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </Animated.View>

      {/* Konten Berdasarkan Mode Rekap */}
      <Animated.View entering={FadeInDown.delay(200).duration(350).springify()}>
        {filteredTransactions.length === 0 ? (
          <EmptyState
            title="Tidak Ada Transaksi"
            description={
              search
                ? `Tidak ditemukan mutasi yang sesuai dengan kata kunci "${search}".`
                : 'Belum ada transaksi pada kategori filter ini.'
            }
          />
        ) : groupMode === 'daily' ? (
          // 1. REKAP HARIAN
          dailyGroups.map((group) => (
            <View
              key={group.date}
              style={[
                styles.groupCard,
                { backgroundColor: colors.backgroundElement, borderColor: colors.border },
              ]}
            >
              {/* Header Rekap Hari */}
              <View style={[styles.groupHeader, { borderBottomColor: colors.border, backgroundColor: colors.backgroundSelected }]}>
                <View>
                  <ThemedText style={[styles.groupDateText, { color: colors.text }]}>
                    {formatDateIndo(group.date)}
                  </ThemedText>
                  <ThemedText style={[styles.groupSubCount, { color: colors.textSecondary }]}>
                    {group.transactions.length} Transaksi
                  </ThemedText>
                </View>
                <View style={styles.groupTotalCol}>
                  {group.totalExpense > 0 && (
                    <ThemedText style={[styles.groupExpenseText, { color: colors.expense }]}>
                      Keluar: -{formatRupiah(group.totalExpense, currency)}
                    </ThemedText>
                  )}
                  {group.totalIncome > 0 && (
                    <ThemedText style={[styles.groupIncomeText, { color: colors.income }]}>
                      Masuk: +{formatRupiah(group.totalIncome, currency)}
                    </ThemedText>
                  )}
                </View>
              </View>

              {/* Daftar Transaksi Hari Tersebut */}
              <View style={styles.groupItemsContainer}>
                {group.transactions.map((tx) => (
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
            </View>
          ))
        ) : groupMode === 'monthly' ? (
          // 2. REKAP BULANAN
          monthlyGroups.map((group) => (
            <View
              key={group.monthKey}
              style={[
                styles.groupCard,
                { backgroundColor: colors.backgroundElement, borderColor: colors.border },
              ]}
            >
              {/* Header Rekap Bulan */}
              <View style={[styles.groupHeader, { borderBottomColor: colors.border, backgroundColor: colors.backgroundSelected }]}>
                <View>
                  <ThemedText style={[styles.groupDateText, { color: colors.text }]}>
                    {group.monthLabel}
                  </ThemedText>
                  <ThemedText style={[styles.groupSubCount, { color: colors.textSecondary }]}>
                    {group.transactions.length} Total Transaksi
                  </ThemedText>
                </View>
                <View style={styles.groupTotalCol}>
                  <ThemedText style={[styles.groupExpenseText, { color: colors.expense }]}>
                    Keluar: -{formatRupiah(group.totalExpense, currency)}
                  </ThemedText>
                  <ThemedText style={[styles.groupIncomeText, { color: colors.income }]}>
                    Masuk: +{formatRupiah(group.totalIncome, currency)}
                  </ThemedText>
                </View>
              </View>

              {/* Daftar Transaksi Bulan Tersebut */}
              <View style={styles.groupItemsContainer}>
                {group.transactions.map((tx) => (
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
            </View>
          ))
        ) : (
          // 3. DAFTAR SEMUA TRANSAKSI FLAT
          <View style={[styles.flatListCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            {filteredTransactions.map((tx) => (
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
    marginBottom: 16,
    lineHeight: 18,
  },
  searchInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 12,
  },
  groupModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  groupModeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupModeBtnText: {
    fontSize: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
  },
  groupCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  groupDateText: {
    fontSize: 14,
    fontWeight: '700',
  },
  groupSubCount: {
    fontSize: 11,
    marginTop: 1,
  },
  groupTotalCol: {
    alignItems: 'flex-end',
  },
  groupExpenseText: {
    fontSize: 12,
    fontWeight: '700',
  },
  groupIncomeText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  groupItemsContainer: {
    paddingHorizontal: 14,
  },
  flatListCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
});
