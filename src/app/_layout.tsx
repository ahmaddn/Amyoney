import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';

// Menangkap callback redirect autentikasi global di seluruh aplikasi
WebBrowser.maybeCompleteAuthSession();

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { MoneyProvider } from '@/context/money-context';
import { ThemeProvider, useAppTheme } from '@/context/theme-context';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootContent() {
  const { resolvedTheme, isThemeLoaded } = useAppTheme();
  const { loading: authLoading } = useAuth();

  return (
    <NavThemeProvider value={resolvedTheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay ready={!authLoading && isThemeLoaded} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
        <Stack.Screen name="explore" />
      </Stack>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MoneyProvider>
          <RootContent />
        </MoneyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
