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
import { Ionicons } from '@expo/vector-icons';
import { ConfirmationModal } from '@/components/money/confirmation-modal';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/theme-context';
import { useMoneyData } from '@/hooks/use-money-data';
import { Debt, SavingGoal } from '@/types/money';
import { formatRupiah } from '@/utils/format';

export function SavingsDebtsTab() {
  const { colors } = useAppTheme();

  const {
    savingGoals,
    debts,
    addSavingGoal,
    updateSavingGoalProgress,
    deleteSavingGoal,
    addDebt,
    settleDebt,
    deleteDebt,
  } = useMoneyData();

  const [segment, setSegment] = useState<'savings' | 'debts'>('savings');
  const [debtSubFilter, setDebtSubFilter] = useState<'all' | 'receivable' | 'debt'>('all');

  // Modal State Tabungan
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTargetStr, setGoalTargetStr] = useState('');
  const [goalCurrentStr, setGoalCurrentStr] = useState('');

  // Modal State Hutang
  const [isAddDebtModalOpen, setIsAddDebtModalOpen] = useState(false);
  const [debtPerson, setDebtPerson] = useState('');
  const [debtAmountStr, setDebtAmountStr] = useState('');
  const [debtType, setDebtType] = useState<'debt' | 'receivable'>('receivable');
  const [debtNote, setDebtNote] = useState('');

  // Konfirmasi Hapus
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [debtToDelete, setDebtToDelete] = useState<string | null>(null);

  const totalSaved = savingGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = savingGoals.reduce((s, g) => s + g.targetAmount, 0);

  const totalReceivable = debts
    .filter((d) => d.type === 'receivable' && !d.isSettled)
    .reduce((s, d) => s + d.remainingAmount, 0);

  const totalPayable = debts
    .filter((d) => d.type === 'debt' && !d.isSettled)
    .reduce((s, d) => s + d.remainingAmount, 0);

  const filteredDebts = debts.filter((d) => {
    if (debtSubFilter === 'all') return true;
    return d.type === debtSubFilter;
  });

  const handleSaveGoal = async () => {
    const cleanTarget = parseInt(goalTargetStr.replace(/[^0-9]/g, ''), 10);
    const cleanCurrent = parseInt(goalCurrentStr.replace(/[^0-9]/g, ''), 10) || 0;
    if (!goalName.trim() || !cleanTarget || cleanTarget <= 0) return;

    await addSavingGoal({
      name: goalName.trim(),
      targetAmount: cleanTarget,
      currentAmount: cleanCurrent,
      color: '#10B981',
      icon: 'shield-checkmark',
    });

    setGoalName('');
    setGoalTargetStr('');
    setGoalCurrentStr('');
    setIsAddGoalModalOpen(false);
  };

  const handleSaveDebt = async () => {
    const cleanAmount = parseInt(debtAmountStr.replace(/[^0-9]/g, ''), 10);
    if (!debtPerson.trim() || !cleanAmount || cleanAmount <= 0) return;

    await addDebt({
      personName: debtPerson.trim(),
      amount: cleanAmount,
      remainingAmount: cleanAmount,
      type: debtType,
      note: debtNote.trim() || undefined,
      isSettled: false,
    });

    setDebtPerson('');
    setDebtAmountStr('');
    setDebtNote('');
    setIsAddDebtModalOpen(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Header & Segment Selector */}
      <View style={[styles.headerContainer, { borderBottomColor: colors.border, backgroundColor: colors.backgroundElement }]}>
        <View style={styles.headerTitleRow}>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>
            Tabungan & Catatan Hutang
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={segment === 'savings' ? 'Tambah Target Tabungan' : 'Tambah Catatan Hutang'}
            style={[styles.addNewButton, { backgroundColor: colors.brandPrimary }]}
            onPress={() => {
              if (segment === 'savings') setIsAddGoalModalOpen(true);
              else setIsAddDebtModalOpen(true);
            }}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <ThemedText style={styles.addNewButtonText}>
              {segment === 'savings' ? 'Target Baru' : 'Catat Hutang'}
            </ThemedText>
          </Pressable>
        </View>

        {/* Tab Segment Selector */}
        <View style={[styles.segmentWrapper, { backgroundColor: colors.backgroundSelected, borderColor: colors.border }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tampilkan Tabungan Impian"
            style={[
              styles.segmentBtn,
              segment === 'savings' && { backgroundColor: colors.backgroundElement, elevation: 2 },
            ]}
            onPress={() => setSegment('savings')}
          >
            <Ionicons
              name={segment === 'savings' ? 'wallet' : 'wallet-outline'}
              size={16}
              color={segment === 'savings' ? colors.brandPrimary : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <ThemedText
              style={[
                styles.segmentText,
                { color: segment === 'savings' ? colors.brandPrimary : colors.textSecondary, fontWeight: segment === 'savings' ? '700' : '500' },
              ]}
            >
              Tabungan Impian ({savingGoals.length})
            </ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tampilkan Buku Hutang & Piutang"
            style={[
              styles.segmentBtn,
              segment === 'debts' && { backgroundColor: colors.backgroundElement, elevation: 2 },
            ]}
            onPress={() => setSegment('debts')}
          >
            <Ionicons
              name={segment === 'debts' ? 'people' : 'people-outline'}
              size={16}
              color={segment === 'debts' ? colors.brandPrimary : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <ThemedText
              style={[
                styles.segmentText,
                { color: segment === 'debts' ? colors.brandPrimary : colors.textSecondary, fontWeight: segment === 'debts' ? '700' : '500' },
              ]}
            >
              Buku Hutang ({debts.filter((d) => !d.isSettled).length})
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
        {segment === 'savings' ? (
          <>
            {/* Summary Banner Tabungan (Dynamic Hero) */}
            <Animated.View entering={FadeInDown.duration(300)} style={[styles.summaryCard, { backgroundColor: colors.heroBg }]}>
              <View style={styles.summaryLabelRow}>
                <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>TOTAL DANA DITABUNG</ThemedText>
                <ThemedText style={[styles.summaryPercent, { color: colors.heroAccent }]}>
                  {totalTarget > 0 ? `${Math.round((totalSaved / totalTarget) * 100)}% Tercapai` : '0%'}
                </ThemedText>
              </View>
              <ThemedText style={[styles.summaryAmount, { color: colors.heroText }]}>{formatRupiah(totalSaved)}</ThemedText>
              <ThemedText style={[styles.summarySub, { color: colors.textSecondary }]}>
                Dari total target {formatRupiah(totalTarget)} di {savingGoals.length} pos impian
              </ThemedText>
            </Animated.View>

            {/* List Target Tabungan */}
            {savingGoals.map((goal: SavingGoal, index: number) => {
              const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) || 0;
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

              return (
                <Animated.View
                  key={goal.id}
                  entering={FadeInDown.delay(index * 50).duration(250)}
                  style={[styles.itemCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
                >
                  <View style={styles.goalHeaderRow}>
                    <View style={styles.goalNameGroup}>
                      <View style={[styles.goalIconBadge, { backgroundColor: colors.backgroundSelected }]}>
                        <Ionicons name="flag-outline" size={18} color={colors.brandPrimary} />
                      </View>
                      <View>
                        <ThemedText style={[styles.goalName, { color: colors.text }]}>{goal.name}</ThemedText>
                        <ThemedText style={[styles.goalSubtitle, { color: colors.textSecondary }]}>
                          Sisa kumpul: {formatRupiah(remaining)}
                        </ThemedText>
                      </View>
                    </View>
                    <ThemedText style={[styles.goalPercentBadge, { color: colors.brandPrimary }]}>
                      {progress}%
                    </ThemedText>
                  </View>

                  {/* Progress Bar Visual */}
                  <View style={[styles.progressBarTrack, { backgroundColor: colors.backgroundSelected }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${progress}%`,
                          backgroundColor: progress >= 100 ? colors.income : colors.brandPrimary,
                        },
                      ]}
                    />
                  </View>

                  {/* Nominal and Quick Actions */}
                  <View style={styles.goalFooterRow}>
                    <ThemedText style={[styles.goalAmounts, { color: colors.text }]}>
                      {formatRupiah(goal.currentAmount)}{' '}
                      <ThemedText style={{ color: colors.textSecondary, fontSize: 12 }}>
                        / {formatRupiah(goal.targetAmount)}
                      </ThemedText>
                    </ThemedText>

                    <View style={styles.goalBtnGroup}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Tambah saldo ${goal.name}`}
                        style={[styles.miniActionBtn, { backgroundColor: colors.backgroundSelected, borderColor: colors.border }]}
                        onPress={() => updateSavingGoalProgress(goal.id, 100000)}
                      >
                        <Ionicons name="add" size={14} color={colors.text} />
                        <ThemedText style={[styles.miniActionText, { color: colors.text }]}>+100rb</ThemedText>
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Hapus ${goal.name}`}
                        style={[styles.miniIconBtn, { borderColor: colors.border }]}
                        onPress={() => setGoalToDelete(goal.id)}
                      >
                        <Ionicons name="trash-outline" size={14} color={colors.textSecondary} />
                      </Pressable>
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </>
        ) : (
          <>
            {/* Ringkasan Buku Hutang & Piutang */}
            <View style={styles.debtOverviewRow}>
              <View style={[styles.debtSummaryCol, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <View style={styles.debtIconRow}>
                  <Ionicons name="arrow-down-circle-outline" size={18} color={colors.income} />
                  <ThemedText style={[styles.debtSummaryLabel, { color: colors.textSecondary }]}>Piutang Teman</ThemedText>
                </View>
                <ThemedText style={[styles.debtSummaryVal, { color: colors.income }]}>
                  {formatRupiah(totalReceivable)}
                </ThemedText>
                <ThemedText style={[styles.debtSummaryNote, { color: colors.textSecondary }]}>
                  Uang yang dipinjam orang
                </ThemedText>
              </View>

              <View style={[styles.debtSummaryCol, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <View style={styles.debtIconRow}>
                  <Ionicons name="arrow-up-circle-outline" size={18} color={colors.expense} />
                  <ThemedText style={[styles.debtSummaryLabel, { color: colors.textSecondary }]}>Hutang Saya</ThemedText>
                </View>
                <ThemedText style={[styles.debtSummaryVal, { color: colors.expense }]}>
                  {formatRupiah(totalPayable)}
                </ThemedText>
                <ThemedText style={[styles.debtSummaryNote, { color: colors.textSecondary }]}>
                  Wajib dibayarkan
                </ThemedText>
              </View>
            </View>

            {/* Filter Sub: Semua / Piutang / Hutang */}
            <View style={styles.subFilterRow}>
              {(['all', 'receivable', 'debt'] as const).map((f) => (
                <Pressable
                  key={f}
                  accessibilityRole="button"
                  style={[
                    styles.subFilterChip,
                    {
                      borderColor: debtSubFilter === f ? colors.brandPrimary : colors.border,
                      backgroundColor: debtSubFilter === f ? colors.backgroundSelected : 'transparent',
                    },
                  ]}
                  onPress={() => setDebtSubFilter(f)}
                >
                  <ThemedText
                    style={[
                      styles.subFilterText,
                      { color: debtSubFilter === f ? colors.brandPrimary : colors.textSecondary },
                    ]}
                  >
                    {f === 'all' ? 'Semua Catatan' : f === 'receivable' ? 'Piutang Teman' : 'Hutang Saya'}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {/* List Buku Hutang */}
            {filteredDebts.map((d: Debt, idx: number) => {
              const isReceivable = d.type === 'receivable';

              return (
                <Animated.View
                  key={d.id}
                  entering={FadeInDown.delay(idx * 40).duration(250)}
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: colors.border,
                      opacity: d.isSettled ? 0.6 : 1,
                    },
                  ]}
                >
                  <View style={styles.debtCardHeader}>
                    <View style={styles.debtPersonRow}>
                      <View
                        style={[
                          styles.debtTagBadge,
                          { backgroundColor: isReceivable ? colors.incomeBg : colors.expenseBg },
                        ]}
                      >
                        <Ionicons
                          name={isReceivable ? 'arrow-down' : 'arrow-up'}
                          size={12}
                          color={isReceivable ? colors.income : colors.expense}
                        />
                        <ThemedText
                          style={[
                            styles.debtTagText,
                            { color: isReceivable ? colors.income : colors.expense },
                          ]}
                        >
                          {isReceivable ? 'Piutang' : 'Hutang'}
                        </ThemedText>
                      </View>
                      <ThemedText style={[styles.debtPersonName, { color: colors.text }]}>
                        {d.personName}
                      </ThemedText>
                    </View>

                    <ThemedText style={[styles.debtAmountMain, { color: colors.text }]}>
                      {formatRupiah(d.amount)}
                    </ThemedText>
                  </View>

                  {d.note ? (
                    <ThemedText style={[styles.debtNoteText, { color: colors.textSecondary }]}>
                      {d.note}
                    </ThemedText>
                  ) : null}

                  <View style={styles.debtActionsRow}>
                    <View style={styles.debtStatusIndicator}>
                      <Ionicons
                        name={d.isSettled ? 'checkmark-circle' : 'time-outline'}
                        size={14}
                        color={d.isSettled ? colors.income : colors.textSecondary}
                        style={{ marginRight: 4 }}
                      />
                      <ThemedText
                        style={[
                          styles.debtStatusText,
                          { color: d.isSettled ? colors.income : colors.textSecondary },
                        ]}
                      >
                        {d.isSettled ? 'Lunas Selesai' : 'Belum Dilunasi'}
                      </ThemedText>
                    </View>

                    <View style={styles.debtBtnActions}>
                      {!d.isSettled && (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Tandai Lunas"
                          style={[styles.settleBtn, { backgroundColor: colors.brandPrimary }]}
                          onPress={() => settleDebt(d.id)}
                        >
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                          <ThemedText style={styles.settleBtnText}>Tandai Lunas</ThemedText>
                        </Pressable>
                      )}

                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Hapus catatan hutang"
                        style={[styles.miniIconBtn, { borderColor: colors.border }]}
                        onPress={() => setDebtToDelete(d.id)}
                      >
                        <Ionicons name="trash-outline" size={14} color={colors.textSecondary} />
                      </Pressable>
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* MODAL TAMBAH TARGET TABUNGAN */}
      <Modal visible={isAddGoalModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: colors.backgroundElement }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                Target Tabungan Baru
              </ThemedText>
              <Pressable onPress={() => setIsAddGoalModalOpen(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Nama Impian / Tujuan</ThemedText>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.backgroundSelected, color: colors.text, borderColor: colors.border }]}
              placeholder="Contoh: Beli Sepeda Motor, Liburan"
              placeholderTextColor={colors.textSecondary}
              value={goalName}
              onChangeText={setGoalName}
            />

            <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Target Dana (Rp)</ThemedText>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.backgroundSelected, color: colors.text, borderColor: colors.border }]}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={goalTargetStr}
              onChangeText={setGoalTargetStr}
            />

            <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Saldo Terkumpul Awal (Opsional)</ThemedText>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.backgroundSelected, color: colors.text, borderColor: colors.border }]}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={goalCurrentStr}
              onChangeText={setGoalCurrentStr}
            />

            <Pressable
              accessibilityRole="button"
              style={[styles.modalSubmitBtn, { backgroundColor: colors.brandPrimary }]}
              onPress={handleSaveGoal}
            >
              <ThemedText style={styles.modalSubmitText}>Simpan Target Impian</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL CATAT HUTANG / PIUTANG */}
      <Modal visible={isAddDebtModalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: colors.backgroundElement }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                Catat Hutang / Piutang
              </ThemedText>
              <Pressable onPress={() => setIsAddDebtModalOpen(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Toggle Tipe: Piutang vs Hutang */}
            <View style={[styles.segmentWrapper, { backgroundColor: colors.backgroundSelected, borderColor: colors.border, marginBottom: 12 }]}>
              <Pressable
                style={[
                  styles.segmentBtn,
                  debtType === 'receivable' && { backgroundColor: colors.backgroundElement },
                ]}
                onPress={() => setDebtType('receivable')}
              >
                <ThemedText
                  style={[
                    styles.segmentText,
                    { color: debtType === 'receivable' ? colors.income : colors.textSecondary, fontWeight: debtType === 'receivable' ? '700' : '500' },
                  ]}
                >
                  Piutang (Teman Pinjam)
                </ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.segmentBtn,
                  debtType === 'debt' && { backgroundColor: colors.backgroundElement },
                ]}
                onPress={() => setDebtType('debt')}
              >
                <ThemedText
                  style={[
                    styles.segmentText,
                    { color: debtType === 'debt' ? colors.expense : colors.textSecondary, fontWeight: debtType === 'debt' ? '700' : '500' },
                  ]}
                >
                  Hutang (Saya Berhutang)
                </ThemedText>
              </Pressable>
            </View>

            <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Nama Orang / Rekan</ThemedText>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.backgroundSelected, color: colors.text, borderColor: colors.border }]}
              placeholder="Contoh: Budi, Andre, Toko A"
              placeholderTextColor={colors.textSecondary}
              value={debtPerson}
              onChangeText={setDebtPerson}
            />

            <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Nominal (Rp)</ThemedText>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.backgroundSelected, color: colors.text, borderColor: colors.border }]}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={debtAmountStr}
              onChangeText={setDebtAmountStr}
            />

            <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Keperluan / Catatan</ThemedText>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.backgroundSelected, color: colors.text, borderColor: colors.border }]}
              placeholder="Catatan opsional..."
              placeholderTextColor={colors.textSecondary}
              value={debtNote}
              onChangeText={setDebtNote}
            />

            <Pressable
              accessibilityRole="button"
              style={[styles.modalSubmitBtn, { backgroundColor: colors.brandPrimary }]}
              onPress={handleSaveDebt}
            >
              <ThemedText style={styles.modalSubmitText}>Simpan Catatan</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL KONFIRMASI HAPUS TABUNGAN */}
      <ConfirmationModal
        visible={Boolean(goalToDelete)}
        title="Hapus Target Impian?"
        message="Target tabungan ini akan dihapus dari daftar impian Anda."
        confirmLabel="Hapus Target"
        onConfirm={async () => {
          if (goalToDelete) {
            await deleteSavingGoal(goalToDelete);
            setGoalToDelete(null);
          }
        }}
        onCancel={() => setGoalToDelete(null)}
      />

      {/* MODAL KONFIRMASI HAPUS HUTANG / PIUTANG */}
      <ConfirmationModal
        visible={Boolean(debtToDelete)}
        title="Hapus Catatan Hutang/Piutang?"
        message="Catatan hutang atau piutang ini akan dihapus secara permanen."
        confirmLabel="Hapus Catatan"
        onConfirm={async () => {
          if (debtToDelete) {
            await deleteDebt(debtToDelete);
            setDebtToDelete(null);
          }
        }}
        onCancel={() => setDebtToDelete(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  addNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addNewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  segmentWrapper: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 12,
  },
  contentScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  summaryLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  summaryPercent: {
    color: '#C9F36A',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryAmount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  summarySub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
  },
  itemCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  goalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  goalName: {
    fontSize: 14,
    fontWeight: '600',
  },
  goalSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  goalPercentBadge: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalAmounts: {
    fontSize: 14,
    fontWeight: '700',
  },
  goalBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  miniActionText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  miniIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debtOverviewRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  debtSummaryCol: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  debtIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  debtSummaryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  debtSummaryVal: {
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 2,
  },
  debtSummaryNote: {
    fontSize: 10,
  },
  subFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  subFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  subFilterText: {
    fontSize: 11,
    fontWeight: '600',
  },
  debtCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  debtPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  debtTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  debtTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  debtPersonName: {
    fontSize: 14,
    fontWeight: '600',
  },
  debtAmountMain: {
    fontSize: 14,
    fontWeight: '800',
  },
  debtNoteText: {
    fontSize: 12,
    marginBottom: 8,
  },
  debtActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  debtStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debtStatusText: {
    fontSize: 11,
  },
  debtBtnActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  settleBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 14,
  },
  modalSubmitBtn: {
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
