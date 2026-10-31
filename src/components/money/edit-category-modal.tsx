import { useState, useEffect } from 'react';
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
import { ConfirmationModal } from '@/components/money/confirmation-modal';
import { ThemedText } from '@/components/themed-text';
import { AVAILABLE_CATEGORY_COLORS, AVAILABLE_CATEGORY_ICONS } from '@/constants/default-categories';
import { useAppTheme } from '@/context/theme-context';
import { Category } from '@/types/money';

interface EditCategoryModalProps {
  visible: boolean;
  category: Category | null;
  onSave: (categoryId: string, updates: Partial<Category>) => Promise<void>;
  onDelete?: (categoryId: string) => Promise<void>;
  onClose: () => void;
}

export function EditCategoryModal({
  visible,
  category,
  onSave,
  onDelete,
  onClose,
}: EditCategoryModalProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState(AVAILABLE_CATEGORY_ICONS[0]);
  const [color, setColor] = useState(AVAILABLE_CATEGORY_COLORS[0]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon || (category.type === 'expense' ? 'cart-outline' : 'cash-outline'));
      setColor(category.color || AVAILABLE_CATEGORY_COLORS[0]);
      setErrorMessage('');
    }
  }, [category]);

  const handleSave = async () => {
    if (!category) return;
    if (!name.trim()) {
      setErrorMessage('Nama kategori tidak boleh kosong');
      return;
    }
    setErrorMessage('');
    await onSave(category.id, {
      name: name.trim(),
      icon,
      color,
    });
    onClose();
  };

  const handleDelete = async () => {
    if (!category || !onDelete) return;
    await onDelete(category.id);
    setIsConfirmDeleteOpen(false);
    onClose();
  };

  if (!category) return null;

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
              accessibilityLabel="Batal"
              onPress={onClose}
              hitSlop={12}
            >
              <ThemedText style={[styles.cancelText, { color: colors.textSecondary }]}>
                Batal
              </ThemedText>
            </Pressable>

            <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
              Ubah Kategori
            </ThemedText>

            <View style={{ width: 44 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
            {/* Input Nama */}
            <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Nama Kategori
            </ThemedText>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: colors.backgroundSelected, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Nama Kategori"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={(t) => {
                setName(t);
                setErrorMessage('');
              }}
            />

            {/* Pratinjau Tampilan */}
            <View style={styles.previewContainer}>
              <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary, marginBottom: 8 }]}>
                Pratinjau Kategori
              </ThemedText>
              <View style={[styles.previewBadge, { backgroundColor: colors.backgroundSelected }]}>
                <View style={[styles.previewIconCircle, { backgroundColor: color }]}>
                  <Ionicons name={icon as any} size={22} color="#FFFFFF" />
                </View>
                <ThemedText style={[styles.previewText, { color: colors.text }]}>
                  {name.trim() || 'Nama Kategori'}
                </ThemedText>
              </View>
            </View>

            {/* Pilihan Warna */}
            <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Pilih Warna Aksen
            </ThemedText>
            <View style={styles.colorPaletteGrid}>
              {AVAILABLE_CATEGORY_COLORS.map((col) => {
                const isSelected = color === col;
                return (
                  <Pressable
                    key={col}
                    accessibilityRole="button"
                    style={[
                      styles.colorCircle,
                      { backgroundColor: col },
                      isSelected && { borderWidth: 3, borderColor: '#FFFFFF', transform: [{ scale: 1.1 }] },
                    ]}
                    onPress={() => setColor(col)}
                  />
                );
              })}
            </View>

            {/* Pilihan Ikon */}
            <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>
              Pilih Ikon Simbol
            </ThemedText>
            <View style={styles.iconSelectionGrid}>
              {AVAILABLE_CATEGORY_ICONS.map((ic) => {
                const isSelected = icon === ic;
                return (
                  <Pressable
                    key={ic}
                    accessibilityRole="button"
                    style={[
                      styles.iconOptionBtn,
                      {
                        backgroundColor: isSelected ? color : colors.backgroundSelected,
                        borderColor: isSelected ? color : colors.border,
                      },
                    ]}
                    onPress={() => setIcon(ic)}
                  >
                    <Ionicons
                      name={ic as any}
                      size={20}
                      color={isSelected ? '#FFFFFF' : colors.text}
                    />
                  </Pressable>
                );
              })}
            </View>

            {errorMessage ? (
              <ThemedText style={[styles.errorText, { color: colors.expense }]}>{errorMessage}</ThemedText>
            ) : null}

            <Pressable
              accessibilityRole="button"
              style={[styles.saveBtn, { backgroundColor: colors.brandPrimary }]}
              onPress={handleSave}
            >
              <ThemedText style={styles.saveBtnText}>Simpan Perubahan Kategori</ThemedText>
            </Pressable>

            {onDelete ? (
              <Pressable
                accessibilityRole="button"
                style={[styles.deleteBtn, { borderColor: colors.expense, backgroundColor: colors.expenseBg }]}
                onPress={() => setIsConfirmDeleteOpen(true)}
              >
                <Ionicons name="trash-outline" size={16} color={colors.expense} style={{ marginRight: 6 }} />
                <ThemedText style={[styles.deleteBtnText, { color: colors.expense }]}>
                  Hapus Kategori Ini
                </ThemedText>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <ConfirmationModal
        visible={isConfirmDeleteOpen}
        title={`Hapus Kategori "${category.name}"?`}
        message="Kategori ini akan dihapus dari daftar dan pagu anggaran."
        confirmLabel="Hapus Kategori"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
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
    marginBottom: 16,
  },
  previewContainer: {
    marginBottom: 16,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  previewIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    fontSize: 16,
    fontWeight: '700',
  },
  colorPaletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  iconSelectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  iconOptionBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  saveBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  deleteBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

