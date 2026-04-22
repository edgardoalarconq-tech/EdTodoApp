export type TodoItem = {
  id: string;
  title: string;
  completed: boolean;
  /** milisegundos desde epoch (Realtime Database) */
  createdAt: number;
};

export type TodoRaw = {
  title?: unknown;
  completed?: unknown;
  createdAt?: unknown;
};

export function parseTodosSnapshot(val: Record<string, TodoRaw> | null): TodoItem[] {
  if (!val || typeof val !== 'object') return [];
  return Object.entries(val)
    .map(([id, data]) => {
      const title = typeof data.title === 'string' ? data.title : '';
      const completed = Boolean(data.completed);
      const createdAt =
        typeof data.createdAt === 'number' && Number.isFinite(data.createdAt)
          ? data.createdAt
          : 0;
      return { id, title, completed, createdAt };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}
