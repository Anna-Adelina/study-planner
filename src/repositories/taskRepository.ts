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

// DummyJSON лише симулює POST: створену задачу сервер не зберігає
// (PATCH/DELETE за її id дають 404). Тому запам'ятовуємо id задач,
// створених у цій сесії, і для них зміни лишаються на клієнті.
const sessionCreatedIds = new Set<number>();
let nextLocalId = 1_000_000; // далеко від id, які існують на сервері

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
    // DummyJSON щоразу повертає той самий id, а id у списку має бути унікальним
    const id = sessionCreatedIds.has(created.id) ? nextLocalId++ : created.id;
    sessionCreatedIds.add(id);
    // client-only поля (description, priority, category) беремо з форми
    return { ...toTask(created), ...task, id };
  },

  // Повертає лише те, що підтвердив сервер; решту полів UI лишає як є
  async update(id: number, changes: TaskChanges): Promise<TaskChanges> {
    // задача створена в цій сесії: сервер її не знає, зміни лишаються на клієнті
    if (sessionCreatedIds.has(id)) return changes;

    const payload: { todo?: string; completed?: boolean } = {};
    if (changes.title !== undefined) payload.todo = changes.title;
    if (changes.completed !== undefined) payload.completed = changes.completed;

    const updated = await request<ApiTodo>(`/todos/${id}`, {
      method: 'PATCH',
      body: payload,
    });
    return { title: updated.todo, completed: updated.completed };
  },

  async delete(id: number): Promise<void> {
    if (sessionCreatedIds.has(id)) {
      sessionCreatedIds.delete(id);
      return;
    }
    await request<unknown>(`/todos/${id}`, { method: 'DELETE' });
  },
};