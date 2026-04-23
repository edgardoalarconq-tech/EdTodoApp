import AsyncStorage from '@react-native-async-storage/async-storage';

import type { TodoItem } from '@/lib/todos-model';

const CACHE_KEY = 'edapp/todos-cache/v1';

function isTodoItem(x: unknown): x is TodoItem {
  if (x === null || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.title === 'string' &&
    typeof o.completed === 'boolean' &&
    typeof o.createdAt === 'number' &&
    Number.isFinite(o.createdAt)
  );
}

/**
 * Caché local (AsyncStorage) de la lista de tareas.
 * Stale-while-revalidate: se muestra al abrir mientras llega la red.
 */
export async function getTodosFromCache(): Promise<TodoItem[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw === null) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }
    const out: TodoItem[] = [];
    for (const x of parsed) {
      if (isTodoItem(x)) {
        out.push(x);
      }
    }
    return out;
  } catch {
    return null;
  }
}

export async function setTodosCache(todos: TodoItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(todos));
  } catch {
    // no bloquear la UI por fallo de caché
  }
}
