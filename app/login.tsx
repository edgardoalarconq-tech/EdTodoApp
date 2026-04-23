import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/lib/auth-context';
import { isFirebaseConfigured } from '@/lib/firebase';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isFirebaseConfigured) {
    return (
      <SafeAreaView
        style={[styles.screen, { backgroundColor: theme.background, paddingTop: insets.top + 8 }]}>
        <View style={styles.unconfigured}>
          <Text style={[styles.unconfiguredText, { color: theme.text }]}>
            Configura EXPO_PUBLIC_FIREBASE_* (apiKey, projectId, databaseURL) y reinicia Expo. Después
            verás el inicio de sesión.
          </Text>
          <Pressable
            onPress={() => router.replace('/(tabs)')}
            style={({ pressed }) => [styles.outlineBtn, { borderColor: theme.tint }, pressed && { opacity: 0.7 }]}>
            <Text style={[styles.outlineBtnText, { color: theme.tint }]}>Ir a la app</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const onSignIn = async () => {
    setError(null);
    const e = email.trim();
    if (!e || !password) {
      setError('Indica correo y contraseña');
      return;
    }
    setBusy(true);
    try {
      await signIn(e, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al entrar');
    } finally {
      setBusy(false);
    }
  };

  const onSignUp = async () => {
    setError(null);
    const e = email.trim();
    if (!e || !password) {
      setError('Indica correo y contraseña');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setBusy(true);
    try {
      await signUp(e, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.background, paddingTop: insets.top }]}
      edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <View style={styles.headerRow}>
          <View style={styles.brandIcon}>
            <MaterialIcons name="lock-outline" size={28} color={theme.tint} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Entrar</Text>
          <Text style={[styles.sub, { color: theme.icon }]}>Correo y contraseña (Firebase)</Text>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.icon }]}>Correo electrónico</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.text,
                borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#c6c6c8',
                backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
              },
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="tú@ejemplo.com"
            placeholderTextColor={theme.icon}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="next"
            editable={!busy}
          />
          <Text style={[styles.label, styles.labelGap, { color: theme.icon }]}>Contraseña</Text>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.text,
                borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#c6c6c8',
                backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
              },
            ]}
            value={password}
            onChangeText={setPassword}
            placeholder="Mín. 6 caracteres"
            placeholderTextColor={theme.icon}
            autoCapitalize="none"
            autoComplete="password"
            secureTextEntry
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={onSignIn}
            editable={!busy}
          />

          <Pressable
            onPress={onSignIn}
            disabled={busy}
            style={({ pressed }) => [
              styles.primary,
              { backgroundColor: theme.tint },
              pressed && styles.pressed,
              busy && styles.disabled,
            ]}>
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryText}>Entrar</Text>
            )}
          </Pressable>

          <Pressable onPress={onSignUp} disabled={busy} style={({ pressed }) => [styles.textBtn, pressed && { opacity: 0.6 }]}>
            <Text style={[styles.textBtnLabel, { color: theme.tint }]}>Crear cuenta con estos datos</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1, paddingHorizontal: 24, paddingTop: 12 },
  headerRow: { marginBottom: 24, alignItems: 'center' },
  brandIcon: { marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '700' },
  sub: { fontSize: 15, marginTop: 6, textAlign: 'center' },
  form: { gap: 0 },
  label: { fontSize: 13, fontWeight: '600' },
  labelGap: { marginTop: 16 },
  input: { marginTop: 6, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 17 },
  primary: { marginTop: 28, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  textBtn: { marginTop: 20, paddingVertical: 8, alignItems: 'center' },
  textBtnLabel: { fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.75 },
  errorBanner: { marginBottom: 12, backgroundColor: 'rgba(255, 59, 48, 0.12)', borderRadius: 8, padding: 10 },
  errorBannerText: { color: '#C62828', fontSize: 14, textAlign: 'center' },
  unconfigured: { paddingHorizontal: 20, paddingTop: 32, alignItems: 'center', gap: 20 },
  unconfiguredText: { textAlign: 'center', lineHeight: 22, fontSize: 15 },
  outlineBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20 },
  outlineBtnText: { fontSize: 16, fontWeight: '600' },
});
