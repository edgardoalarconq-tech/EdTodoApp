import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/lib/auth-context';
import { isFirebaseConfigured } from '@/lib/firebase';

export function SignOutButton() {
  const { signOut } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const tint = Colors[colorScheme].tint;
  if (!isFirebaseConfigured) {
    return null;
  }
  return (
    <Pressable
      onPress={() => {
        void signOut();
      }}
      hitSlop={8}
      style={({ pressed }) => [{ padding: 6, opacity: pressed ? 0.6 : 1 }]}
      accessibilityLabel="Cerrar sesión">
      <MaterialIcons name="logout" size={24} color={tint} />
    </Pressable>
  );
}
