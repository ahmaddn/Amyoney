import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BudgetCard } from '@/components/money/budget-card';
import { CategoryPickerModal } from '@/components/money/category-picker-modal';
import { EditCategoryModal } from '@/components/money/edit-category-modal';
import { EmptyState } from '@/components/money/empty-state';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
import { useMoneyData } from '@/hooks/use-money-data';
import { Category } from '@/types/money';
import { formatRupiah } from '@/utils/format';

export function BudgetTab() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const {
    wallets,
    categories,
    budgetProgress,
    updateCategoryBudget,
    updateCategory,
    deleteCategory,
    addCategory,
    overview,
  } = useMoneyData();

  // State Pengaturan Pagu Keseluruhan & Multi-Anggaran
  const [selectedWalletId, setSelectedWalletId] = useState<string>('all'); // 'all' atau ID wallet spesifik
  const [targetOverallBudget, setTargetOverallBudget] = useState<number>(3000000);
  const [budgetDurationDays, setBudgetDurationDays] = useState<number>(30);
  const [isEditingOverallBudget, setIsEditingOverallBudget] = useState(false);
  const [overallInputStr, setOverallInputStr] = useState('3000000');
  const [durationInputDays, setDurationInputDays] = useState('30');
  const [overallBudgetError, setOverallBudgetError] = useState('');
  
  // Periode Kalender / Date Range
  const [startDateStr, setStartDateStr] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [endDateStr, setEndDateStr] = useState(() => {
    const d = new Date();
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  });
  const [periodSelectionType, setPeriodSelectionType] = useState<'days' | 'dates'>('days');

  // State Pengaturan Alokasi Kategori
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCategoryDetail, setEditingCategoryDetail] = useState<Category | null>(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [inputMode, setInputMode] = useState<'nominal' | 'percent'>('percent');
  const [budgetInput, setBudgetInput] = useState('');
  const [percentInput, setPercentInput] = useState('');

  // Batas Maksimal Saldo yang dapat dianggarkan sesuai pilihan dompet
  const activeWallets = wallets.filter((w) => w.isActive !== false);
  const selectedWallet = activeWallets.find((w) => w.id === selectedWalletId);
  const maxAvailableBudget = selectedWallet
    ? Math.max(0, selectedWallet.balance)
    : Math.max(0, overview.totalBalance);

  // Perhitungan Real-Time
  const today = new Date();
  const currentDay = today.getDate();
  const totalDaysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, budgetDurationDays - Math.min(currentDay, budgetDurationDays));

  const totalSpent = overview.totalBudgetSpent;
  const totalAllocated = overview.totalAllocatedBudget;
  const remainingBudget = Math.max(0, targetOverallBudget - totalSpent);
  const remainingUnallocated = Math.max(0, targetOverallBudget - totalAllocated);

  // Batas aman belanja per hari
  const dailySafeSpendLimit = Math.round(remainingBudget / Math.max(1, daysRemaining));
  const dailyAverageSpent = Math.round(totalSpent / Math.max(1, currentDay));

  // Indikator boros / wajar / hemat
  const expectedPacePercent = (currentDay / totalDaysInMonth) * 100;
  const actualSpentPercent = targetOverallBudget > 0 ? (totalSpent / targetOverallBudget) * 100 : 0;
  const isOverPaced = actualSpentPercent > expectedPacePercent + 10;
  const isSafePaced = actualSpentPercent <= expectedPacePercent;

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setInputMode('percent');
    setBudgetInput(String(cat.monthlyBudget || ''));
    if (targetOverallBudget > 0 && cat.monthlyBudget > 0) {
      setPercentInput(String(Math.round((cat.monthlyBudget / targetOverallBudget) * 100)));
    } else {
      setPercentInput('10');
    }
  };

  const handleSaveBudget = async () => {
    if (!editingCategory) return;
    let finalAmount = 0;
    if (inputMode === 'nominal') {
      finalAmount = parseInt(budgetInput.replace(/[^0-9]/g, ''), 10) || 0;
    } else {
      const p = parseFloat(percentInput.replace(/[^0-9.]/g, '')) || 0;
      finalAmount = Math.round((targetOverallBudget * p) / 100);
    }

    await updateCategoryBudget(editingCategory.id, finalAmount);
    setEditingCategory(null);
  };

  const handleSaveOverallBudget = () => {
    const cleanAmount = parseInt(overallInputStr.replace(/[^0-9]/g, ''), 10) || 0;
    
    // Validasi: Pagu anggaran tidak boleh melebihi saldo dompet yang dipilih
    if (maxAvailableBudget > 0 && cleanAmount > maxAvailableBudget) {
      setOverallBudgetError(
        `Target pagu (${formatRupiah(cleanAmount)}) melebihi saldo tersedia di ${selectedWallet ? selectedWallet.name : 'seluruh dompet'} (${formatRupiah(maxAvailableBudget)}).`
      );
      return;
    }

    setOverallBudgetError('');
    let finalDays = 30;

    if (periodSelectionType === 'dates') {
      const s = new Date(startDateStr);
      const e = new Date(endDateStr);
      if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e >= s) {
        finalDays = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      } else {
        finalDays = parseInt(durationInputDays.replace(/[^0-9]/g, ''), 10) || 30;
      }
    } else {
      finalDays = parseInt(durationInputDays.replace(/[^0-9]/g, ''), 10) || 30;
    }

    setTargetOverallBudget(cleanAmount);
    setBudgetDurationDays(finalDays);
    setDurationInputDays(String(finalDays));
    setIsEditingOverallBudget(false);
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Layar */}
      <Animated.View entering={FadeInDown.duration(300).springify()}>
        <ThemedText style={[styles.screenTitle, { color: colors.text }]}>
          Pagu Anggaran & Laporan
        </ThemedText>
        <ThemedText style={[styles.subText, { color: colors.textSecondary }]}>
          Alokasi batas pengeluaran nominal atau persentase, dilengkapi evaluasi belanja harian.
        </ThemedText>
      </Animated.View>

      {/* 1. KOTAK SARAN & DIAGNOSIS FINANSIAL (MINIMALIS & MODERN) */}
      <Animated.View
        entering={FadeInDown.delay(80).duration(350).springify()}
        style={[
          styles.insightBox,
          {
            backgroundColor: isOverPaced ? colors.expenseBg : colors.backgroundElement,
            borderColor: isOverPaced ? colors.expense : colors.border,
          },
        ]}
      >
        <View style={styles.insightHeaderRow}>
          <View
            style={[
              styles.insightIconBadge,
              { backgroundColor: isOverPaced ? 'rgba(239, 68, 68, 0.15)' : colors.backgroundSelected },
            ]}
          >
            <Ionicons
              name={isOverPaced ? 'alert-circle' : isSafePaced ? 'shield-checkmark-outline' : 'warning-outline'}
              size={18}
              color={isOverPaced ? colors.expense : colors.brandPrimary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText
              style={[
                styles.insightStatusTitle,
                { color: isOverPaced ? colors.expense : colors.text },
              ]}
            >
              {isOverPaced ? 'Pola Belanja Di Atas Batas' : isSafePaced ? 'Ritme Belanja Terkendali' : 'Mendekati Batas Aman'}
            </ThemedText>
            <ThemedText style={[styles.insightDesc, { color: colors.textSecondary }]}>
              {isOverPaced
                ? `Rata-rata ${formatRupiah(dailyAverageSpent)}/hari melebihi batas aman (${formatRupiah(dailySafeSpendLimit)}/hari).`
                : `Rata-rata ${formatRupiah(dailyAverageSpent)}/hari. Batas aman ${formatRupiah(dailySafeSpendLimit)}/hari untuk ${daysRemaining} hari ke depan.`}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* 2. KARTU TARGET PAGU UTAMA & PERIODE (HERO CLEAN & MODERN) */}
      <Animated.View
        entering={FadeInDown.delay(120).duration(350).springify()}
        style={[styles.overviewCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
      >
        <View style={styles.targetCardHeader}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <View style={styles.targetLabelRow}>
              <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>
                TARGET PAGU KESELURUHAN
              </ThemedText>
              <View style={[styles.periodBadge, { backgroundColor: colors.backgroundSelected }]}>
                <Ionicons name="calendar-outline" size={11} color={colors.textSecondary} />
                <ThemedText style={[styles.periodBadgeText, { color: colors.textSecondary }]}>
                  {budgetDurationDays} Hari
                </ThemedText>
              </View>
            </View>

            <ThemedText style={[styles.mainTargetAmount, { color: colors.text }]}>
              {formatRupiah(targetOverallBudget)}
            </ThemedText>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Atur Target Pagu Keseluruhan"
            style={[styles.editOverallBtn, { backgroundColor: colors.brandPrimary }]}
            onPress={() => {
              setOverallInputStr(String(targetOverallBudget));
              setDurationInputDays(String(budgetDurationDays));
              setIsEditingOverallBudget(true);
            }}
          >
            <Ionicons name="options-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <ThemedText style={styles.editOverallBtnText}>Atur Pagu</ThemedText>
          </Pressable>
        </View>

        {/* Progress Alokasi Pagu ke Kategori */}
        <View style={[styles.allocProgressBarBg, { backgroundColor: colors.backgroundSelected }]}>
          <View
            style={[
              styles.allocProgressBarFill,
              {
                width: `${Math.min(100, targetOverallBudget > 0 ? (totalAllocated / targetOverallBudget) * 100 : 0)}%`,
                backgroundColor: totalAllocated > targetOverallBudget ? colors.expense : colors.brandPrimary,
              },
            ]}
          />
        </View>

        <View style={styles.allocSummaryRow}>
          <View>
            <ThemedText style={[styles.allocSummaryLabel, { color: colors.textSecondary }]}>
              Dialokasikan ke Kategori
            </ThemedText>
            <ThemedText style={[styles.allocSummaryVal, { color: colors.text }]}>
              {formatRupiah(totalAllocated)} ({Math.round(targetOverallBudget > 0 ? (totalAllocated / targetOverallBudget) * 100 : 0)}%)
            </ThemedText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <ThemedText style={[styles.allocSummaryLabel, { color: colors.textSecondary }]}>
              Batas Aman Harian
            </ThemedText>
            <ThemedText style={[styles.allocSummaryVal, { color: colors.brandPrimary }]}>
              {formatRupiah(dailySafeSpendLimit)}/hari
            </ThemedText>
          </View>
        </View>

        {/* Sumber Dana Rekening / Dompet - Ringkas & Bersih */}
        <View style={[styles.walletSourceBadgeRow, { borderTopColor: colors.border }]}>
          <View style={styles.walletSourceInfo}>
            <Ionicons name="wallet-outline" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.walletSourceText, { color: colors.textSecondary }]}>
              Sumber Dana:{' '}
              <ThemedText style={[styles.walletSourceBold, { color: colors.text }]}>
                {selectedWallet ? selectedWallet.name : 'Semua Dompet'}
              </ThemedText>
            </ThemedText>
          </View>
          <ThemedText
            style={[
              styles.walletSourceBalance,
              { color: overview.totalBalance >= targetOverallBudget ? colors.brandPrimary : colors.expense },
            ]}
          >
            Tersedia {formatRupiah(maxAvailableBudget)}
          </ThemedText>
        </View>
      </Animated.View>

      {/* 3. DAFTAR KATEGORI & PAGU ANGGARAN (Disatukan, tidak ada duplikasi) */}
      <Animated.View entering={FadeInDown.delay(160).duration(350).springify()}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <ThemedText style={[styles.sectionHeading, { color: colors.text }]}>
              Pagu Kategori Pengeluaran
            </ThemedText>
            <ThemedText style={[styles.sectionSubBadge, { color: colors.textSecondary }]}>
              {expenseCategories.length} Kategori Terdaftar
            </ThemedText>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tambah Kategori Pengeluaran Baru"
            style={[styles.addCategoryBtn, { backgroundColor: colors.backgroundSelected, borderColor: colors.brandPrimary }]}
            onPress={() => setIsAddCategoryModalOpen(true)}
          >
            <Ionicons name="add" size={16} color={colors.brandPrimary} style={{ marginRight: 4 }} />
            <ThemedText style={[styles.addCategoryBtnText, { color: colors.brandPrimary }]}>
              + Kategori
            </ThemedText>
          </Pressable>
        </View>

        {expenseCategories.length === 0 ? (
          <EmptyState
            title="Belum Ada Kategori Belanja"
            description="Tambahkan kategori belanja untuk mengatur alokasi pagu."
          />
        ) : (
          expenseCategories.map((cat) => {
            const bp = budgetProgress.find((b) => b.category.id === cat.id);
            const spent = bp ? bp.spent : 0;
            const allocated = cat.monthlyBudget || 0;
            const remaining = allocated - spent;
            const percentUsed = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
            const isOverBudget = spent > allocated && allocated > 0;
            const pctOfTotalBudget = targetOverallBudget > 0 && allocated > 0
              ? Math.round((allocated / targetOverallBudget) * 100)
              : null;

            return (
              <View
                key={cat.id}
                style={[
                  styles.unifiedCategoryCard,
                  { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                ]}
              >
                <View style={styles.unifiedCardHeader}>
                  <View style={styles.unifiedCategoryInfo}>
                    <View style={[styles.catIconCircle, { backgroundColor: cat.color || colors.brandPrimary }]}>
                      <Ionicons
                        name={(cat.icon || 'cart-outline') as any}
                        size={17}
                        color="#FFFFFF"
                      />
                    </View>
                    <View style={{ flex: 1, paddingRight: 6 }}>
                      <ThemedText style={[styles.unifiedCatName, { color: colors.text }]} numberOfLines={1}>
                        {cat.name}
                      </ThemedText>
                      <ThemedText style={[styles.unifiedCatBudgetSub, { color: colors.textSecondary }]}>
                        {allocated > 0
                          ? `Pagu: ${formatRupiah(allocated)} ${pctOfTotalBudget ? `(${pctOfTotalBudget}%)` : ''}`
                          : 'Belum dialokasikan pagu'}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.unifiedActionGroup}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Ubah detail kategori ${cat.name}`}
                      style={[styles.btnOutlineAction, { borderColor: colors.border }]}
                      onPress={() => setEditingCategoryDetail(cat)}
                    >
                      <Ionicons name="create-outline" size={13} color={colors.textSecondary} style={{ marginRight: 2 }} />
                      <ThemedText style={[styles.btnOutlineText, { color: colors.textSecondary }]}>
                        Ubah
                      </ThemedText>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Atur pagu ${cat.name}`}
                      style={[styles.btnPrimaryAction, { backgroundColor: colors.brandPrimary }]}
                      onPress={() => handleOpenEdit(cat)}
                    >
                      <Ionicons name="pie-chart-outline" size={13} color="#FFFFFF" style={{ marginRight: 3 }} />
                      <ThemedText style={styles.btnPrimaryText}>
                        {allocated > 0 ? 'Pagu' : 'Atur'}
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>

                {/* Progress bar jika pagu aktif */}
                {allocated > 0 && (
                  <View style={[styles.unifiedProgressSection, { borderTopColor: colors.border }]}>
                    <View style={[styles.track, { backgroundColor: colors.backgroundSelected }]}>
                      <View
                        style={[
                          styles.fill,
                          {
                            width: `${Math.min(percentUsed, 100)}%`,
                            backgroundColor: isOverBudget ? colors.expense : colors.brandAccent,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.unifiedCardFooter}>
                      <ThemedText
                        style={[
                          styles.unifiedStatusText,
                          { color: isOverBudget ? colors.expense : colors.textSecondary },
                        ]}
                      >
                        {isOverBudget
                          ? `Melebihi ${formatRupiah(Math.abs(remaining))}`
                          : `Terpakai ${formatRupiah(spent)} (Sisa ${formatRupiah(remaining)})`}
                      </ThemedText>
                      <ThemedText style={[styles.unifiedPercentText, { color: colors.text }]}>
                        {percentUsed}%
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </Animated.View>

      {/* MODAL ATUR PAGU: PILIHAN NOMINAL ATAU PERSEN (STICKY ACTION FOOTER) */}
      <Modal visible={Boolean(editingCategory)} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.backdropPressable} onPress={() => setEditingCategory(null)} />
          <View
            style={[
              styles.bottomSheetContainer,
              {
                backgroundColor: colors.backgroundElement,
                paddingBottom: Math.max(16, insets.bottom + 10),
              },
            ]}
          >
            {/* Sheet Handle */}
            <View style={styles.sheetHandleBar}>
              <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            </View>

            {/* Sheet Header */}
            <View style={styles.modalHeaderRow}>
              <View>
                <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                  Atur Pagu Kategori
                </ThemedText>
                <ThemedText style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Kategori: {editingCategory?.name}
                </ThemedText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tutup Modal"
                onPress={() => setEditingCategory(null)}
                style={styles.closeIconBtn}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Scrollable Form Body */}
            <ScrollView
              style={styles.modalScrollBody}
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Selector Metode Alokasi: Nominal Uang vs Persentase */}
              <View style={[styles.inputModeWrapper, { backgroundColor: colors.backgroundSelected, borderColor: colors.border }]}>
                <Pressable
                  accessibilityRole="button"
                  style={[
                    styles.modeBtn,
                    inputMode === 'nominal' && { backgroundColor: colors.backgroundElement },
                  ]}
                  onPress={() => setInputMode('nominal')}
                >
                  <ThemedText
                    style={[
                      styles.modeBtnText,
                      { color: inputMode === 'nominal' ? colors.brandPrimary : colors.textSecondary, fontWeight: inputMode === 'nominal' ? '700' : '500' },
                    ]}
                  >
                    Nominal Tetap (Rp)
                  </ThemedText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  style={[
                    styles.modeBtn,
                    inputMode === 'percent' && { backgroundColor: colors.backgroundElement },
                  ]}
                  onPress={() => setInputMode('percent')}
                >
                  <ThemedText
                    style={[
                      styles.modeBtnText,
                      { color: inputMode === 'percent' ? colors.brandPrimary : colors.textSecondary, fontWeight: inputMode === 'percent' ? '700' : '500' },
                    ]}
                  >
                    Persentase (%)
                  </ThemedText>
                </Pressable>
              </View>

              {inputMode === 'nominal' ? (
                <View>
                  <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    Batas Maksimal Bulanan (Rp)
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
                    placeholder="Contoh: 500000"
                    placeholderTextColor={colors.textSecondary}
                    value={budgetInput}
                    onChangeText={(val) => {
                      setBudgetInput(val);
                      if (targetOverallBudget > 0) {
                        const num = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
                        setPercentInput(String(Math.round((num / targetOverallBudget) * 100)));
                      }
                    }}
                  />
                  <ThemedText style={[styles.calcHint, { color: colors.textSecondary }]}>
                    Alokasi: {targetOverallBudget > 0 ? Math.round(((parseInt(budgetInput.replace(/[^0-9]/g, ''), 10) || 0) / targetOverallBudget) * 100) : 0}% dari total pagu
                  </ThemedText>
                </View>
              ) : (
                <View>
                  <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    Persen dari Target Pagu ({formatRupiah(targetOverallBudget)})
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
                    placeholder="Contoh: 15"
                    placeholderTextColor={colors.textSecondary}
                    value={percentInput}
                    onChangeText={setPercentInput}
                  />
                  <ThemedText style={[styles.calcHint, { color: colors.textSecondary }]}>
                    Estimasi nominal: {formatRupiah(Math.round((targetOverallBudget * (parseFloat(percentInput) || 0)) / 100))}
                  </ThemedText>
                </View>
              )}

              {/* Quick Preset Buttons */}
              <View style={styles.presetRow}>
                {inputMode === 'nominal' ? (
                  <>
                    <Pressable style={[styles.presetChip, { borderColor: colors.border }]} onPress={() => setBudgetInput('250000')}>
                      <ThemedText style={[styles.presetText, { color: colors.text }]}>250rb</ThemedText>
                    </Pressable>
                    <Pressable style={[styles.presetChip, { borderColor: colors.border }]} onPress={() => setBudgetInput('500000')}>
                      <ThemedText style={[styles.presetText, { color: colors.text }]}>500rb</ThemedText>
                    </Pressable>
                    <Pressable style={[styles.presetChip, { borderColor: colors.border }]} onPress={() => setBudgetInput('1000000')}>
                      <ThemedText style={[styles.presetText, { color: colors.text }]}>1 Jt</ThemedText>
                    </Pressable>
                    <Pressable style={[styles.presetChip, { borderColor: colors.border }]} onPress={() => setBudgetInput('2000000')}>
                      <ThemedText style={[styles.presetText, { color: colors.text }]}>2 Jt</ThemedText>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Pressable style={[styles.presetChip, { borderColor: colors.border }]} onPress={() => setPercentInput('5')}>
                      <ThemedText style={[styles.presetText, { color: colors.text }]}>5%</ThemedText>
                    </Pressable>
                    <Pressable style={[styles.presetChip, { borderColor: colors.border }]} onPress={() => setPercentInput('10')}>
                      <ThemedText style={[styles.presetText, { color: colors.text }]}>10%</ThemedText>
                    </Pressable>
                    <Pressable style={[styles.presetChip, { borderColor: colors.border }]} onPress={() => setPercentInput('20')}>
                      <ThemedText style={[styles.presetText, { color: colors.text }]}>20%</ThemedText>
                    </Pressable>
                    <Pressable style={[styles.presetChip, { borderColor: colors.border }]} onPress={() => setPercentInput('30')}>
                      <ThemedText style={[styles.presetText, { color: colors.text }]}>30%</ThemedText>
                    </Pressable>
                  </>
                )}
              </View>
            </ScrollView>

            {/* STICKY ACTION FOOTER (Selalu tampak di bawah tanpa perlu scroll) */}
            <View style={[styles.stickyFooter, { borderTopColor: colors.border }]}>
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

      {/* MODAL ATUR TARGET PAGU UTAMA & PERIODE WAKTU (STICKY ACTION FOOTER) */}
      <Modal visible={isEditingOverallBudget} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.backdropPressable} onPress={() => setIsEditingOverallBudget(false)} />
          <View
            style={[
              styles.bottomSheetContainer,
              {
                backgroundColor: colors.backgroundElement,
                paddingBottom: Math.max(16, insets.bottom + 10),
              },
            ]}
          >
            {/* Sheet Handle */}
            <View style={styles.sheetHandleBar}>
              <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            </View>

            {/* Sheet Header */}
            <View style={styles.modalHeaderRow}>
              <View>
                <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                  Atur Target Pagu
                </ThemedText>
                <ThemedText style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  Tentukan nominal & periode pemakaian
                </ThemedText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tutup Modal"
                onPress={() => setIsEditingOverallBudget(false)}
                style={styles.closeIconBtn}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Scrollable Form Body */}
            <ScrollView
              style={styles.modalScrollBody}
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {/* PILIH SUMBER DANA / DOMPET UNTUK PAGU */}
              <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Sumber Dana (Dompet / Rekening)
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                <Pressable
                  style={[
                    styles.walletSelectChip,
                    {
                      backgroundColor: selectedWalletId === 'all' ? colors.brandPrimary : colors.backgroundSelected,
                      borderColor: selectedWalletId === 'all' ? colors.brandPrimary : colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedWalletId('all');
                    setOverallBudgetError('');
                  }}
                >
                  <Ionicons
                    name="wallet-outline"
                    size={14}
                    color={selectedWalletId === 'all' ? '#FFFFFF' : colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <ThemedText style={[styles.presetText, { color: selectedWalletId === 'all' ? '#FFFFFF' : colors.text, fontWeight: selectedWalletId === 'all' ? '700' : '500' }]}>
                    Semua Dompet ({formatRupiah(overview.totalBalance)})
                  </ThemedText>
                </Pressable>

                {activeWallets.map((w) => {
                  const isSelected = selectedWalletId === w.id;
                  return (
                    <Pressable
                      key={w.id}
                      style={[
                        styles.walletSelectChip,
                        {
                          backgroundColor: isSelected ? colors.brandPrimary : colors.backgroundSelected,
                          borderColor: isSelected ? colors.brandPrimary : colors.border,
                        },
                      ]}
                      onPress={() => {
                        setSelectedWalletId(w.id);
                        setOverallBudgetError('');
                        if (w.balance < parseInt(overallInputStr || '0', 10)) {
                          setOverallInputStr(String(w.balance));
                        }
                      }}
                    >
                      <View
                        style={[
                          styles.walletDot,
                          { backgroundColor: isSelected ? '#FFFFFF' : (w.color || colors.brandPrimary) },
                        ]}
                      />
                      <ThemedText style={[styles.presetText, { color: isSelected ? '#FFFFFF' : colors.text, fontWeight: isSelected ? '700' : '500' }]}>
                        {w.name} ({formatRupiah(w.balance)})
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Total Anggaran Pagu (Rp)
                </ThemedText>
                <ThemedText style={{ fontSize: 11, color: colors.brandPrimary, fontWeight: '600' }}>
                  Maksimal: {formatRupiah(maxAvailableBudget)}
                </ThemedText>
              </View>
              <TextInput
                style={[
                  styles.modalInput,
                  { color: colors.text, backgroundColor: colors.backgroundSelected, borderColor: colors.border },
                ]}
                keyboardType="numeric"
                placeholder="Contoh: 3000000"
                placeholderTextColor={colors.textSecondary}
                value={overallInputStr}
                onChangeText={(txt) => {
                  setOverallInputStr(txt);
                  setOverallBudgetError('');
                }}
              />

              {overallBudgetError ? (
                <ThemedText style={{ fontSize: 12, color: colors.expense, marginBottom: 10, lineHeight: 16 }}>
                  ⚠️ {overallBudgetError}
                </ThemedText>
              ) : null}

              {/* Quick Preset Nominal Sesuai Saldo Tersedia */}
              <View style={[styles.presetRow, { marginBottom: 16 }]}>
                {[
                  { label: '25%', ratio: 0.25 },
                  { label: '50%', ratio: 0.5 },
                  { label: '75%', ratio: 0.75 },
                  { label: '100% (Maks)', ratio: 1.0 },
                ].map((p, idx) => (
                  <Pressable
                    key={idx}
                    style={[styles.presetChip, { borderColor: colors.border }]}
                    onPress={() => {
                      const amt = Math.round(maxAvailableBudget * p.ratio);
                      setOverallInputStr(String(amt));
                      setOverallBudgetError('');
                    }}
                  >
                    <ThemedText style={[styles.presetText, { color: colors.text }]}>
                      {p.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              {/* Pemilihan Metode Periode: Jumlah Hari vs Rentang Tanggal (Date Picker) */}
              <View style={[styles.inputModeWrapper, { backgroundColor: colors.backgroundSelected, borderColor: colors.border, marginBottom: 12 }]}>
                <Pressable
                  accessibilityRole="button"
                  style={[
                    styles.modeBtn,
                    periodSelectionType === 'days' && { backgroundColor: colors.backgroundElement },
                  ]}
                  onPress={() => setPeriodSelectionType('days')}
                >
                  <ThemedText
                    style={[
                      styles.modeBtnText,
                      { color: periodSelectionType === 'days' ? colors.brandPrimary : colors.textSecondary, fontWeight: periodSelectionType === 'days' ? '700' : '500' },
                    ]}
                  >
                    Hitungan Hari
                  </ThemedText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  style={[
                    styles.modeBtn,
                    periodSelectionType === 'dates' && { backgroundColor: colors.backgroundElement },
                  ]}
                  onPress={() => setPeriodSelectionType('dates')}
                >
                  <ThemedText
                    style={[
                      styles.modeBtnText,
                      { color: periodSelectionType === 'dates' ? colors.brandPrimary : colors.textSecondary, fontWeight: periodSelectionType === 'dates' ? '700' : '500' },
                    ]}
                  >
                    Rentang Kalender
                  </ThemedText>
                </Pressable>
              </View>

              {periodSelectionType === 'days' ? (
                <>
                  <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    Periode Waktu (Hari)
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.modalInput,
                      { color: colors.text, backgroundColor: colors.backgroundSelected, borderColor: colors.border },
                    ]}
                    keyboardType="numeric"
                    placeholder="Contoh: 30"
                    placeholderTextColor={colors.textSecondary}
                    value={durationInputDays}
                    onChangeText={setDurationInputDays}
                  />

                  {/* Quick Preset Hari / Bulan */}
                  <View style={styles.presetRow}>
                    {[
                      { label: '7 Hari', days: '7' },
                      { label: '14 Hari', days: '14' },
                      { label: '30 Hari', days: '30' },
                    ].map((p) => (
                      <Pressable
                        key={p.days}
                        style={[styles.presetChip, { borderColor: colors.border }]}
                        onPress={() => setDurationInputDays(p.days)}
                      >
                        <ThemedText style={[styles.presetText, { color: colors.text }]}>{p.label}</ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : (
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                        Tanggal Mulai
                      </ThemedText>
                      {Platform.OS === 'web' ? (
                        <input
                          type="date"
                          value={startDateStr}
                          onChange={(e) => setStartDateStr(e.target.value)}
                          style={{
                            height: 44,
                            padding: '0 12px',
                            borderRadius: 10,
                            border: `1px solid ${colors.border}`,
                            backgroundColor: colors.backgroundSelected,
                            color: colors.text,
                            fontSize: 14,
                          }}
                        />
                      ) : (
                        <TextInput
                          style={[
                            styles.modalInput,
                            { color: colors.text, backgroundColor: colors.backgroundSelected, borderColor: colors.border },
                          ]}
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor={colors.textSecondary}
                          value={startDateStr}
                          onChangeText={setStartDateStr}
                        />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                        Tanggal Selesai
                      </ThemedText>
                      {Platform.OS === 'web' ? (
                        <input
                          type="date"
                          value={endDateStr}
                          onChange={(e) => setEndDateStr(e.target.value)}
                          style={{
                            height: 44,
                            padding: '0 12px',
                            borderRadius: 10,
                            border: `1px solid ${colors.border}`,
                            backgroundColor: colors.backgroundSelected,
                            color: colors.text,
                            fontSize: 14,
                          }}
                        />
                      ) : (
                        <TextInput
                          style={[
                            styles.modalInput,
                            { color: colors.text, backgroundColor: colors.backgroundSelected, borderColor: colors.border },
                          ]}
                          placeholder="YYYY-MM-DD"
                          placeholderTextColor={colors.textSecondary}
                          value={endDateStr}
                          onChangeText={setEndDateStr}
                        />
                      )}
                    </View>
                  </View>

                  {/* Quick Date Presets */}
                  <View style={[styles.presetRow, { marginTop: 10 }]}>
                    {[
                      {
                        label: 'Bulan Ini',
                        fn: () => {
                          const d = new Date();
                          const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
                          const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
                          const e = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
                          setStartDateStr(s);
                          setEndDateStr(e);
                        },
                      },
                      {
                        label: 'Gajian (25-25)',
                        fn: () => {
                          const d = new Date();
                          const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-25`;
                          const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 25);
                          const e = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-25`;
                          setStartDateStr(s);
                          setEndDateStr(e);
                        },
                      },
                      {
                        label: '30 Hari Depan',
                        fn: () => {
                          const d = new Date();
                          const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                          const next30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                          const e = `${next30.getFullYear()}-${String(next30.getMonth() + 1).padStart(2, '0')}-${String(next30.getDate()).padStart(2, '0')}`;
                          setStartDateStr(s);
                          setEndDateStr(e);
                        },
                      },
                    ].map((p, idx) => (
                      <Pressable
                        key={idx}
                        style={[styles.presetChip, { borderColor: colors.border }]}
                        onPress={p.fn}
                      >
                        <ThemedText style={[styles.presetText, { color: colors.text }]}>{p.label}</ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* STICKY ACTION FOOTER (Selalu tampil di bawah, tidak perlu scroll) */}
            <View style={[styles.stickyFooter, { borderTopColor: colors.border }]}>
              <Pressable
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setIsEditingOverallBudget(false)}
              >
                <ThemedText style={[styles.btnText, { color: colors.text }]}>Batal</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.saveBtn, { backgroundColor: colors.brandPrimary }]}
                onPress={handleSaveOverallBudget}
              >
                <ThemedText style={[styles.btnText, { color: '#FFFFFF' }]}>
                  Terapkan Target
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL UBAH DETAIL KATEGORI (NAMA, WARNA, IKON & HAPUS) */}
      <EditCategoryModal
        visible={Boolean(editingCategoryDetail)}
        category={editingCategoryDetail}
        onSave={async (id, updates) => {
          await updateCategory(id, updates);
        }}
        onDelete={async (id) => {
          await deleteCategory(id);
        }}
        onClose={() => setEditingCategoryDetail(null)}
      />

      {/* MODAL TAMBAH KATEGORI PENGELUARAN BARU */}
      <CategoryPickerModal
        visible={isAddCategoryModalOpen}
        type="expense"
        categories={categories}
        onSelectCategory={() => {
          setIsAddCategoryModalOpen(false);
        }}
        onAddCategory={async (newCat) => {
          await addCategory({
            ...newCat,
            monthlyBudget: 0,
          });
          setIsAddCategoryModalOpen(false);
        }}
        onClose={() => setIsAddCategoryModalOpen(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subText: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  insightBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  insightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  insightIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightStatusTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  insightDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  overviewCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18,
  },
  targetLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  periodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  periodBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  walletSourceBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  walletSourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  walletSourceText: {
    fontSize: 11,
  },
  walletSourceBold: {
    fontWeight: '700',
  },
  walletSourceBalance: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  // Bottom Sheet Container & Sticky Footer Styles
  bottomSheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sheetHandleBar: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  modalScrollBody: {
    maxHeight: 380,
  },
  stickyFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  closeIconBtn: {
    padding: 4,
  },
  walletSelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
  },
  walletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
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
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  inputModeWrapper: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeBtnText: {
    fontSize: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
    marginBottom: 8,
  },
  calcHint: {
    fontSize: 12,
    marginBottom: 10,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  targetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mainTargetAmount: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginVertical: 2,
    fontVariant: ['tabular-nums'],
  },
  editOverallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editOverallBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  allocProgressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  allocProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  allocSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  allocSummaryLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  allocSummaryVal: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionSubBadge: {
    fontSize: 12,
    marginTop: 2,
  },
  addCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  addCategoryBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  unifiedCategoryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  unifiedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unifiedCategoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 6,
  },
  catIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unifiedCatName: {
    fontSize: 14,
    fontWeight: '700',
  },
  unifiedCatBudgetSub: {
    fontSize: 11,
    marginTop: 2,
  },
  unifiedActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btnOutlineAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
  },
  btnOutlineText: {
    fontSize: 11,
    fontWeight: '600',
  },
  btnPrimaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  unifiedProgressSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  track: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  unifiedCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unifiedStatusText: {
    fontSize: 11,
  },
  unifiedPercentText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
