import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BudgetCard } from '@/components/money/budget-card';
import { EmptyState } from '@/components/money/empty-state';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
import { useMoneyData } from '@/hooks/use-money-data';
import { Category } from '@/types/money';
import { formatRupiah } from '@/utils/format';

export default function ExploreScreen() {
  const { colors } = useAppTheme();
  const { categories, budgetProgress, updateCategoryBudget, overview } = useMoneyData();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [budgetInput, setBudgetInput] = useState('');

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setBudgetInput(String(cat.monthlyBudget || ''));
  };

  const handleSaveBudget = async () => {
    if (!editingCategory) return;
    const amount = parseInt(budgetInput.replace(/[^0-9]/g, ''), 10) || 0;
    await updateCategoryBudget(editingCategory.id, amount);
    setEditingCategory(null);
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Layar */}
        <Animated.View entering={FadeInDown.duration(300).springify()}>
          <ThemedText style={[styles.screenTitle, { color: colors.text }]}>
            Pagu Anggaran
          </ThemedText>
          <ThemedText style={[styles.subText, { color: colors.textSecondary }]}>
            Disiplin finansial melalui sistem alokasi batas per kategori belanja.
          </ThemedText>
        </Animated.View>

        {/* Ringkasan Pagu Hero Metric */}
        <Animated.View entering={FadeInDown.delay(100).duration(350).springify()} style={[styles.overviewCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <View style={styles.metricRow}>
            <View>
              <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>
                TOTAL PAGU BULANAN
              </ThemedText>
              <ThemedText style={[styles.metricVal, { color: colors.text }]}>
                {formatRupiah(overview.totalAllocatedBudget)}
              </ThemedText>
            </View>
            <View style={styles.rightMetric}>
              <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>
                REALISASI BELANJA
              </ThemedText>
              <ThemedText style={[styles.metricVal, { color: colors.expense }]}>
                {formatRupiah(overview.totalBudgetSpent)}
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(350).springify()}>
          <ThemedText style={[styles.sectionHeading, { color: colors.text }]}>
            Pagu Kategori Aktif
          </ThemedText>

          {budgetProgress.length === 0 ? (
            <EmptyState
              title="Belum Ada Target Budget"
              description="Pilih salah satu kategori pengeluaran di bawah untuk menentukan target anggaran bulanan Anda."
            />
          ) : (
            budgetProgress.map((bp) => (
              <BudgetCard key={bp.category.id} progress={bp} onEditBudget={handleOpenEdit} />
            ))
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(350).springify()}>
          <ThemedText style={[styles.sectionHeading, { color: colors.text, marginTop: 18 }]}>
            Semua Kategori Belanja
          </ThemedText>

          <View style={[styles.categoryList, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            {expenseCategories.map((cat) => (
              <View key={cat.id} style={[styles.catRow, { borderBottomColor: colors.border }]}>
                <View style={styles.catInfo}>
                  <ThemedText style={[styles.catName, { color: colors.text }]}>{cat.name}</ThemedText>
                  <ThemedText style={[styles.catSub, { color: colors.textSecondary }]}>
                    {cat.monthlyBudget > 0
                      ? `Pagu: ${formatRupiah(cat.monthlyBudget)}/bln`
                      : 'Belum diatur'}
                  </ThemedText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Atur budget ${cat.name}`}
                  style={[styles.editCatBtn, { borderColor: colors.border }]}
                  onPress={() => handleOpenEdit(cat)}
                >
                  <ThemedText style={[styles.editCatText, { color: colors.text }]}>
                    {cat.monthlyBudget > 0 ? 'Edit' : 'Atur Pagu'}
                  </ThemedText>
                </Pressable>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Modal Edit Pagu */}
      <Modal visible={Boolean(editingCategory)} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: colors.backgroundElement }]}>
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
              Atur Pagu Anggaran
            </ThemedText>
            <ThemedText style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Kategori: {editingCategory?.name}
            </ThemedText>

            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colors.text,
                  backgroundColor: colors.backgroundSelected,
                  borderColor: colors.border,
                },
              ]}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              value={budgetInput}
              onChangeText={setBudgetInput}
            />

            <View style={styles.modalBtnRow}>
              <Pressable
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setEditingCategory(null)}
              >
                <ThemedText style={[styles.btnText, { color: colors.text }]}>Batal</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.saveBtn, { backgroundColor: colors.brandPrimary }]}
                onPress={handleSaveBudget}
              >
                <ThemedText style={[styles.btnText, { color: '#FFFFFF' }]}>
                  Simpan Pagu
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
  overviewCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightMetric: {
    alignItems: 'flex-end',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  categoryList: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  catInfo: {
    flex: 1,
    paddingRight: 10,
  },
  catName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  catSub: {
    fontSize: 12,
  },
  editCatBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  editCatText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 22, 20, 0.45)',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    marginBottom: 18,
  },
  modalInput: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
