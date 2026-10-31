import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
import { useMoneyData } from '@/hooks/use-money-data';
import { formatRupiah } from '@/utils/format';

export function StatsTab() {
  const { colors } = useAppTheme();
  const { overview, transactions, categories } = useMoneyData();

  const netSavings = overview.monthlyIncome - overview.monthlyExpense;
  const savingsRate =
    overview.monthlyIncome > 0
      ? Math.max(0, Math.round((netSavings / overview.monthlyIncome) * 100))
      : 0;

  // Breakdown pengeluaran per kategori
  const categorySpending = useMemo(() => {
    const expenseTx = transactions.filter((t) => t.type === 'expense');
    const totals: Record<string, number> = {};
    for (const tx of expenseTx) {
      if (tx.categoryId) {
        totals[tx.categoryId] = (totals[tx.categoryId] || 0) + tx.amount;
      }
    }
    const catMap = new Map(categories.map((c) => [c.id, c]));
    const result = Object.entries(totals).map(([catId, amount]) => {
      const cat = catMap.get(catId);
      const percentage =
        overview.monthlyExpense > 0
          ? Math.round((amount / overview.monthlyExpense) * 100)
          : 0;
      return {
        id: catId,
        name: cat?.name ?? 'Lain-lain',
        color: cat?.color ?? colors.brandPrimary,
        amount,
        percentage,
      };
    });
    return result.sort((a, b) => b.amount - a.amount);
  }, [transactions, categories, overview.monthlyExpense, colors.brandPrimary]);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(300).springify()}>
        <ThemedText style={[styles.screenTitle, { color: colors.text }]}>
          Statistik Keuangan
        </ThemedText>
        <ThemedText style={[styles.subText, { color: colors.textSecondary }]}>
          Analisis arus kas bersih, rasio tabungan, dan sebaran pengeluaran bulan ini.
        </ThemedText>
      </Animated.View>

      {/* 1. Rasio Tabungan & Arus Kas Bersih (Dynamic Hero) */}
      <Animated.View entering={FadeInDown.delay(100).duration(350).springify()} style={[styles.heroCard, { backgroundColor: colors.heroBg }]}>
        <ThemedText style={[styles.heroSub, { color: colors.textSecondary }]}>ARUS KAS BERSIH BULAN INI</ThemedText>
        <ThemedText style={[styles.heroNet, { color: colors.heroText }]}>
          {netSavings >= 0 ? `+${formatRupiah(netSavings)}` : formatRupiah(netSavings)}
        </ThemedText>

        <View style={styles.savingsMetricRow}>
          <View style={styles.savingsTag}>
            <ThemedText style={[styles.savingsTagLabel, { color: colors.textSecondary }]}>Rasio Tabungan</ThemedText>
            <ThemedText style={[styles.savingsTagVal, { color: colors.heroAccent }]}>{savingsRate}%</ThemedText>
          </View>
          <View style={styles.statusIndicator}>
            <ThemedText style={[styles.savingsMessage, { color: colors.heroText }]}>
              {savingsRate >= 20 ? 'Arus kas sehat & produktif' : 'Tingkatkan alokasi tabungan'}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* 2. Ringkasan Pemasukan vs Pengeluaran */}
      <Animated.View entering={FadeInDown.delay(150).duration(350).springify()} style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
        <ThemedText style={[styles.cardTitle, { color: colors.text }]}>Perbandingan Bulanan</ThemedText>
        
        <View style={styles.compareRow}>
          <View style={styles.compareCol}>
            <ThemedText style={[styles.compareLabel, { color: colors.textSecondary }]}>Total Pemasukan</ThemedText>
            <ThemedText style={[styles.incomeVal, { color: colors.income }]}>
              +{formatRupiah(overview.monthlyIncome)}
            </ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.compareCol}>
            <ThemedText style={[styles.compareLabel, { color: colors.textSecondary }]}>Total Pengeluaran</ThemedText>
            <ThemedText style={[styles.expenseVal, { color: colors.expense }]}>
              -{formatRupiah(overview.monthlyExpense)}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* 3. Sebaran Pengeluaran per Kategori */}
      <Animated.View entering={FadeInDown.delay(200).duration(350).springify()}>
        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
            Komposisi Pengeluaran
          </ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            {categorySpending.length} Kategori
          </ThemedText>
        </View>

        {categorySpending.length === 0 ? (
          <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border, padding: 24, alignItems: 'center' }]}>
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              Belum ada mutasi pengeluaran bulan ini untuk dianalisis.
            </ThemedText>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            {categorySpending.map((item, idx) => (
              <View
                key={item.id}
                style={[
                  styles.catItem,
                  idx < categorySpending.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <View style={styles.catTopRow}>
                  <ThemedText style={[styles.catName, { color: colors.text }]}>{item.name}</ThemedText>
                  <View style={styles.catRight}>
                    <ThemedText style={[styles.catAmount, { color: colors.text }]}>
                      {formatRupiah(item.amount)}
                    </ThemedText>
                    <ThemedText style={[styles.catPercent, { color: colors.textSecondary }]}>
                      {item.percentage}%
                    </ThemedText>
                  </View>
                </View>

                {/* Progress bar representasi alokasi */}
                <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(100, Math.max(3, item.percentage))}%`,
                        backgroundColor: item.color || colors.brandPrimary,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
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
  heroCard: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
  },
  heroSub: {
    color: '#A2B3AC',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  heroNet: {
    color: '#F7F8F5',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginVertical: 10,
    fontVariant: ['tabular-nums'],
  },
  savingsMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  savingsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savingsTagLabel: {
    color: '#A2B3AC',
    fontSize: 12,
  },
  savingsTagVal: {
    color: '#C9F36A',
    fontSize: 16,
    fontWeight: '800',
  },
  statusIndicator: {
    alignItems: 'flex-end',
  },
  savingsMessage: {
    color: '#F7F8F5',
    fontSize: 11,
    fontWeight: '500',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compareCol: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 36,
    marginHorizontal: 16,
  },
  compareLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  incomeVal: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  expenseVal: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
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
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  catItem: {
    paddingVertical: 12,
  },
  catTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catName: {
    fontSize: 14,
    fontWeight: '600',
  },
  catRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  catPercent: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
