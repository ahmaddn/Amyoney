import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/theme-context';
import { ThemedText } from '../themed-text';

export type TabKey = 'index' | 'transactions' | 'savings' | 'stats' | 'budget' | 'settings';

interface CustomTabBarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onPressAdd: () => void;
}

export function CustomTabBar({ currentTab, onSelectTab, onPressAdd }: CustomTabBarProps) {
  const { colors, resolvedTheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);

  return (
    <View
      style={[
        styles.barContainer,
        {
          backgroundColor: colors.backgroundElement,
          borderTopColor: colors.border,
          paddingBottom: bottomPadding,
          height: 60 + bottomPadding,
        },
      ]}
    >
      {/* 1. Tab Kiri 1: Beranda */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tab Beranda"
        style={styles.tabItem}
        onPress={() => onSelectTab('index')}
      >
        <Ionicons
          name={currentTab === 'index' ? 'home' : 'home-outline'}
          size={22}
          color={currentTab === 'index' ? colors.brandPrimary : colors.textSecondary}
        />
        <ThemedText
          style={[
            styles.tabLabel,
            {
              color: currentTab === 'index' ? colors.brandPrimary : colors.textSecondary,
              fontWeight: currentTab === 'index' ? '700' : '500',
            },
          ]}
        >
          Beranda
        </ThemedText>
        {currentTab === 'index' && <View style={[styles.activeDot, { backgroundColor: colors.brandPrimary }]} />}
      </Pressable>

      {/* 2. Tab Kiri 2: Transaksi */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tab Transaksi"
        style={styles.tabItem}
        onPress={() => onSelectTab('transactions')}
      >
        <Ionicons
          name={currentTab === 'transactions' ? 'swap-horizontal' : 'swap-horizontal-outline'}
          size={22}
          color={currentTab === 'transactions' ? colors.brandPrimary : colors.textSecondary}
        />
        <ThemedText
          style={[
            styles.tabLabel,
            {
              color: currentTab === 'transactions' ? colors.brandPrimary : colors.textSecondary,
              fontWeight: currentTab === 'transactions' ? '700' : '500',
            },
          ]}
        >
          Transaksi
        </ThemedText>
        {currentTab === 'transactions' && <View style={[styles.activeDot, { backgroundColor: colors.brandPrimary }]} />}
      </Pressable>

      {/* 3. CENTER ACTION (+) PERSIS DI TENGAH (Slot 3 dari 5) */}
      <View style={styles.centerActionWrapper}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Catat Transaksi Baru"
          style={[styles.centerAddButton, { backgroundColor: colors.brandAccent, shadowColor: colors.brandPrimary }]}
          onPress={onPressAdd}
        >
          <Ionicons name="add" size={32} color={resolvedTheme === 'dark' ? '#111614' : colors.brandPrimary} />
        </Pressable>
      </View>

      {/* 4. Tab Kanan 1: Pagu Anggaran */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tab Pagu Anggaran"
        style={styles.tabItem}
        onPress={() => onSelectTab('budget')}
      >
        <Ionicons
          name={currentTab === 'budget' ? 'wallet' : 'wallet-outline'}
          size={22}
          color={currentTab === 'budget' ? colors.brandPrimary : colors.textSecondary}
        />
        <ThemedText
          style={[
            styles.tabLabel,
            {
              color: currentTab === 'budget' ? colors.brandPrimary : colors.textSecondary,
              fontWeight: currentTab === 'budget' ? '700' : '500',
            },
          ]}
        >
          Pagu
        </ThemedText>
        {currentTab === 'budget' && <View style={[styles.activeDot, { backgroundColor: colors.brandPrimary }]} />}
      </Pressable>

      {/* 5. Tab Kanan 2: Tabungan & Hutang */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tab Tabungan dan Hutang"
        style={styles.tabItem}
        onPress={() => onSelectTab('savings')}
      >
        <Ionicons
          name={currentTab === 'savings' ? 'flag' : 'flag-outline'}
          size={22}
          color={currentTab === 'savings' ? colors.brandPrimary : colors.textSecondary}
        />
        <ThemedText
          style={[
            styles.tabLabel,
            {
              color: currentTab === 'savings' ? colors.brandPrimary : colors.textSecondary,
              fontWeight: currentTab === 'savings' ? '700' : '500',
            },
          ]}
        >
          Tabungan
        </ThemedText>
        {currentTab === 'savings' && <View style={[styles.activeDot, { backgroundColor: colors.brandPrimary }]} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: -0.2,
    marginTop: 3,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  centerActionWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerAddButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#C9F36A',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 8,
    shadowColor: '#173D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});
