import axios, { isAxiosError } from 'axios';

import { getDatabaseRestBaseUrl } from '@/lib/firebase';
import { parseTodosSnapshot, type TodoItem, type TodoRaw } from '@/lib/todos-model';

const TODOS_PATH = 'todos';

function rethrowWithStatus(
  e: unknown,
  fallbackMessage: (status: number) => string,
): never {
  if (isAxiosError(e) && e.response) {
    throw new Error(fallbackMessage(e.response.status));
  }
  throw e;
}

/**
 * Realtime Database REST API (peticiones HTTP directas; aquí vía axios).
 * @see https://firebase.google.com/docs/database/rest/start
 */
export async function restGetTodos(): Promise<TodoItem[]> {
  const base = getDatabaseRestBaseUrl();
  try {
    const { data } = await axios.get<Record<string, TodoRaw> | null>(`${base}/${TODOS_PATH}.json`);
    return parseTodosSnapshot(data);
  } catch (e) {
    rethrowWithStatus(e, (s) => `Error al leer tareas (HTTP ${s})`);
  }
}

export async function restPostTodo(title: string): Promise<void> {
  const base = getDatabaseRestBaseUrl();
  try {
    await axios.post(`${base}/${TODOS_PATH}.json`, {
      title,
      completed: false,
      createdAt: Date.now(),
    });
  } catch (e) {
    rethrowWithStatus(e, (s) => `No se pudo crear la tarea (HTTP ${s})`);
  }
}

export async function restPatchTodoCompleted(id: string, completed: boolean): Promise<void> {
  const base = getDatabaseRestBaseUrl();
  try {
    await axios.patch(`${base}/${TODOS_PATH}/${encodeURIComponent(id)}.json`, { completed });
  } catch (e) {
    rethrowWithStatus(e, (s) => `No se pudo actualizar (HTTP ${s})`);
  }
}

export async function restDeleteTodo(id: string): Promise<void> {
  const base = getDatabaseRestBaseUrl();
  try {
    await axios.delete(`${base}/${TODOS_PATH}/${encodeURIComponent(id)}.json`);
  } catch (e) {
    rethrowWithStatus(e, (s) => `No se pudo eliminar (HTTP ${s})`);
  }
}
