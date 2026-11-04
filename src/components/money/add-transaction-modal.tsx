import { useEffect, useState } from 'react';
import {
  Modal,
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
import { hapticService } from '@/services/haptic-service';
import { receiptScannerService } from '@/services/receipt-scanner-service';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/context/theme-context';
import { Category, TransactionType, Wallet } from '@/types/money';
import { formatDateIndo, formatRupiah } from '@/utils/format';
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
  const { colors, currency } = useAppTheme();
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
  const [isWalletPickerOpen, setIsWalletPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Inisialisasi walletId & categoryId secara dinamis
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
  const activeWallet = wallets.find((w) => w.id === walletId) || wallets[0];
  const activeToWallet = wallets.find((w) => w.id === toWalletId) || wallets[1];

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

  // Handler Keypad Angka Bawaan
  const handleKeypadPress = (val: string) => {
    hapticService.light();
    setErrorMessage('');
    if (val === 'DEL') {
      setAmountStr((prev) => prev.slice(0, -1));
    } else if (val === '000') {
      if (!amountStr || amountStr === '0') return;
      if (amountStr.length + 3 > 12) return;
      setAmountStr((prev) => prev + '000');
    } else {
      if (amountStr === '0') {
        setAmountStr(val);
      } else {
        if (amountStr.length >= 12) return;
        setAmountStr((prev) => prev + val);
      }
    }
  };

  const handleSave = () => {
    const cleanAmount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10);
    if (!cleanAmount || cleanAmount <= 0) {
      hapticService.warning();
      setErrorMessage('Masukkan nominal angka');
      return;
    }
    const activeWalletId = walletId || wallets[0]?.id;
    if (!activeWalletId) {
      hapticService.warning();
      setErrorMessage('Pilih dompet');
      return;
    }
    if (type === 'transfer' && activeWalletId === toWalletId) {
      hapticService.warning();
      setErrorMessage('Dompet tujuan harus berbeda');
      return;
    }

    const activeCategoryId = type !== 'transfer' ? (categoryId || filteredCategories[0]?.id) : undefined;

    setErrorMessage('');

    // Mainkan efek audio sukses & getaran native sukses
    audioService.playSuccessSound();
    hapticService.success();

    onSubmit({
      amount: cleanAmount,
      type,
      date: selectedDate,
      walletId: activeWalletId,
      toWalletId: type === 'transfer' ? toWalletId : undefined,
      categoryId: activeCategoryId,
      note: note.trim() || undefined,
    });

    setAmountStr('');
    setNote('');
    onClose();
  };

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);
  const formattedDisplayAmount = amountStr ? formatRupiah(parseInt(amountStr, 10) || 0, currency) : '0';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />
        <View
          style={[
            styles.containerSheet,
            {
              backgroundColor: colors.backgroundElement,
              paddingBottom: Math.max(16, insets.bottom),
            },
          ]}
        >
          {/* 1. HEADER ATAS (Batalkan | Tambahkan | Currency) */}
          <View style={styles.topHeaderBar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Batalkan"
              onPress={onClose}
              hitSlop={12}
            >
              <ThemedText style={[styles.cancelHeaderBtn, { color: colors.textSecondary }]}>
                Batalkan
              </ThemedText>
            </Pressable>

            <ThemedText style={[styles.headerTitleText, { color: colors.text }]}>
              Tambahkan
            </ThemedText>

            <View style={[styles.currencyPill, { backgroundColor: colors.backgroundSelected }]}>
              <ThemedText style={[styles.currencyPillText, { color: colors.text }]}>
                {currency}
              </ThemedText>
            </View>
          </View>

          {/* 2. TAB SELECTOR TIPE (Pengeluaran | Pemasukan | Transfer) */}
          <View style={[styles.segmentedWrapper, { backgroundColor: colors.backgroundSelected }]}>
            {(['expense', 'income', 'transfer'] as TransactionType[]).map((t) => {
              const isSelected = type === t;
              const label =
                t === 'expense' ? 'Pengeluaran' : t === 'income' ? 'Pemasukan' : 'Transfer';
              return (
                <Pressable
                  key={t}
                  style={[
                    styles.segmentBtn,
                    isSelected && {
                      backgroundColor: colors.backgroundElement,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.08,
                      shadowRadius: 2,
                      elevation: 2,
                    },
                  ]}
                  onPress={() => {
                    setType(t);
                    setErrorMessage('');
                  }}
                >
                  <ThemedText
                    style={[
                      styles.segmentBtnText,
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

          {/* 3. GRID IKON KATEGORI 4-KOLOM (SCROLLABLE) */}
          {type !== 'transfer' ? (
            <ScrollView
              style={styles.categoryScrollArea}
              contentContainerStyle={styles.categoryGridContent}
              showsVerticalScrollIndicator={false}
            >
              {filteredCategories.map((c) => {
                const isSelected = (categoryId || filteredCategories[0]?.id) === c.id;
                const iconName = c.icon || (type === 'expense' ? 'cart-outline' : 'cash-outline');
                return (
                  <Pressable
                    key={c.id}
                    style={styles.catGridCard}
                    onPress={() => setCategoryId(c.id)}
                  >
                    <View
                      style={[
                        styles.catCircleIcon,
                        {
                          backgroundColor: isSelected ? (c.color || colors.brandPrimary) : colors.backgroundSelected,
                          borderColor: isSelected ? (c.color || colors.brandPrimary) : colors.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name={iconName as any}
                        size={22}
                        color={isSelected ? '#FFFFFF' : (c.color || colors.text)}
                      />
                    </View>
                    <ThemedText
                      style={[
                        styles.catNameLabel,
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

              {/* Slot Terakhir: Kelola Kategori / Tambah + */}
              <Pressable
                style={styles.catGridCard}
                onPress={() => setIsCategoryPickerOpen(true)}
              >
                <View
                  style={[
                    styles.catCircleIcon,
                    {
                      backgroundColor: colors.backgroundSelected,
                      borderColor: colors.border,
                      borderStyle: 'dashed',
                    },
                  ]}
                >
                  <Ionicons name="add" size={22} color={colors.textSecondary} />
                </View>
                <ThemedText
                  style={[styles.catNameLabel, { color: colors.textSecondary, fontWeight: '600' }]}
                  numberOfLines={1}
                >
                  Pengaturan
                </ThemedText>
              </Pressable>
            </ScrollView>
          ) : (
            /* Mode Transfer: Pemilih Dompet Asal & Tujuan */
            <View style={styles.transferArea}>
              <View style={[styles.transferCard, { backgroundColor: colors.backgroundSelected, borderColor: colors.border }]}>
                <View style={styles.transferRow}>
                  <ThemedText style={[styles.transferLabel, { color: colors.textSecondary }]}>Dari:</ThemedText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, marginLeft: 8 }}>
                    {wallets.map((w) => (
                      <Pressable
                        key={w.id}
                        style={[
                          styles.transferWalletChip,
                          {
                            backgroundColor: walletId === w.id ? colors.brandPrimary : colors.backgroundElement,
                            borderColor: walletId === w.id ? colors.brandPrimary : colors.border,
                          },
                        ]}
                        onPress={() => setWalletId(w.id)}
                      >
                        <ThemedText style={[styles.transferWalletText, { color: walletId === w.id ? '#FFFFFF' : colors.text }]}>
                          {w.name}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                <View style={[styles.transferRow, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }]}>
                  <ThemedText style={[styles.transferLabel, { color: colors.textSecondary }]}>Ke:</ThemedText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, marginLeft: 8 }}>
                    {wallets.map((w) => (
                      <Pressable
                        key={w.id}
                        style={[
                          styles.transferWalletChip,
                          {
                            backgroundColor: toWalletId === w.id ? colors.brandPrimary : colors.backgroundElement,
                            borderColor: toWalletId === w.id ? colors.brandPrimary : colors.border,
                          },
                        ]}
                        onPress={() => setToWalletId(w.id)}
                      >
                        <ThemedText style={[styles.transferWalletText, { color: toWalletId === w.id ? '#FFFFFF' : colors.text }]}>
                          {w.name}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
          )}

          {/* 4. BARIS NOMINAL & DOMPET AKTIF */}
          <View style={[styles.amountDisplayRow, { borderTopColor: colors.border, backgroundColor: colors.backgroundElement }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pilih Dompet"
              style={[styles.walletSelectorBadge, { backgroundColor: colors.backgroundSelected, borderColor: colors.border }]}
              onPress={() => setIsWalletPickerOpen(true)}
            >
              <Ionicons name="wallet-outline" size={16} color={colors.brandPrimary} />
              <ThemedText style={[styles.walletSelectorName, { color: colors.text }]} numberOfLines={1}>
                {activeWallet?.name || 'Pilih Dompet'}
              </ThemedText>
              <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
            </Pressable>

            <View style={styles.amountDisplayCol}>
              <ThemedText
                style={[
                  styles.amountNumberText,
                  { color: amountStr ? (type === 'expense' ? colors.expense : colors.income) : colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {formattedDisplayAmount}
              </ThemedText>
            </View>
          </View>

          {/* 5. BARIS CATATAN + SHORTCUT KAMERA STRUK */}
          <View style={[styles.noteInputRow, { backgroundColor: colors.backgroundSelected, borderColor: colors.border }]}>
            <Ionicons name="pencil-outline" size={15} color={colors.textSecondary} style={{ marginRight: 6 }} />
            <TextInput
              style={[styles.noteInputField, { color: colors.text }]}
              placeholder="Catatan : Masukkan catatan..."
              placeholderTextColor={colors.textSecondary}
              value={note}
              onChangeText={setNote}
            />

            {/* Tombol Kamera Struk OCR */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pindai Struk"
              onPress={() => handleScanReceipt(true)}
              style={styles.cameraIconBtn}
              hitSlop={8}
            >
              <Ionicons
                name="camera-outline"
                size={19}
                color={isScanning ? colors.brandPrimary : colors.textSecondary}
              />
            </Pressable>
          </View>

          {errorMessage ? (
            <ThemedText style={[styles.errorMsgText, { color: colors.expense }]}>
              {errorMessage}
            </ThemedText>
          ) : null}

          {/* 6. KEYPAD ANGKA TERINTEGRASI (BUILT-IN NUMERIC KEYPAD) */}
          <View style={styles.keypadGrid}>
            {/* Baris 1: 7, 8, 9, Hari ini / Tanggal */}
            <View style={styles.keypadRow}>
              {['7', '8', '9'].map((k) => (
                <Pressable
                  key={k}
                  style={[styles.keypadKey, { backgroundColor: colors.backgroundSelected }]}
                  onPress={() => handleKeypadPress(k)}
                >
                  <ThemedText style={[styles.keyText, { color: colors.text }]}>{k}</ThemedText>
                </Pressable>
              ))}
              <Pressable
                style={[styles.keypadKey, styles.keypadDateKey, { backgroundColor: colors.backgroundSelected }]}
                onPress={() => setIsDatePickerOpen(true)}
              >
                <Ionicons name="calendar-outline" size={14} color={colors.brandPrimary} style={{ marginRight: 3 }} />
                <ThemedText style={[styles.keyDateText, { color: colors.brandPrimary }]} numberOfLines={1}>
                  {isToday ? 'Hari ini' : selectedDate.slice(5)}
                </ThemedText>
              </Pressable>
            </View>

            {/* Baris 2: 4, 5, 6, + (atau opsional) */}
            <View style={styles.keypadRow}>
              {['4', '5', '6'].map((k) => (
                <Pressable
                  key={k}
                  style={[styles.keypadKey, { backgroundColor: colors.backgroundSelected }]}
                  onPress={() => handleKeypadPress(k)}
                >
                  <ThemedText style={[styles.keyText, { color: colors.text }]}>{k}</ThemedText>
                </Pressable>
              ))}
              <Pressable
                style={[styles.keypadKey, { backgroundColor: colors.backgroundSelected }]}
                onPress={() => handleKeypadPress('DEL')}
              >
                <Ionicons name="backspace-outline" size={20} color={colors.text} />
              </Pressable>
            </View>

            {/* Baris 3: 1, 2, 3, 000 */}
            <View style={styles.keypadRow}>
              {['1', '2', '3'].map((k) => (
                <Pressable
                  key={k}
                  style={[styles.keypadKey, { backgroundColor: colors.backgroundSelected }]}
                  onPress={() => handleKeypadPress(k)}
                >
                  <ThemedText style={[styles.keyText, { color: colors.text }]}>{k}</ThemedText>
                </Pressable>
              ))}
              <Pressable
                style={[styles.keypadKey, { backgroundColor: colors.backgroundSelected }]}
                onPress={() => handleKeypadPress('000')}
              >
                <ThemedText style={[styles.keyText, { color: colors.text, fontSize: 16 }]}>000</ThemedText>
              </Pressable>
            </View>

            {/* Baris 4: 0, DEL, dan Simpan (✓) */}
            <View style={styles.keypadRow}>
              <Pressable
                style={[styles.keypadKey, { backgroundColor: colors.backgroundSelected, flex: 2 }]}
                onPress={() => handleKeypadPress('0')}
              >
                <ThemedText style={[styles.keyText, { color: colors.text }]}>0</ThemedText>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Simpan Transaksi"
                style={[styles.keypadSubmitKey, { backgroundColor: colors.brandPrimary, flex: 2 }]}
                onPress={handleSave}
              >
                <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Modal Pemilih Dompet Cepat */}
      <Modal visible={isWalletPickerOpen} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.backdropPressable} onPress={() => setIsWalletPickerOpen(false)} />
          <View style={[styles.pickerDialog, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <ThemedText style={[styles.pickerDialogTitle, { color: colors.text }]}>
              Pilih Sumber Dompet
            </ThemedText>
            {wallets.map((w) => {
              const isSelected = walletId === w.id;
              return (
                <Pressable
                  key={w.id}
                  style={[
                    styles.walletOptionRow,
                    isSelected && { backgroundColor: colors.backgroundSelected },
                  ]}
                  onPress={() => {
                    setWalletId(w.id);
                    setIsWalletPickerOpen(false);
                  }}
                >
                  <View style={[styles.walletDot, { backgroundColor: w.color || colors.brandPrimary }]} />
                  <ThemedText style={[styles.walletOptionName, { color: colors.text, fontWeight: isSelected ? '700' : '500' }]}>
                    {w.name}
                  </ThemedText>
                  <ThemedText style={[styles.walletOptionBalance, { color: colors.textSecondary }]}>
                    {formatRupiah(w.balance, currency)}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* Modal Pemilih Tanggal Cepat */}
      <Modal visible={isDatePickerOpen} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.backdropPressable} onPress={() => setIsDatePickerOpen(false)} />
          <View style={[styles.pickerDialog, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            <ThemedText style={[styles.pickerDialogTitle, { color: colors.text }]}>
              Pilih Tanggal Transaksi
            </ThemedText>
            {[
              { label: 'Hari Ini', val: new Date().toISOString().slice(0, 10) },
              {
                label: 'Kemarin',
                val: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
              },
              {
                label: '2 Hari Lalu',
                val: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().slice(0, 10),
              },
            ].map((d) => (
              <Pressable
                key={d.val}
                style={[
                  styles.walletOptionRow,
                  selectedDate === d.val && { backgroundColor: colors.backgroundSelected },
                ]}
                onPress={() => {
                  setSelectedDate(d.val);
                  setIsDatePickerOpen(false);
                }}
              >
                <ThemedText style={[styles.walletOptionName, { color: colors.text, fontWeight: selectedDate === d.val ? '700' : '500' }]}>
                  {d.label} ({d.val})
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  containerSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingTop: 14,
  },
  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  cancelHeaderBtn: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  currencyPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currencyPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  segmentedWrapper: {
    flexDirection: 'row',
    borderRadius: 12,
    marginHorizontal: 20,
    padding: 3,
    marginBottom: 14,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  segmentBtnText: {
    fontSize: 13,
  },
  categoryScrollArea: {
    maxHeight: 185,
    marginHorizontal: 14,
    marginBottom: 10,
  },
  categoryGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 6,
  },
  catGridCard: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 14,
  },
  catCircleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 4,
  },
  catNameLabel: {
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  transferArea: {
    height: 185,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  transferCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  transferRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transferLabel: {
    fontSize: 13,
    fontWeight: '600',
    width: 45,
  },
  transferWalletChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  transferWalletText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  walletSelectorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    maxWidth: 150,
  },
  walletSelectorName: {
    fontSize: 12,
    fontWeight: '700',
  },
  amountDisplayCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  amountNumberText: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  noteInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  noteInputField: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  cameraIconBtn: {
    padding: 4,
    marginLeft: 6,
  },
  errorMsgText: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 6,
  },
  keypadGrid: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 6,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 6,
  },
  keypadKey: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadDateKey: {
    flexDirection: 'row',
  },
  keyText: {
    fontSize: 19,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  keyDateText: {
    fontSize: 11,
    fontWeight: '700',
  },
  keypadSubmitKey: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerDialog: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    alignSelf: 'center',
    marginVertical: 'auto',
  },
  pickerDialogTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  walletOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  walletDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  walletOptionName: {
    flex: 1,
    fontSize: 13,
  },
  walletOptionBalance: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
});
