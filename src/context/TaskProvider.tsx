import { useEffect, useReducer } from 'react';
import type { ReactNode } from 'react';
import { TaskContext } from './TaskContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { createInitialState, taskReducer } from '../reducers/taskReducer';
import { isFilterMode } from '../types/task';
import type { FilterMode, NewTask } from '../types/task';
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

  // Effect 1: після кожної зміни tasks синхронізуємо їх з localStorage
  useEffect(() => {
    saveTasks(state.tasks);
  }, [state.tasks]);

  // Effect 2: таймер Undoable Delete. Reducer лише міняє state,
  // а запуск і очищення таймера — тут.
  useEffect(() => {
    if (!state.pendingDeletion) return;
    const timerId = setTimeout(
      () => dispatch({ type: 'confirmDelete' }),
      UNDO_DELAY_MS,
    );
    return () => clearTimeout(timerId);
  }, [state.pendingDeletion]);

  const value = {
    tasks: state.tasks,
    pendingDeletion: state.pendingDeletion,
    filter,
    setFilter,
    // id генеруємо тут, а не в reducer (він має бути чистим)
    addTask: (task: NewTask) =>
      dispatch({
        type: 'add',
        payload: { ...task, id: Date.now(), completed: false },
      }),
    updateTask: (id: number, changes: NewTask) =>
      dispatch({ type: 'update', payload: { id, changes } }),
    toggleTask: (id: number) => dispatch({ type: 'toggle', payload: { id } }),
    requestDelete: (id: number) =>
      dispatch({ type: 'requestDelete', payload: { id } }),
    undoDelete: () => dispatch({ type: 'undoDelete' }),
    clearCompleted: () => dispatch({ type: 'clearCompleted' }),
    resetTasks: () => dispatch({ type: 'reset' }),
  };

  return <TaskContext value={value}>{children}</TaskContext>;
}