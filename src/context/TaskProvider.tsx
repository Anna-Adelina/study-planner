import { useCallback, useEffect, useReducer, useState } from 'react';
import type { ReactNode } from 'react';
import { TaskContext } from './TaskContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { createInitialState, taskReducer } from '../reducers/taskReducer';
import { isFilterMode } from '../types/task';
import type { FilterMode, NewTask } from '../types/task';
import type { ToastMessage, ToastVariant } from '../types/toast';
import {
  FILTER_STORAGE_KEY,
  loadTasks,
  saveTasks,
} from '../utils/taskStorage';

export const UNDO_DELAY_MS = 5000;

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  // Ліниве читання localStorage при ініціалізації reducer (не всередині reducer!)
  const [state, dispatch] = useReducer(taskReducer, undefined, () =>
    createInitialState(loadTasks() ?? undefined),
  );
  const [filter, setFilter] = useLocalStorage<FilterMode>(
    FILTER_STORAGE_KEY,
    'all',
    isFilterMode,
  );

  // UI-стан: яке завдання зараз редагуємо
  const [editingId, setEditingId] = useState<number | null>(null);
  // derived state: саме завдання знаходимо під час render
  const editingTask =
    state.tasks.find((task) => task.id === editingId) ?? null;

  // Toast: короткий зворотний зв'язок після дій
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      setToast({ id: Date.now(), message, variant });
    },
    [],
  );
  const dismissToast = useCallback(() => setToast(null), []);

  // Effect 1: після кожної зміни tasks синхронізуємо їх з localStorage
  useEffect(() => {
    saveTasks(state.tasks);
  }, [state.tasks]);

  // Effect 2: таймер Undoable Delete. Reducer лише міняє state,
  // а запуск і очищення таймера — тут.
  useEffect(() => {
    if (!state.pendingDeletion) return;
    const { kind } = state.pendingDeletion;
    const timerId = setTimeout(() => {
      dispatch({ type: 'confirmDelete' });
      showToast(
        kind === 'completed'
          ? 'Виконані завдання видалено'
          : 'Завдання остаточно видалено',
      );
    }, UNDO_DELAY_MS);
    return () => clearTimeout(timerId);
  }, [state.pendingDeletion, showToast]);

  const value = {
    tasks: state.tasks,
    pendingDeletion: state.pendingDeletion,
    filter,
    setFilter,
    // id генеруємо тут, а не в reducer (він має бути чистим)
    addTask: (task: NewTask) => {
      dispatch({
        type: 'add',
        payload: { ...task, id: Date.now(), completed: false },
      });
      showToast('Завдання створено');
    },
    updateTask: (id: number, changes: NewTask) => {
      // неможливість виконати дію → Toast з помилкою
      if (!state.tasks.some((task) => task.id === id)) {
        showToast('Не вдалося зберегти: завдання не знайдено', 'error');
        return;
      }
      dispatch({ type: 'update', payload: { id, changes } });
      showToast('Зміни збережено');
    },
    toggleTask: (id: number) => dispatch({ type: 'toggle', payload: { id } }),
    requestDelete: (id: number) =>
      dispatch({ type: 'requestDelete', payload: { id } }),
    undoDelete: () => dispatch({ type: 'undoDelete' }),
    clearCompleted: () => dispatch({ type: 'clearCompleted' }),
    resetTasks: () => dispatch({ type: 'reset' }),
    editingTask,
    startEdit: (id: number) => setEditingId(id),
    cancelEdit: () => setEditingId(null),
    toast,
    showToast,
    dismissToast,
  };

  return <TaskContext value={value}>{children}</TaskContext>;
}