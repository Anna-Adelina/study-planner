import type { Priority, Task } from '../types/task';

export const TASKS_STORAGE_KEY = 'study-planner:tasks';
export const FILTER_STORAGE_KEY = 'study-planner:filter';

const priorities: Priority[] = ['low', 'medium', 'high'];

export function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'number' &&
    typeof t.title === 'string' &&
    typeof t.description === 'string' &&
    typeof t.completed === 'boolean' &&
    typeof t.category === 'string' &&
    priorities.includes(t.priority as Priority)
  );
}

// Повертає збережені завдання або null, якщо даних немає / вони пошкоджені
export function loadTasks(): Task[] | null {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isTask)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ігноруємо помилки запису
  }
}