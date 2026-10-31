import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/context/theme-context';
import { authService } from '@/services/auth-service';

export default function OAuth2RedirectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useAppTheme();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const idToken = params.id_token as string;
        if (idToken) {
          await authService.signInWithGoogleIdToken(idToken);
        }
      } catch (err) {
        console.error('OAuth redirect processing error:', err);
      } finally {
        router.replace('/');
      }
    };

    handleCallback();
  }, [params, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.brandPrimary} />
      <ThemedText style={[styles.text, { color: colors.textSecondary }]}>
        Menyelesaikan autentikasi...
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
  },
});

