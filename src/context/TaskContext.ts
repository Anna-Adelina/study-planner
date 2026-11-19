import { createContext } from 'react';
import type { ToastMessage, ToastVariant } from '../types/toast';
import type { FilterMode } from '../types/task';

export interface TaskContextValue {
  filter: FilterMode;
  setFilter: (filter: FilterMode) => void;
  editingId: number | null;
  startEdit: (id: number) => void;
  cancelEdit: () => void;
  toast: ToastMessage | null;
  showToast: (message: string, variant?: ToastVariant) => void;
  dismissToast: () => void;
}

// null за замовчуванням: useTaskContext перевірить, що ми всередині провайдера
export const TaskContext = createContext<TaskContextValue | null>(null);