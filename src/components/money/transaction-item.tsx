import { Pressable, StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/context/theme-context';
import { Category, Transaction, Wallet } from '@/types/money';
import { formatDateIndo, formatRupiah } from '@/utils/format';
import { ThemedText } from '../themed-text';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  wallet?: Wallet;
  toWallet?: Wallet;
  onPressDelete?: (id: string) => void;
}

export function TransactionItem({
  transaction,
  category,
  wallet,
  toWallet,
  onPressDelete,
}: TransactionItemProps) {
  const { colors, currency } = useAppTheme();

  const isExpense = transaction.type === 'expense';
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';

  const amountPrefix = isExpense ? '-' : isIncome ? '+' : '';
  const amountColor = isExpense
    ? colors.expense
    : isIncome
    ? colors.income
    : colors.textSecondary;

  let title = transaction.note || category?.name || 'Transaksi';
  if (isTransfer) {
    title = `Transfer ke ${toWallet?.name || 'Tujuan'}`;
  }

  // Inisial avatar kategori untuk konsistensi visual
  const categoryInitial = (category?.name || (isTransfer ? 'TF' : 'TX'))
    .slice(0, 2)
    .toUpperCase();

  // Warna badge avatar kategori adaptif terhadap warna tema aktif
  const badgeBg = isExpense
    ? colors.backgroundSelected
    : isIncome
    ? colors.incomeBg
    : colors.backgroundSelected;

  const badgeTextColor = isExpense
    ? colors.brandPrimary
    : isIncome
    ? colors.income
    : colors.brandPrimary;

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      {/* Icon / Initial Avatar Badge */}
      <View
        style={[
          styles.iconBadge,
          {
            backgroundColor: badgeBg,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.iconInitial,
            {
              color: badgeTextColor,
            },
          ]}
        >
          {categoryInitial}
        </ThemedText>
      </View>

      <View style={styles.contentCol}>
        <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </ThemedText>
        <View style={styles.metaRow}>
          <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
            {formatDateIndo(transaction.date)}
          </ThemedText>
          {wallet && (
            <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
              · {wallet.name}
            </ThemedText>
          )}
        </View>
      </View>

      <View style={styles.rightCol}>
        <ThemedText style={[styles.amount, { color: amountColor }]}>
          {amountPrefix}
          {formatRupiah(transaction.amount, currency)}
        </ThemedText>
        {onPressDelete && (
          <Pressable
            accessibilityLabel="Hapus transaksi"
            accessibilityRole="button"
            onPress={() => onPressDelete(transaction.id)}
            hitSlop={10}
            style={styles.deleteBtn}
          >
            <ThemedText style={[styles.deleteText, { color: colors.textSecondary }]}>
              Hapus
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    minHeight: 64,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconInitial: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  contentCol: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '400',
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  deleteBtn: {
    marginTop: 4,
    paddingVertical: 2,
  },
  deleteText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
