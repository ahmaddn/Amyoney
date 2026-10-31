import { useState } from 'react';
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
import { ThemedText } from '@/components/themed-text';
import { AVAILABLE_CATEGORY_COLORS, AVAILABLE_CATEGORY_ICONS } from '@/constants/default-categories';
import { useAppTheme } from '@/context/theme-context';
import { Category } from '@/types/money';

interface CategoryPickerModalProps {
  visible: boolean;
  type: 'expense' | 'income';
  categories: Category[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string) => void;
  onAddCategory: (newCategory: { name: string; type: 'expense' | 'income'; icon: string; color: string }) => Promise<void>;
  onClose: () => void;
}

export function CategoryPickerModal({
  visible,
  type,
  categories,
  selectedCategoryId,
  onSelectCategory,
  onAddCategory,
  onClose,
}: CategoryPickerModalProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customIcon, setCustomIcon] = useState(AVAILABLE_CATEGORY_ICONS[0]);
  const [customColor, setCustomColor] = useState(AVAILABLE_CATEGORY_COLORS[0]);
  const [errorMessage, setErrorMessage] = useState('');

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleCreateCategory = async () => {
    if (!customName.trim()) {
      setErrorMessage('Masukkan nama kategori');
      return;
    }
    setErrorMessage('');
    try {
      await onAddCategory({
        name: customName.trim(),
        type,
        icon: customIcon,
        color: customColor,
      });
      setCustomName('');
      setIsCreatingCustom(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal membuat kategori');
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
              accessibilityLabel="Batalkan"
              onPress={() => {
                if (isCreatingCustom) {
                  setIsCreatingCustom(false);
                } else {
                  onClose();
                }
              }}
              hitSlop={12}
            >
              <ThemedText style={[styles.cancelText, { color: colors.textSecondary }]}>
                {isCreatingCustom ? 'Kembali' : 'Batal'}
              </ThemedText>
            </Pressable>

            <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
              {isCreatingCustom ? 'Kategori Baru' : 'Pilih Kategori'}
            </ThemedText>

            <View style={{ width: 44 }} />
          </View>

          {isCreatingCustom ? (
            /* Formulir Kustom Kategori: Nama, Warna, & Ikon */
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
              <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nama Kategori</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: colors.backgroundSelected, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="Contoh: Kopi, Hobi, Kos-kosan"
                placeholderTextColor={colors.textSecondary}
                value={customName}
                onChangeText={(t) => {
                  setCustomName(t);
                  setErrorMessage('');
                }}
              />

              {/* Preview Kategori Baru */}
              <View style={styles.previewContainer}>
                <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary, marginBottom: 8 }]}>
                  Pratinjau
                </ThemedText>
                <View style={[styles.previewBadge, { backgroundColor: colors.backgroundSelected }]}>
                  <View style={[styles.previewIconCircle, { backgroundColor: customColor }]}>
                    <Ionicons name={customIcon as any} size={22} color="#FFFFFF" />
                  </View>
                  <ThemedText style={[styles.previewText, { color: colors.text }]}>
                    {customName.trim() || 'Nama Kategori'}
                  </ThemedText>
                </View>
              </View>

              {/* Pilihan Warna */}
              <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>Pilih Warna</ThemedText>
              <View style={styles.colorPaletteGrid}>
                {AVAILABLE_CATEGORY_COLORS.map((col) => {
                  const isSelected = customColor === col;
                  return (
                    <Pressable
                      key={col}
                      accessibilityRole="button"
                      style={[
                        styles.colorCircle,
                        { backgroundColor: col },
                        isSelected && { borderWidth: 3, borderColor: '#FFFFFF', transform: [{ scale: 1.1 }] },
                      ]}
                      onPress={() => setCustomColor(col)}
                    />
                  );
                })}
              </View>

              {/* Pilihan Ikon */}
              <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: 14 }]}>
                Pilih Ikon
              </ThemedText>
              <View style={styles.iconSelectionGrid}>
                {AVAILABLE_CATEGORY_ICONS.map((ic) => {
                  const isSelected = customIcon === ic;
                  return (
                    <Pressable
                      key={ic}
                      accessibilityRole="button"
                      style={[
                        styles.iconOptionBtn,
                        {
                          backgroundColor: isSelected ? customColor : colors.backgroundSelected,
                          borderColor: isSelected ? customColor : colors.border,
                        },
                      ]}
                      onPress={() => setCustomIcon(ic)}
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
                onPress={handleCreateCategory}
              >
                <ThemedText style={styles.saveBtnText}>Simpan Kategori</ThemedText>
              </Pressable>
            </ScrollView>
          ) : (
            /* Grid Kategori Seperti di Desain Referensi */
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContent}>
              <View style={styles.categoryGrid}>
                {filteredCategories.map((c) => {
                  const isSelected = selectedCategoryId === c.id;
                  const iconName = c.icon || (type === 'expense' ? 'cart-outline' : 'cash-outline');
                  return (
                    <Pressable
                      key={c.id}
                      accessibilityRole="button"
                      accessibilityLabel={c.name}
                      style={styles.gridItem}
                      onPress={() => {
                        onSelectCategory(c.id);
                        onClose();
                      }}
                    >
                      <View
                        style={[
                          styles.iconWrapper,
                          {
                            backgroundColor: isSelected
                              ? c.color || colors.brandPrimary
                              : colors.backgroundSelected,
                            borderColor: isSelected ? c.color || colors.brandPrimary : colors.border,
                          },
                        ]}
                      >
                        <Ionicons
                          name={iconName as any}
                          size={24}
                          color={isSelected ? '#FFFFFF' : c.color || colors.text}
                        />
                      </View>
                      <ThemedText
                        style={[
                          styles.categoryName,
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

                {/* Tombol Pengaturan / Tambah Kategori Sendiri */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Tambah Kategori Baru"
                  style={styles.gridItem}
                  onPress={() => setIsCreatingCustom(true)}
                >
                  <View
                    style={[
                      styles.iconWrapper,
                      {
                        backgroundColor: colors.backgroundSelected,
                        borderColor: colors.border,
                        borderStyle: 'dashed',
                      },
                    ]}
                  >
                    <Ionicons name="add" size={26} color={colors.textSecondary} />
                  </View>
                  <ThemedText style={[styles.categoryName, { color: colors.textSecondary, fontWeight: '600' }]}>
                    Pengaturan
                  </ThemedText>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
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
  gridContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  iconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
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
});

