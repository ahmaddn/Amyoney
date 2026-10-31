import { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ConfirmationModal } from '@/components/money/confirmation-modal';
import { ThemedText } from '@/components/themed-text';
import { AVAILABLE_CATEGORY_COLORS } from '@/constants/default-categories';
import { useAppTheme } from '@/context/theme-context';
import { Wallet } from '@/types/money';
import { formatRupiah } from '@/utils/format';

interface ManageWalletsModalProps {
  visible: boolean;
  wallets: Wallet[];
  onUpdateWallet: (walletId: string, updates: Partial<Wallet>) => Promise<void>;
  onAddWallet: (newWallet: Omit<Wallet, 'id' | 'updatedAt'>) => Promise<void>;
  onDeleteWallet: (walletId: string) => Promise<void>;
  onClose: () => void;
}

export function ManageWalletsModal({
  visible,
  wallets,
  onUpdateWallet,
  onAddWallet,
  onDeleteWallet,
  onClose,
}: ManageWalletsModalProps) {
  const { colors, currency } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<'list' | 'edit' | 'create'>('list');
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);

  // Form Fields
  const [nameInput, setNameInput] = useState('');
  const [balanceInput, setBalanceInput] = useState('');
  const [typeInput, setTypeInput] = useState<'bank' | 'cash' | 'ewallet' | 'other'>('bank');
  const [colorInput, setColorInput] = useState(AVAILABLE_CATEGORY_COLORS[0]);
  const [isActiveInput, setIsActiveInput] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (editingWallet) {
      setNameInput(editingWallet.name);
      setBalanceInput(String(editingWallet.balance));
      setTypeInput(editingWallet.type || 'bank');
      setColorInput(editingWallet.color || AVAILABLE_CATEGORY_COLORS[0]);
      setIsActiveInput(editingWallet.isActive !== false);
      setErrorMessage('');
    }
  }, [editingWallet]);

  const handleOpenCreate = () => {
    setNameInput('');
    setBalanceInput('0');
    setTypeInput('bank');
    setColorInput(AVAILABLE_CATEGORY_COLORS[0]);
    setIsActiveInput(true);
    setErrorMessage('');
    setMode('create');
  };

  const handleOpenEdit = (w: Wallet) => {
    setEditingWallet(w);
    setMode('edit');
  };

  const handleSave = async () => {
    if (!nameInput.trim()) {
      setErrorMessage('Nama akun/dompet tidak boleh kosong');
      return;
    }
    const cleanBalance = parseInt(balanceInput.replace(/[^0-9]/g, ''), 10) || 0;

    if (mode === 'create') {
      await onAddWallet({
        name: nameInput.trim(),
        type: typeInput,
        balance: cleanBalance,
        color: colorInput,
        isDefault: false,
        isActive: isActiveInput,
      });
      setMode('list');
    } else if (mode === 'edit' && editingWallet) {
      await onUpdateWallet(editingWallet.id, {
        name: nameInput.trim(),
        type: typeInput,
        balance: cleanBalance,
        color: colorInput,
        isActive: isActiveInput,
      });
      setEditingWallet(null);
      setMode('list');
    }
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
        <View
          style={[
            styles.containerSheet,
            {
              backgroundColor: colors.backgroundElement,
              paddingBottom: Math.max(24, insets.bottom + 16),
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={mode === 'list' ? 'Tutup' : 'Kembali'}
              onPress={() => {
                if (mode !== 'list') {
                  setMode('list');
                  setEditingWallet(null);
                } else {
                  onClose();
                }
              }}
              hitSlop={12}
            >
              <ThemedText style={[styles.cancelText, { color: colors.textSecondary }]}>
                {mode === 'list' ? 'Tutup' : 'Kembali'}
              </ThemedText>
            </Pressable>

            <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
              {mode === 'create'
                ? 'Tambah Akun / Dompet'
                : mode === 'edit'
                ? 'Ubah Akun & Saldo'
                : 'Kelola Akun & Dompet'}
            </ThemedText>

            {mode === 'list' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tambah Akun Baru"
                onPress={handleOpenCreate}
                hitSlop={12}
              >
                <ThemedText style={{ color: colors.brandPrimary, fontWeight: '700', fontSize: 13 }}>
                  + Tambah
                </ThemedText>
              </Pressable>
            ) : (
              <View style={{ width: 44 }} />
            )}
          </View>

          {mode !== 'list' ? (
            /* Formulir Tambah / Ubah Akun */
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
              <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Nama Akun / Rekening
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: colors.backgroundSelected, color: colors.text, borderColor: colors.border },
                ]}
                value={nameInput}
                onChangeText={(t) => {
                  setNameInput(t);
                  setErrorMessage('');
                }}
                placeholder="Contoh: Tabungan Mandiri, Uang Saku, GoPay"
                placeholderTextColor={colors.textSecondary}
              />

              {/* Tipe Akun */}
              <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Tipe Akun
              </ThemedText>
              <View style={styles.typeSelectorRow}>
                {[
                  { key: 'bank', label: 'Bank' },
                  { key: 'cash', label: 'Tunai' },
                  { key: 'ewallet', label: 'E-Wallet' },
                  { key: 'other', label: 'Lainnya' },
                ].map((t) => {
                  const isSelected = typeInput === t.key;
                  return (
                    <Pressable
                      key={t.key}
                      style={[
                        styles.typePill,
                        {
                          backgroundColor: isSelected ? colors.brandPrimary : colors.backgroundSelected,
                          borderColor: isSelected ? colors.brandPrimary : colors.border,
                        },
                      ]}
                      onPress={() => setTypeInput(t.key as any)}
                    >
                      <ThemedText
                        style={[
                          styles.typePillText,
                          { color: isSelected ? '#FFFFFF' : colors.text, fontWeight: isSelected ? '700' : '500' },
                        ]}
                      >
                        {t.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>

              <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>
                Saldo Saat Ini ({currency})
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: colors.backgroundSelected, color: colors.text, borderColor: colors.border, fontSize: 18, fontWeight: '700' },
                ]}
                keyboardType="numeric"
                value={balanceInput}
                onChangeText={setBalanceInput}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />

              {/* Quick Preset Nominal Saldo */}
              <View style={styles.presetRow}>
                {['0', '500000', '1000000', '5000000'].map((val) => (
                  <Pressable
                    key={val}
                    style={[styles.presetChip, { borderColor: colors.border }]}
                    onPress={() => setBalanceInput(val)}
                  >
                    <ThemedText style={[styles.presetChipText, { color: colors.text }]}>
                      {val === '0' ? 'Nol (Rp 0)' : val === '500000' ? '500rb' : val === '1000000' ? '1 Jt' : '5 Jt'}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {/* Pilihan Warna */}
              <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Warna Identitas
              </ThemedText>
              <View style={styles.colorRow}>
                {AVAILABLE_CATEGORY_COLORS.slice(0, 8).map((col) => {
                  const isSelected = colorInput === col;
                  return (
                    <Pressable
                      key={col}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: col },
                        isSelected && { borderWidth: 3, borderColor: '#FFFFFF', transform: [{ scale: 1.1 }] },
                      ]}
                      onPress={() => setColorInput(col)}
                    />
                  );
                })}
              </View>

              {/* Toggle Aktif / Tampilkan di Beranda */}
              <View style={[styles.switchRow, { borderColor: colors.border, backgroundColor: colors.backgroundSelected }]}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <ThemedText style={[styles.switchTitle, { color: colors.text }]}>
                    Tampilkan di Beranda
                  </ThemedText>
                  <ThemedText style={[styles.switchSubtitle, { color: colors.textSecondary }]}>
                    Aktifkan akun ini untuk transaksi dan kemunculan di ringkasan
                  </ThemedText>
                </View>
                <Switch
                  value={isActiveInput}
                  onValueChange={setIsActiveInput}
                  trackColor={{ false: colors.border, true: colors.brandPrimary }}
                />
              </View>

              {errorMessage ? (
                <ThemedText style={[styles.errorText, { color: colors.expense }]}>{errorMessage}</ThemedText>
              ) : null}

              <View style={styles.btnRow}>
                {mode === 'edit' && editingWallet && (
                  <Pressable
                    style={[styles.deleteBtn, { backgroundColor: colors.expenseBg, borderColor: colors.expense }]}
                    onPress={() => setWalletToDelete(editingWallet)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.expense} />
                  </Pressable>
                )}
                <Pressable
                  style={[styles.saveBtn, { backgroundColor: colors.brandPrimary }]}
                  onPress={handleSave}
                >
                  <ThemedText style={[styles.btnText, { color: '#FFFFFF' }]}>
                    {mode === 'create' ? 'Tambah Akun' : 'Simpan Akun'}
                  </ThemedText>
                </Pressable>
              </View>
            </ScrollView>
          ) : (
            /* Daftar Semua Dompet / Rekening */
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
              <ThemedText style={[styles.hintText, { color: colors.textSecondary }]}>
                Ketuk akun di bawah untuk mengatur saldo awal, mengubah nama/warna, mengaktifkan/menonaktifkan, atau menghapusnya.
              </ThemedText>

              {wallets.map((w) => {
                const isActive = w.isActive !== false;
                return (
                  <Pressable
                    key={w.id}
                    style={[
                      styles.walletListItem,
                      {
                        backgroundColor: colors.backgroundSelected,
                        borderColor: colors.border,
                        opacity: isActive ? 1 : 0.6,
                      },
                    ]}
                    onPress={() => handleOpenEdit(w)}
                  >
                    <View style={styles.walletItemLeft}>
                      <View style={[styles.walletDot, { backgroundColor: w.color || colors.brandPrimary }]} />
                      <View>
                        <ThemedText style={[styles.walletItemName, { color: colors.text }]}>
                          {w.name}
                        </ThemedText>
                        <ThemedText style={[styles.walletItemStatus, { color: isActive ? colors.income : colors.textSecondary }]}>
                          {isActive ? 'Aktif di Beranda' : 'Dinonaktifkan'}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <ThemedText style={[styles.walletItemBalance, { color: colors.text }]}>
                        {formatRupiah(w.balance, currency)}
                      </ThemedText>
                      <ThemedText style={{ color: colors.brandPrimary, fontSize: 11, fontWeight: '700', marginTop: 2 }}>
                        Ubah →
                      </ThemedText>
                    </View>
                  </Pressable>
                );
              })}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tambah Akun Baru"
                style={[styles.addWalletBtn, { borderColor: colors.brandPrimary }]}
                onPress={handleOpenCreate}
              >
                <Ionicons name="add" size={18} color={colors.brandPrimary} style={{ marginRight: 6 }} />
                <ThemedText style={[styles.addWalletBtnText, { color: colors.brandPrimary }]}>
                  + Tambah Akun / Rekening Baru
                </ThemedText>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Konfirmasi Hapus Akun Dompet */}
      <ConfirmationModal
        visible={Boolean(walletToDelete)}
        title="Hapus Akun / Dompet?"
        message={`Akun "${walletToDelete?.name}" akan dihapus secara permanen.`}
        confirmLabel="Hapus Akun"
        onConfirm={async () => {
          if (walletToDelete) {
            await onDeleteWallet(walletToDelete.id);
            setWalletToDelete(null);
            setEditingWallet(null);
            setMode('list');
          }
        }}
        onCancel={() => setWalletToDelete(null)}
      />
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  containerSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  listContent: {
    padding: 20,
  },
  hintText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  walletListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  walletItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  walletItemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  walletItemStatus: {
    fontSize: 11,
    marginTop: 2,
  },
  walletItemBalance: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  addWalletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 10,
  },
  addWalletBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  formContent: {
    padding: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 14,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  typePillText: {
    fontSize: 12,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  switchSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteBtn: {
    width: 48,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
