import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useAppTheme } from '@/context/theme-context';

const DURATION = 500;

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
  const { colorPreset, colors, isThemeLoaded } = useAppTheme();
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  // Sinkronkan latar belakang SystemUI root window dengan warna heroBg tema yang dipilih
  useEffect(() => {
    if (colors?.heroBg) {
      SystemUI.setBackgroundColorAsync(colors.heroBg).catch(() => {});
    }
  }, [colors?.heroBg]);

  useEffect(() => {
    // Tunggu sampai tema benar-benar selesai dimuat dari penyimpanan perangkat
    if (ready && isThemeLoaded && !animate) {
      // Sembunyikan splash screen native bawaan OS setelah frame pertama tema termuat
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [ready, isThemeLoaded, animate]);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      opacity: 1,
      transform: [{ scale: 1 }],
    },
    70: {
      opacity: 0.3,
      transform: [{ scale: 0.98 }],
      easing: Easing.out(Easing.cubic),
    },
    100: {
      opacity: 0,
      transform: [{ scale: 0.96 }],
      easing: Easing.out(Easing.cubic),
    },
  });

  const activeIcon = PRESET_ICONS[colorPreset] || PRESET_ICONS.forest;

  const content = (
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
  );

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={[styles.splashOverlay, { backgroundColor: colors.heroBg }]}>
      {content}
    </Animated.View>
  ) : (
    <View style={[styles.splashOverlay, { backgroundColor: colors.heroBg }]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#173D32',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
  },
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
