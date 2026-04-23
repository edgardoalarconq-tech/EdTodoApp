import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/lib/auth-context';
import { isFirebaseConfigured } from '@/lib/firebase';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }
    const top = segments[0];
    if (!isFirebaseConfigured) {
      if (top === 'login') {
        router.replace('/(tabs)');
      }
      return;
    }
    if (!user && top !== 'login') {
      router.replace('/login');
    } else if (user && top === 'login') {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, router]);

  if (isFirebaseConfigured && loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const firstScreen =
    isFirebaseConfigured && !user ? 'login' : '(tabs)';

  return (
    <Stack key={isFirebaseConfigured && !user ? 'pre-auth' : 'auth-ok'} initialRouteName={firstScreen}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGate />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
