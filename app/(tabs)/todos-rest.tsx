import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import {
  restDeleteTodo,
  restGetTodos,
  restPatchTodoCompleted,
  restPostTodo,
} from '@/lib/firebase-rtdb-rest';
import { isFirebaseConfigured } from '@/lib/firebase';
import type { TodoItem } from '@/lib/todos-model';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TodosRestScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const loadTodos = useCallback(async (isRefresh = false) => {
    if (!isFirebaseConfigured) return;
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const list = await restGetTodos();
      setTodos(list);
      if (__DEV__) {
        console.log(`[RTDB REST] GET /todos.json → ${list.length} tarea(s)`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      setError(
        'Firebase sin configurar: en desarrollo usa .env con EXPO_PUBLIC_FIREBASE_* y reinicia Expo. En builds EAS, define las mismas variables en expo.dev → Environment variables (Preview/Production).',
      );
      return;
    }
    void loadTodos(false);
  }, [loadTodos]);

  const openAddModal = useCallback(() => {
    setNewTitle('');
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setNewTitle('');
  }, []);

  const saveTask = useCallback(async () => {
    const title = newTitle.trim();
    if (!title || !isFirebaseConfigured) return;
    try {
      setError(null);
      await restPostTodo(title);
      closeModal();
      await loadTodos(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    }
  }, [newTitle, closeModal, loadTodos]);

  const toggleComplete = useCallback(
    async (item: TodoItem) => {
      if (!isFirebaseConfigured) return;
      try {
        setError(null);
        await restPatchTodoCompleted(item.id, !item.completed);
        await loadTodos(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo actualizar');
      }
    },
    [loadTodos],
  );

  const removeTask = useCallback(
    async (id: string) => {
      if (!isFirebaseConfigured) return;
      try {
        setError(null);
        await restDeleteTodo(id);
        await loadTodos(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo eliminar');
      }
    },
    [loadTodos],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Tareas</Text>
          <Text style={[styles.headerSubtitle, { color: theme.icon }]}>
            REST API (GET/POST/PATCH/DELETE)
          </Text>
        </View>

        {loading && !refreshing ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.tint} />
          </View>
        ) : error && todos.length === 0 ? (
          <View style={styles.centered}>
            <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={todos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void loadTodos(true)}
                tintColor={theme.tint}
              />
            }
            ListEmptyComponent={
              <Text style={[styles.empty, { color: theme.icon }]}>
                No hay tareas. Pulsa + para añadir una. Arrastra hacia abajo para actualizar.
              </Text>
            }
            renderItem={({ item }) => (
              <View
                style={[styles.row, { borderBottomColor: colorScheme === 'dark' ? '#2c2c2e' : '#e5e5ea' }]}>
                <Text
                  style={[
                    styles.taskTitle,
                    { color: theme.text },
                    item.completed && styles.taskTitleDone,
                  ]}
                  numberOfLines={2}>
                  {item.title}
                </Text>
                <View style={styles.actions}>
                  <Pressable
                    onPress={() => toggleComplete(item)}
                    style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                    accessibilityLabel={item.completed ? 'Marcar pendiente' : 'Completar tarea'}
                    hitSlop={8}>
                    <MaterialIcons
                      name={item.completed ? 'check-circle' : 'radio-button-unchecked'}
                      size={26}
                      color={item.completed ? '#34C759' : theme.tint}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => removeTask(item.id)}
                    style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
                    accessibilityLabel="Eliminar tarea"
                    hitSlop={8}>
                    <MaterialIcons name="delete-outline" size={26} color="#FF3B30" />
                  </Pressable>
                </View>
              </View>
            )}
          />
        )}

        {error && todos.length > 0 ? (
          <Text style={[styles.bannerError, { color: '#FF3B30' }]}>{error}</Text>
        ) : null}

        <View
          style={[
            styles.fabWrap,
            { backgroundColor: theme.background, paddingBottom: Math.max(insets.bottom, 16) },
          ]}>
          <Pressable
            onPress={openAddModal}
            style={({ pressed }) => [
              styles.fab,
              { backgroundColor: theme.tint },
              pressed && styles.fabPressed,
            ]}
            accessibilityLabel="Añadir tarea">
            <MaterialIcons name="add" size={32} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeModal}>
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={[styles.modalCard, { backgroundColor: theme.background }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Nueva tarea</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: colorScheme === 'dark' ? '#3a3a3c' : '#c6c6c8',
                  backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#f2f2f7',
                },
              ]}
              placeholder="Título de la tarea"
              placeholderTextColor={theme.icon}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
              onSubmitEditing={saveTask}
              returnKeyType="done"
            />
            <View style={styles.modalActions}>
              <Pressable onPress={closeModal} style={styles.modalBtn}>
                <Text style={{ color: theme.icon }}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={saveTask}
                style={styles.modalBtn}
                disabled={!newTitle.trim()}>
                <Text style={[styles.modalBtnPrimary, { color: theme.tint }]}>Guardar</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  empty: {
    textAlign: 'center',
    marginTop: 48,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 17,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    opacity: 0.55,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 6,
  },
  pressed: {
    opacity: 0.6,
  },
  bannerError: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 13,
  },
  fabWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 8,
    alignItems: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabPressed: {
    opacity: 0.85,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 20,
  },
  modalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  modalBtnPrimary: {
    fontWeight: '600',
    fontSize: 17,
  },
});
