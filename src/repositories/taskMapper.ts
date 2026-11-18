import type { ApiTodo, ApiTodoPayload } from '../types/api';
import type { Task } from '../types/task';

// API -> UI
export function toTask(todo: ApiTodo): Task {
  return {
    id: todo.id,
    title: todo.todo,
    description: '',
    completed: todo.completed,
    priority: 'medium',
    category: 'General',
  };
}

// UI -> API (лише те, що API розуміє)
export function toApiPayload(
  task: Pick<Task, 'title' | 'completed'>,
  userId = 1,
): ApiTodoPayload {
  return { todo: task.title, completed: task.completed, userId };
}