import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { TaskContext } from './TaskContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { isFilterMode } from '../types/task';
import type { FilterMode } from '../types/task';
import type { ToastMessage, ToastVariant } from '../types/toast';
import { FILTER_STORAGE_KEY } from '../utils/taskStorage';

interface TaskProviderProps {
  children: ReactNode;
}

// Тут зберігається лише стан самого інтерфейсу (фільтр, редагована задача, toast).
export function TaskProvider({ children }: TaskProviderProps) {
  // який фільтр обрав користувач (зберігається в localStorage)
  const [filter, setFilter] = useLocalStorage<FilterMode>(
    FILTER_STORAGE_KEY,
    'all',
    isFilterMode,
  );

  // UI-стан: id задачі, яку зараз редагують.
  const [editingId, setEditingId] = useState<number | null>(null);

  // Toast: спливаючі сповіщення після дій.
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      setToast({ id: Date.now(), message, variant });
    },
    [],
  );
  const dismissToast = useCallback(() => setToast(null), []);

  const value = {
    filter,
    setFilter,
    editingId,
    startEdit: (id: number) => setEditingId(id),
    cancelEdit: () => setEditingId(null),
    toast,
    showToast,
    dismissToast,
  };

  return <TaskContext value={value}>{children}</TaskContext>;
}