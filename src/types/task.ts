export type Priority = 'low' | 'medium' | 'high';

export type FilterMode = 'all' | 'completed' | 'active';

export const isFilterMode = (value: unknown): value is FilterMode =>
  value === 'all' || value === 'completed' || value === 'active';

export const priorityLabels: Record<Priority, string> = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
};

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: string;
}

export type NewTask = Omit<Task, 'id' | 'completed'>;