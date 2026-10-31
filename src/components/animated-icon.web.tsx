import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/theme-context';

interface AnimatedSplashOverlayProps {
  ready?: boolean;
}

const PRESET_ICONS = {
  forest: require('@/assets/images/icon-forest.png'),
  sapphire: require('@/assets/images/icon-sapphire.png'),
  obsidian: require('@/assets/images/icon-obsidian.png'),
  terracotta: require('@/assets/images/icon-terracotta.png'),
};

export function AnimatedSplashOverlay({ ready = true }: AnimatedSplashOverlayProps) {
  const { colorPreset, colors } = useAppTheme();
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!ready) return;

    // Tunggu 500ms agar splash screen dinikmati pengguna secara elegan
    const timer = setTimeout(() => {
      setOpacity(0);
      const hideTimer = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(hideTimer);
    }, 500);

    return () => clearTimeout(timer);
  }, [ready]);

  if (!visible) return null;

  const activeIcon = PRESET_ICONS[colorPreset] || PRESET_ICONS.forest;

  return (
    <View style={[styles.splashOverlay, { opacity, backgroundColor: colors.heroBg }]}>
      <View style={styles.brandContainer}>
        <Image
          source={activeIcon}
          style={styles.splashLogo}
          resizeMode="contain"
          fadeDuration={0}
        />
        <Text style={[styles.brandTitle, { color: colors.heroText }]}>
          Amyoney<Text style={{ color: colors.heroAccent }}>.</Text>
        </Text>
        <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>Personal Money & Budget</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#173D32',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
    transitionProperty: 'opacity',
    transitionDuration: '400ms',
  } as any,
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 84,
    height: 84,
    borderRadius: 24,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#F7F8F5',
    letterSpacing: -0.8,
  },
  limeDot: {
    color: '#C9F36A',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#A2B3AC',
    marginTop: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
