import { getDatabaseRestBaseUrl } from '@/lib/firebase';
import { parseTodosSnapshot, type TodoItem, type TodoRaw } from '@/lib/todos-model';

const TODOS_PATH = 'todos';

/**
 * Realtime Database REST API
 * @see https://firebase.google.com/docs/database/rest/start
 */
export async function restFetchTodos(): Promise<TodoItem[]> {
  const base = getDatabaseRestBaseUrl();
  const res = await fetch(`${base}/${TODOS_PATH}.json`);
  if (!res.ok) {
    throw new Error(`Error al leer tareas (HTTP ${res.status})`);
  }
  const val = (await res.json()) as Record<string, TodoRaw> | null;
  return parseTodosSnapshot(val);
}

export async function restCreateTodo(title: string): Promise<void> {
  const base = getDatabaseRestBaseUrl();
  const res = await fetch(`${base}/${TODOS_PATH}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      completed: false,
      createdAt: Date.now(),
    }),
  });
  if (!res.ok) {
    throw new Error(`No se pudo crear la tarea (HTTP ${res.status})`);
  }
}

export async function restUpdateTodoCompleted(id: string, completed: boolean): Promise<void> {
  const base = getDatabaseRestBaseUrl();
  const res = await fetch(`${base}/${TODOS_PATH}/${encodeURIComponent(id)}.json`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) {
    throw new Error(`No se pudo actualizar (HTTP ${res.status})`);
  }
}

export async function restDeleteTodo(id: string): Promise<void> {
  const base = getDatabaseRestBaseUrl();
  const res = await fetch(`${base}/${TODOS_PATH}/${encodeURIComponent(id)}.json`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`No se pudo eliminar (HTTP ${res.status})`);
  }
}
