import { createContext } from 'react';
import type { ToastMessage, ToastVariant } from '../types/toast';
import type {
  FilterMode,
  NewTask,
  PendingDeletion,
  Task,
} from '../types/task';

export interface TaskContextValue {
  tasks: Task[];
  pendingDeletion: PendingDeletion | null;
  filter: FilterMode;
  setFilter: (filter: FilterMode) => void;
  addTask: (task: NewTask) => void;
  updateTask: (id: number, changes: NewTask) => void;
  toggleTask: (id: number) => void;
  requestDelete: (id: number) => void;
  undoDelete: () => void;
  clearCompleted: () => void;
  resetTasks: () => void;
  editingTask: Task | null;
  startEdit: (id: number) => void;
  cancelEdit: () => void;
  toast: ToastMessage | null;
  showToast: (message: string, variant?: ToastVariant) => void;
  dismissToast: () => void;
}

// null за замовчуванням: useTaskContext перевірить, що ми всередині провайдера
export const TaskContext = createContext<TaskContextValue | null>(null);