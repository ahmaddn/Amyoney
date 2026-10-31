import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

interface GuestLockModalProps {
  visible: boolean;
  featureName: string;
  onClose: () => void;
  onLogin: () => void;
}

export function GuestLockModal({
  visible,
  featureName,
  onClose,
  onLogin,
}: GuestLockModalProps) {
  const { colors } = useAppTheme();

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <View style={[styles.lockIconCircle, { backgroundColor: colors.backgroundSelected }]}>
            <Ionicons name="lock-closed" size={32} color={colors.brandPrimary} />
          </View>

          <ThemedText style={[styles.title, { color: colors.text }]}>
            Fitur Khusus Pengguna Terdaftar
          </ThemedText>

          <ThemedText style={[styles.description, { color: colors.textSecondary }]}>
            Sebagai tamu, Anda dapat mencatat pemasukan dan pengeluaran secara bebas di perangkat ini. Namun fitur{' '}
            <ThemedText style={{ color: colors.brandPrimary, fontWeight: '700' }}>
              {featureName}
            </ThemedText>{' '}
            serta sinkronisasi Cloud memerlukan akun resmi.
          </ThemedText>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Masuk atau Daftar Akun"
            style={[styles.primaryBtn, { backgroundColor: colors.brandPrimary }]}
            onPress={onLogin}
          >
            <ThemedText style={styles.primaryBtnText}>Masuk atau Daftar Akun</ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tetap dalam Mode Tamu"
            style={[styles.cancelBtn, { borderColor: colors.border }]}
            onPress={onClose}
          >
            <ThemedText style={[styles.cancelBtnText, { color: colors.text }]}>
              Tetap dalam Mode Tamu
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
  lockIconCircle: {
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
