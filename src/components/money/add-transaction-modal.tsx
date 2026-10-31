import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CategoryPickerModal } from './category-picker-modal';
import { audioService } from '@/services/audio-service';
import { receiptScannerService } from '@/services/receipt-scanner-service';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/context/theme-context';
import { Category, TransactionType, Wallet } from '@/types/money';
import { ThemedText } from '../themed-text';

interface AddTransactionModalProps {
  visible: boolean;
  wallets: Wallet[];
  categories: Category[];
  onClose: () => void;
  onRequireAuth?: (featureName: string) => void;
  onAddCategory?: (newCategory: { name: string; type: 'expense' | 'income'; icon: string; color: string }) => Promise<void>;
  onSubmit: (data: {
    amount: number;
    type: TransactionType;
    date: string;
    categoryId?: string;
    walletId: string;
    toWalletId?: string;
    note?: string;
  }) => void;
}

export function AddTransactionModal({
  visible,
  wallets,
  categories,
  onClose,
  onRequireAuth,
  onAddCategory,
  onSubmit,
}: AddTransactionModalProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user, isGuest } = useAuth();

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [walletId, setWalletId] = useState<string>('');
  const [toWalletId, setToWalletId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);

  // Inisialisasi walletId & categoryId secara dinamis saat modal dibuka atau list data berubah
  useEffect(() => {
    if (visible) {
      if (wallets.length > 0 && !walletId) {
        const defaultW = wallets.find((w) => w.isDefault && w.isActive !== false) || wallets.find((w) => w.isActive !== false) || wallets[0];
        setWalletId(defaultW?.id || '');
      }
      if (wallets.length > 1 && !toWalletId) {
        const secondW = wallets.find((w) => w.id !== walletId && w.isActive !== false) || wallets[1];
        setToWalletId(secondW?.id || '');
      }
      const validCategories = categories.filter((c) => c.type === type);
      if (validCategories.length > 0 && !categoryId) {
        setCategoryId(validCategories[0].id);
      }
    }
  }, [visible, wallets, categories, type, walletId, toWalletId, categoryId]);

  // Sesuaikan categoryId saat tipe berubah
  useEffect(() => {
    const validCats = categories.filter((c) => c.type === type);
    if (validCats.length > 0) {
      if (!categoryId || !validCats.some((c) => c.id === categoryId)) {
        setCategoryId(validCats[0].id);
      }
    }
  }, [type, categories]);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleScanReceipt = async (useCamera: boolean = false) => {
    if (!user || isGuest) {
      if (onRequireAuth) {
        onClose();
        onRequireAuth('Pindai Struk Foto (Kamera & Galeri)');
        return;
      }
    }

    try {
      setIsScanning(true);
      setErrorMessage('');
      const imageUri = await receiptScannerService.pickReceiptImage(useCamera);
      if (imageUri) {
        const result = await receiptScannerService.scanReceiptImage(imageUri);
        if (result.amount) {
          setAmountStr(String(result.amount));
        }
        if (result.note) {
          setNote(result.note);
        }
        setType('expense');
        audioService.playSuccessSound();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengakses kamera/galeri';
      setErrorMessage(msg);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = () => {
    const cleanAmount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10);
    if (!cleanAmount || cleanAmount <= 0) {
      setErrorMessage('Masukkan nominal angka yang valid');
      return;
    }
    const activeWalletId = walletId || wallets[0]?.id;
    if (!activeWalletId) {
      setErrorMessage('Pilih dompet sumber');
      return;
    }
    if (type === 'transfer' && activeWalletId === toWalletId) {
      setErrorMessage('Dompet tujuan harus berbeda dari dompet asal');
      return;
    }

    const activeCategoryId = type !== 'transfer' ? (categoryId || filteredCategories[0]?.id) : undefined;

    setErrorMessage('');
    const today = new Date().toISOString().slice(0, 10);

    // Mainkan efek audio sukses
    audioService.playSuccessSound();

    onSubmit({
      amount: cleanAmount,
      type,
      date: today,
      walletId: activeWalletId,
      toWalletId: type === 'transfer' ? toWalletId : undefined,
      categoryId: activeCategoryId,
      note: note.trim() || undefined,
    });

    setAmountStr('');
    setNote('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.modalSheet, { backgroundColor: colors.backgroundElement }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                Catat Transaksi
              </ThemedText>
              <ThemedText style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Pencatatan keuangan personal
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tutup dialog"
              onPress={onClose}
              hitSlop={12}
              style={[styles.closeBtn, { backgroundColor: colors.backgroundSelected }]}
            >
              <ThemedText style={[styles.closeText, { color: colors.text }]}>
                ✕
              </ThemedText>
            </Pressable>
          </View>

          {/* Scrollable Form Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.modalScrollBody}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Tipe Transaksi Tab (Segmented) */}
            <View style={[styles.typeSelector, { backgroundColor: colors.backgroundSelected }]}>
              {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => {
                const isSelected = type === t;
                const label =
                  t === 'expense' ? 'Pengeluaran' : t === 'income' ? 'Pemasukan' : 'Transfer';
                return (
                  <Pressable
                    key={t}
                    style={[
                      styles.typeButton,
                      isSelected && {
                        backgroundColor: colors.backgroundElement,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                      },
                    ]}
                    onPress={() => {
                      setType(t);
                      setErrorMessage('');
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.typeText,
                        {
                          color: isSelected ? colors.text : colors.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            {/* Pindai Struk Otomatis (Receipt Scanner) */}
            <View style={[styles.scannerBar, { backgroundColor: colors.backgroundSelected, borderColor: colors.border }]}>
              <View style={styles.scannerInfoCol}>
                <ThemedText style={[styles.scannerTitle, { color: colors.text }]}>
                  {isScanning ? 'Sedang Memindai Struk...' : 'Pindai Struk Otomatis'}
                </ThemedText>
                <ThemedText style={[styles.scannerDesc, { color: colors.textSecondary }]}>
                  Ekstrak nominal dan catatan belanja dari foto struk
                </ThemedText>
              </View>
              <View style={styles.scannerBtnRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Foto Struk Kamera"
                  style={[styles.scannerActionBtn, { backgroundColor: colors.brandPrimary }]}
                  onPress={() => handleScanReceipt(true)}
                  disabled={isScanning}
                >
                  <Ionicons name="camera-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <ThemedText style={styles.scannerActionText}>Kamera</ThemedText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Pilih Struk dari Galeri"
                  style={[styles.scannerActionBtnOutline, { borderColor: colors.border }]}
                  onPress={() => handleScanReceipt(false)}
                  disabled={isScanning}
                >
                  <Ionicons name="images-outline" size={16} color={colors.text} style={{ marginRight: 6 }} />
                  <ThemedText style={[styles.scannerActionOutlineText, { color: colors.text }]}>Galeri</ThemedText>
                </Pressable>
              </View>
            </View>

            {/* Input Nominal Besar */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                Nominal Transaksi (Rp)
              </ThemedText>
              <TextInput
                style={[
                  styles.largeInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.backgroundSelected,
                    borderColor: colors.border,
                  },
                ]}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                value={amountStr}
                onChangeText={(text) => {
                  setAmountStr(text);
                  setErrorMessage('');
                }}
              />
            </View>

            {/* Dompet Asal */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                {type === 'transfer' ? 'Dari Dompet' : 'Dompet / Rekening'}
              </ThemedText>
              <View style={styles.chipsRow}>
                {wallets.map((w) => {
                  const isSelected = (walletId || wallets[0]?.id) === w.id;
                  return (
                    <Pressable
                      key={w.id}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected
                            ? colors.brandPrimary
                            : colors.backgroundSelected,
                        },
                      ]}
                      onPress={() => setWalletId(w.id)}
                    >
                      <ThemedText
                        style={[
                          styles.chipText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.text,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {w.name}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Transfer: Dompet Tujuan */}
            {type === 'transfer' && (
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                  Ke Dompet Tujuan
                </ThemedText>
                <View style={styles.chipsRow}>
                  {wallets.map((w) => {
                    const isSelected = (toWalletId || wallets[1]?.id) === w.id;
                    return (
                      <Pressable
                        key={w.id}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: isSelected
                              ? colors.brandPrimary
                              : colors.backgroundSelected,
                          },
                        ]}
                        onPress={() => setToWalletId(w.id)}
                      >
                        <ThemedText
                          style={[
                            styles.chipText,
                            {
                              color: isSelected ? '#FFFFFF' : colors.text,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {w.name}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Kategori Terpilih & Tombol Buka Grid Kategori Lengkap */}
            {type !== 'transfer' && (
              <View style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <ThemedText style={[styles.label, { color: colors.textSecondary, marginBottom: 0 }]}>
                    Kategori
                  </ThemedText>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Buka Semua Kategori"
                    onPress={() => setIsCategoryPickerOpen(true)}
                  >
                    <ThemedText style={{ color: colors.brandPrimary, fontSize: 12, fontWeight: '700' }}>
                      Lihat Semua & Tambah +
                    </ThemedText>
                  </Pressable>
                </View>

                {/* Grid Pilihan Kategori Ringkas (8 Kategori Pertama + Tombol Buka) */}
                <View style={styles.categoryGridSummary}>
                  {filteredCategories.slice(0, 7).map((c) => {
                    const isSelected = (categoryId || filteredCategories[0]?.id) === c.id;
                    const iconName = c.icon || (type === 'expense' ? 'cart-outline' : 'cash-outline');
                    return (
                      <Pressable
                        key={c.id}
                        style={styles.catGridSummaryItem}
                        onPress={() => setCategoryId(c.id)}
                      >
                        <View
                          style={[
                            styles.catSummaryIconWrapper,
                            {
                              backgroundColor: isSelected ? (c.color || colors.brandPrimary) : colors.backgroundSelected,
                              borderColor: isSelected ? (c.color || colors.brandPrimary) : colors.border,
                            },
                          ]}
                        >
                          <Ionicons
                            name={iconName as any}
                            size={18}
                            color={isSelected ? '#FFFFFF' : (c.color || colors.text)}
                          />
                        </View>
                        <ThemedText
                          style={[
                            styles.catSummaryText,
                            {
                              color: isSelected ? colors.text : colors.textSecondary,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {c.name}
                        </ThemedText>
                      </Pressable>
                    );
                  })}

                  {/* Tombol Pengaturan / Kategori Lainnya */}
                  <Pressable
                    style={styles.catGridSummaryItem}
                    onPress={() => setIsCategoryPickerOpen(true)}
                  >
                    <View
                      style={[
                        styles.catSummaryIconWrapper,
                        {
                          backgroundColor: colors.backgroundSelected,
                          borderColor: colors.border,
                          borderStyle: 'dashed',
                        },
                      ]}
                    >
                      <Ionicons name="apps-outline" size={18} color={colors.textSecondary} />
                    </View>
                    <ThemedText style={[styles.catSummaryText, { color: colors.textSecondary, fontWeight: '600' }]} numberOfLines={1}>
                      Lainnya
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Catatan Transaksi */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                Catatan (Opsional)
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.backgroundSelected,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Contoh: Makan siang bersama rekan"
                placeholderTextColor={colors.textSecondary}
                value={note}
                onChangeText={setNote}
              />
            </View>

            {errorMessage ? (
              <ThemedText style={[styles.errorText, { color: colors.expense }]}>
                {errorMessage}
              </ThemedText>
            ) : null}
          </ScrollView>

          {/* STICKY ACTION FOOTER (Langsung terlihat tanpa perlu scroll) */}
          <View
            style={[
              styles.stickyFooter,
              {
                borderTopColor: colors.border,
                paddingBottom: Math.max(10, insets.bottom),
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Batal Catat Transaksi"
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <ThemedText style={[styles.cancelText, { color: colors.text }]}>
                Batal
              </ThemedText>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Simpan Transaksi"
              style={[styles.submitButton, { backgroundColor: colors.brandPrimary }]}
              onPress={handleSave}
            >
              <ThemedText style={styles.submitText}>
                Simpan Transaksi
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Modal Grid Lengkap & Tambah Kategori Kustom */}
      {type !== 'transfer' && (
        <CategoryPickerModal
          visible={isCategoryPickerOpen}
          type={type}
          categories={categories}
          selectedCategoryId={categoryId}
          onSelectCategory={(id) => setCategoryId(id)}
          onAddCategory={async (newCat) => {
            if (onAddCategory) {
              await onAddCategory(newCat);
            }
          }}
          onClose={() => setIsCategoryPickerOpen(false)}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(17, 22, 20, 0.45)',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '88%',
  },
  modalScrollBody: {
    maxHeight: 420,
  },
  stickyFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  submitButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  modalSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollBody: {
    paddingBottom: 24,
  },
  typeSelector: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeText: {
    fontSize: 13,
  },
  scannerBar: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  scannerInfoCol: {
    marginBottom: 8,
  },
  scannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  scannerDesc: {
    fontSize: 11,
  },
  scannerBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scannerActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scannerActionBtnOutline: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerActionOutlineText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  largeInput: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 20,
    fontWeight: '700',
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryGridSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  catGridSummaryItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 6,
  },
  catSummaryIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 4,
  },
  catSummaryText: {
    fontSize: 11,
    textAlign: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
});
