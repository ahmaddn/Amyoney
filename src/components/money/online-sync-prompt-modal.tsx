import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

interface OnlineSyncPromptModalProps {
  visible: boolean;
  isSyncing: boolean;
  onClose: () => void;
  onSync: () => void;
}

export function OnlineSyncPromptModal({
  visible,
  isSyncing,
  onClose,
  onSync,
}: OnlineSyncPromptModalProps) {
  const { colors } = useAppTheme();

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.backgroundSelected }]}>
            <Ionicons name="cloud-upload" size={32} color={colors.brandPrimary} />
          </View>

          <ThemedText style={[styles.title, { color: colors.text }]}>
            Koneksi Internet Kembali Aktif
          </ThemedText>

          <ThemedText style={[styles.description, { color: colors.textSecondary }]}>
            Sistem mendeteksi perangkat Anda telah terhubung ke internet. Sinkronkan catatan transaksi dan anggaran terbaru ke cloud sekarang agar data tetap aman.
          </ThemedText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sinkronkan Sekarang"
            style={[styles.primaryBtn, { backgroundColor: colors.brandPrimary }]}
            onPress={onSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <Ionicons name="sync" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            )}
            <ThemedText style={styles.primaryBtnText}>
              {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
            </ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Nanti Saja"
            style={[styles.cancelBtn, { borderColor: colors.border }]}
            onPress={onClose}
          >
            <ThemedText style={[styles.cancelBtnText, { color: colors.text }]}>
              Nanti Saja
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 22, 20, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtn: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
