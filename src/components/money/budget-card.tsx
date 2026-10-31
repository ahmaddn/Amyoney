import { Pressable, StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/context/theme-context';
import { BudgetProgress } from '@/types/money';
import { formatRupiah } from '@/utils/format';
import { ThemedText } from '../themed-text';

interface BudgetCardProps {
  progress: BudgetProgress;
  onEditBudget?: (category: BudgetProgress['category']) => void;
  onEditCategory?: (category: BudgetProgress['category']) => void;
}

export function BudgetCard({ progress, onEditBudget, onEditCategory }: BudgetCardProps) {
  const { colors, currency } = useAppTheme();
  const { category, allocated, spent, remaining, percentUsed, isOverBudget } = progress;

  // Bar progress: Fresh Lime untuk kondisi aman, Terracotta bila overbudget
  const barColor = isOverBudget ? colors.expense : colors.brandAccent;

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <View style={styles.titleArea}>
          <ThemedText style={[styles.categoryName, { color: colors.text }]}>
            {category.name}
          </ThemedText>
          <ThemedText style={[styles.ratioText, { color: colors.textSecondary }]}>
            Terpakai {formatRupiah(spent, currency)} dari {formatRupiah(allocated, currency)}
          </ThemedText>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {onEditCategory && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ubah detail kategori ${category.name}`}
              onPress={() => onEditCategory(category)}
              hitSlop={8}
              style={[styles.editBtn, { borderColor: colors.border }]}
            >
              <ThemedText style={[styles.editText, { color: colors.textSecondary }]}>
                Kategori
              </ThemedText>
            </Pressable>
          )}

          {onEditBudget && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ubah budget kategori ${category.name}`}
              onPress={() => onEditBudget(category)}
              hitSlop={8}
              style={[styles.editBtn, { borderColor: colors.border, backgroundColor: colors.backgroundSelected }]}
            >
              <ThemedText style={[styles.editText, { color: colors.brandPrimary, fontWeight: '700' }]}>
                Pagu
              </ThemedText>
            </Pressable>
          )}
        </View>
      </View>

      {/* Progress track presisi 4px */}
      <View style={[styles.track, { backgroundColor: colors.backgroundSelected }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(percentUsed, 100)}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>

      <View style={styles.footerRow}>
        <ThemedText
          style={[
            styles.statusText,
            { color: isOverBudget ? colors.expense : colors.textSecondary },
          ]}
        >
          {isOverBudget
            ? `Melebihi ${formatRupiah(Math.abs(remaining), currency)}`
            : `Tersisa ${formatRupiah(remaining, currency)}`}
        </ThemedText>
        <ThemedText style={[styles.percentText, { color: colors.text }]}>
          {percentUsed}%
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleArea: {
    flex: 1,
    paddingRight: 10,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  ratioText: {
    fontSize: 12,
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
  },
  track: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 6,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
