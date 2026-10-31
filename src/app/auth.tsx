import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/context/auth-context';
import { useAppTheme } from '@/context/theme-context';
import { authService } from '@/services/auth-service';

WebBrowser.maybeCompleteAuthSession();

// Client IDs resmi dari Project Firebase amyoney-c1ce5 (Project Number: 794729862927)
const GOOGLE_WEB_CLIENT_ID = '794729862927-66q06t8v65gdamm0357gob47qvm07gm1.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '794729862927-gf1k589o40asbs9m7f0128pp4590fjsa.apps.googleusercontent.com';

interface AuthScreenProps {
  onDismiss?: () => void;
}

export default function AuthScreen({ onDismiss }: AuthScreenProps) {
  const { colors } = useAppTheme();
  const { user, signOut, signInWithGoogle, continueAsGuest } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Skema native Google reversed client id untuk APK Android (Google mewajibkan single slash `:/` untuk native redirect)
  const androidClientScheme = 'com.googleusercontent.apps.794729862927-gf1k589o40asbs9m7f0128pp4590fjsa';
  const redirectUri = AuthSession.makeRedirectUri({
    native: `${androidClientScheme}:/oauth2redirect`,
  });

  // Hook Google Auth Session untuk Native Android & Web
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    redirectUri,
  });

  // Listener tanggapan login Google dari browser native / system dialog
  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params?.id_token;
      if (idToken) {
        setLoading(true);
        setErrorMessage('');
        authService
          .signInWithGoogleIdToken(idToken)
          .then(() => {
            if (onDismiss) onDismiss();
          })
          .catch((err) => setErrorMessage(err?.message || 'Gagal login dengan Google.'))
          .finally(() => setLoading(false));
      }
    } else if (response?.type === 'error') {
      setErrorMessage(response.error?.message || 'Login dibatalkan atau terjadi kesalahan.');
    }
  }, [response, onDismiss]);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setErrorMessage('Harap isi email dan password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password minimal 6 karakter.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      if (mode === 'login') {
        await authService.signIn(email, password);
      } else {
        await authService.signUp(email, password);
      }
    } catch (err: any) {
      let msg = err?.message || 'Gagal melakukan autentikasi.';
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        msg = 'Email atau password salah.';
      } else if (err?.code === 'auth/email-already-in-use') {
        msg = 'Email ini sudah terdaftar. Silakan login.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      if (Platform.OS === 'web') {
        await signInWithGoogle();
      } else {
        const result = await promptAsync();
        if (result?.type === 'success' && result.params?.id_token) {
          await authService.signInWithGoogleIdToken(result.params.id_token);
          if (onDismiss) onDismiss();
        } else if (result?.type === 'error') {
          setErrorMessage(result.error?.message || 'Gagal login dengan Google.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal login dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {onDismiss && (
            <View style={styles.topDismissRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Tutup"
                style={[styles.closeBtn, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
                onPress={onDismiss}
              >
                <ThemedText style={{ color: colors.text, fontWeight: '700' }}>Tutup</ThemedText>
              </Pressable>
            </View>
          )}

          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logoBadgeImage}
              resizeMode="cover"
            />
            <ThemedText style={[styles.brandTitle, { color: colors.text }]}>
              Amyoney<ThemedText style={{ color: colors.brandAccent }}>.</ThemedText>
            </ThemedText>
            <ThemedText style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
              Pengelolaan Keuangan & Pagu Anggaran Personal
            </ThemedText>
          </View>

          {user ? (
            <View style={[styles.authCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <ThemedText style={[styles.cardHeaderTitle, { color: colors.text }]}>
                Akun Terhubung
              </ThemedText>
              <ThemedText style={[styles.userEmailLabel, { color: colors.textSecondary }]}>
                {user.email || 'Pengguna'}
              </ThemedText>

              <Pressable
                accessibilityRole="button"
                style={[styles.signOutBtn, { backgroundColor: colors.expenseBg, borderColor: colors.expense }]}
                onPress={async () => {
                  await signOut();
                  if (onDismiss) onDismiss();
                }}
              >
                <ThemedText style={[styles.signOutText, { color: colors.expense }]}>
                  Keluar dari Akun
                </ThemedText>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.authCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
            {/* Segment Tab Login / Register */}
            <View style={[styles.segmentContainer, { backgroundColor: colors.backgroundSelected }]}>
              <Pressable
                style={[
                  styles.segmentBtn,
                  mode === 'login' && { backgroundColor: colors.backgroundElement },
                ]}
                onPress={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
              >
                <ThemedText
                  style={[
                    styles.segmentText,
                    {
                      color: mode === 'login' ? colors.text : colors.textSecondary,
                      fontWeight: mode === 'login' ? '700' : '500',
                    },
                  ]}
                >
                  Masuk
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.segmentBtn,
                  mode === 'register' && { backgroundColor: colors.backgroundElement },
                ]}
                onPress={() => {
                  setMode('register');
                  setErrorMessage('');
                }}
              >
                <ThemedText
                  style={[
                    styles.segmentText,
                    {
                      color: mode === 'register' ? colors.text : colors.textSecondary,
                      fontWeight: mode === 'register' ? '700' : '500',
                    },
                  ]}
                >
                  Daftar
                </ThemedText>
              </Pressable>
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                Alamat Email
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.backgroundSelected,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="nama@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setErrorMessage('');
                }}
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                Kata Sandi
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.backgroundSelected,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Minimal 6 karakter"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setErrorMessage('');
                }}
              />
            </View>

            {errorMessage ? (
              <ThemedText style={[styles.errorText, { color: colors.expense }]}>
                {errorMessage}
              </ThemedText>
            ) : null}

            {/* Submit Email Button */}
            <Pressable
              accessibilityRole="button"
              style={[styles.submitBtn, { backgroundColor: colors.brandPrimary }]}
              onPress={handleEmailAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.submitBtnText}>
                  {mode === 'login' ? 'Masuk ke Akun' : 'Buat Akun Amyoney'}
                </ThemedText>
              )}
            </Pressable>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <ThemedText style={[styles.dividerText, { color: colors.textSecondary }]}>
                atau
              </ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Google Sign In Button (Mobile & Web Supported) */}
            <Pressable
              accessibilityRole="button"
              style={[styles.googleBtn, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}
              onPress={handleGoogleAuth}
              disabled={loading || (Platform.OS !== 'web' && !request)}
            >
              <ThemedText style={[styles.googleBtnText, { color: colors.text }]}>
                Lanjutkan dengan Google
              </ThemedText>
            </Pressable>

            {/* Guest Option Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Masuk sebagai Tamu"
              style={[styles.guestBtn, { borderColor: colors.border }]}
              onPress={() => {
                continueAsGuest();
                if (onDismiss) onDismiss();
              }}
            >
              <ThemedText style={[styles.guestBtnText, { color: colors.textSecondary }]}>
                Masuk sebagai Tamu (Simpan Lokal Saja)
              </ThemedText>
            </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  topDismissRow: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  closeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  userEmailLabel: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  signOutBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
  },
  container: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadgeImage: {
    width: 64,
    height: 64,
    borderRadius: 18,
    marginBottom: 14,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  brandSubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  authCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentText: {
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 14,
  },
  submitBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    marginHorizontal: 12,
  },
  googleBtn: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  guestBtn: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderStyle: 'dashed',
  },
  guestBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
