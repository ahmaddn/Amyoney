import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const isExpense = transaction.type === 'expense';
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';

  const amountPrefix = isExpense ? '-' : isIncome ? '+' : '';
  const amountColor = isExpense
    ? colors.expense
    : isIncome
    ? colors.income
    : colors.textSecondary;

  // Nama Kategori sebagai judul utama yang jelas
  const categoryTitle = isTransfer
    ? `Transfer ke ${toWallet?.name || 'Tujuan'}`
    : category?.name || (isExpense ? 'Pengeluaran' : 'Pemasukan');

  // Catatan transaksi jika diisi oleh pengguna
  const hasNote = Boolean(transaction.note && transaction.note.trim().length > 0);
  const noteText = transaction.note?.trim();

  // Ikon kategori grafis
  const iconName = isTransfer
    ? 'swap-horizontal'
    : (category?.icon || (isExpense ? 'cart-outline' : 'cash-outline'));

  const iconBg = category?.color || (isTransfer ? colors.brandPrimary : colors.backgroundSelected);

  return (
    <>
      <Pressable
        style={[styles.container, { borderBottomColor: colors.border }]}
        onPress={() => setIsDetailOpen(true)}
      >
        {/* Ikon Kategori Grafis Berwarna */}
        <View style={[styles.iconBadge, { backgroundColor: iconBg }]}>
          <Ionicons name={iconName as any} size={18} color="#FFFFFF" />
        </View>

        <View style={styles.contentCol}>
          {/* Baris 1: Nama Kategori */}
          <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {categoryTitle}
          </ThemedText>

          {/* Baris 2: Catatan / Deskripsi jika ada */}
          {hasNote && (
            <ThemedText
              style={[styles.noteText, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {noteText}
            </ThemedText>
          )}

          {/* Baris 3: Tanggal & Nama Dompet */}
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
              onPress={(e) => {
                e.stopPropagation();
                onPressDelete(transaction.id);
              }}
              hitSlop={10}
              style={styles.deleteBtn}
            >
              <ThemedText style={[styles.deleteText, { color: colors.textSecondary }]}>
                Hapus
              </ThemedText>
            </Pressable>
          )}
        </View>
      </Pressable>

      {/* Modal Detail Transaksi Lengkap (Agar label/catatan super panjang bisa dibaca utuh) */}
      <Modal visible={isDetailOpen} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.backdropPressable} onPress={() => setIsDetailOpen(false)} />
          <View style={[styles.detailModalCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <View style={styles.detailHeader}>
              <View style={[styles.detailIcon, { backgroundColor: iconBg }]}>
                <Ionicons name={iconName as any} size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <ThemedText style={[styles.detailCategoryTitle, { color: colors.text }]}>
                  {categoryTitle}
                </ThemedText>
                <ThemedText style={[styles.detailTypeBadge, { color: amountColor }]}>
                  {isExpense ? 'Pengeluaran' : isIncome ? 'Pemasukan' : 'Transfer'}
                </ThemedText>
              </View>
              <Pressable onPress={() => setIsDetailOpen(false)} style={styles.closeIconBtn}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.detailAmountRow}>
              <ThemedText style={[styles.detailAmountVal, { color: amountColor }]}>
                {amountPrefix}{formatRupiah(transaction.amount, currency)}
              </ThemedText>
            </View>

            <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />

            {/* Rincian Baris */}
            <View style={styles.detailInfoRow}>
              <ThemedText style={[styles.detailInfoLabel, { color: colors.textSecondary }]}>Tanggal</ThemedText>
              <ThemedText style={[styles.detailInfoVal, { color: colors.text }]}>{formatDateIndo(transaction.date)}</ThemedText>
            </View>

            <View style={styles.detailInfoRow}>
              <ThemedText style={[styles.detailInfoLabel, { color: colors.textSecondary }]}>
                {isTransfer ? 'Dari Dompet' : 'Dompet'}
              </ThemedText>
              <ThemedText style={[styles.detailInfoVal, { color: colors.text }]}>{wallet?.name || '-'}</ThemedText>
            </View>

            {isTransfer && toWallet && (
              <View style={styles.detailInfoRow}>
                <ThemedText style={[styles.detailInfoLabel, { color: colors.textSecondary }]}>Ke Dompet</ThemedText>
                <ThemedText style={[styles.detailInfoVal, { color: colors.text }]}>{toWallet.name}</ThemedText>
              </View>
            )}

            {hasNote && (
              <View style={[styles.detailNoteBox, { backgroundColor: colors.backgroundSelected }]}>
                <ThemedText style={[styles.detailInfoLabel, { color: colors.textSecondary, marginBottom: 4 }]}>
                  Catatan Transaksi
                </ThemedText>
                <ThemedText style={[styles.detailNoteFullText, { color: colors.text }]}>
                  {noteText}
                </ThemedText>
              </View>
            )}

            <View style={styles.detailActionRow}>
              {onPressDelete && (
                <Pressable
                  style={[styles.deleteModalBtn, { borderColor: colors.expense }]}
                  onPress={() => {
                    setIsDetailOpen(false);
                    onPressDelete(transaction.id);
                  }}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.expense} style={{ marginRight: 6 }} />
                  <ThemedText style={[styles.deleteModalBtnText, { color: colors.expense }]}>Hapus Transaksi</ThemedText>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 64,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentCol: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 1,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '400',
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  detailModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCategoryTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  detailTypeBadge: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  closeIconBtn: {
    padding: 4,
  },
  detailAmountRow: {
    alignItems: 'center',
    marginVertical: 10,
  },
  detailAmountVal: {
    fontSize: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  detailDivider: {
    height: 1,
    marginVertical: 14,
  },
  detailInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailInfoLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailInfoVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  detailNoteBox: {
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  detailNoteFullText: {
    fontSize: 13,
    lineHeight: 18,
  },
  detailActionRow: {
    marginTop: 18,
  },
  deleteModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  deleteModalBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
