import { request } from '../api/httpClient';
import type { ApiTodo, TodosResponse } from '../types/api';
import type { NewTask, Task } from '../types/task';
import { toApiPayload, toTask } from './taskMapper';

export interface TaskPage {
  tasks: Task[];
  total: number;
  skip: number;
  limit: number;
}

export interface GetAllParams {
  limit: number;
  skip: number;
  signal?: AbortSignal;
}

// API розуміє лише ці поля
export type TaskChanges = Partial<Pick<Task, 'title' | 'completed'>>;

export const taskRepository = {
  async getAll({ limit, skip, signal }: GetAllParams): Promise<TaskPage> {
    const data = await request<TodosResponse>(
      `/todos?limit=${limit}&skip=${skip}`,
      { signal },
    );
    return {
      tasks: data.todos.map(toTask),
      total: data.total,
      skip: data.skip,
      limit: data.limit,
    };
  },

  async getById(id: number, signal?: AbortSignal): Promise<Task> {
    const todo = await request<ApiTodo>(`/todos/${id}`, { signal });
    return toTask(todo);
  },

  async create(task: NewTask): Promise<Task> {
    const created = await request<ApiTodo>('/todos/add', {
      method: 'POST',
      body: toApiPayload({ title: task.title, completed: false }),
    });
    // client-only поля (description, priority, category) беремо з форми
    return { ...toTask(created), ...task };
  },

  async update(id: number, changes: TaskChanges): Promise<Task> {
    const payload: { todo?: string; completed?: boolean } = {};
    if (changes.title !== undefined) payload.todo = changes.title;
    if (changes.completed !== undefined) payload.completed = changes.completed;

    const updated = await request<ApiTodo>(`/todos/${id}`, {
      method: 'PATCH',
      body: payload,
    });
    return toTask(updated);
  },

  async delete(id: number): Promise<void> {
    await request<unknown>(`/todos/${id}`, { method: 'DELETE' });
  },
};