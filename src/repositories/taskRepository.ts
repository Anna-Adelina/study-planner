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

// DummyJSON лише симулює POST/PATCH/DELETE: сервер нічого не зберігає.
// Тому repository сам пам'ятає, що ми «змінили» за цю сесію,
// і накладає це на відповіді сервера (як стікери з поправками).
const localChanges = new Map<number, TaskChanges>();
// Задачі, створені в цій сесії: сервер їх не знає (PATCH/DELETE дали б 404)
const sessionTasks = new Map<number, Task>();
let nextLocalId = 1_000_000; // далеко від id, які існують на сервері

function withLocalChanges(task: Task): Task {
  return { ...task, ...localChanges.get(task.id) };
}

function rememberChanges(id: number, changes: TaskChanges): void {
  localChanges.set(id, { ...localChanges.get(id), ...changes });
}

export const taskRepository = {
  async getAll({ limit, skip, signal }: GetAllParams): Promise<TaskPage> {
    const data = await request<TodosResponse>(
      `/todos?limit=${limit}&skip=${skip}`,
      { signal },
    );
    return {
      tasks: data.todos.map(toTask).map(withLocalChanges),
      total: data.total,
      skip: data.skip,
      limit: data.limit,
    };
  },

  async getById(id: number, signal?: AbortSignal): Promise<Task> {
    // задача створена в цій сесії: сервер її не знає
    const local = sessionTasks.get(id);
    if (local) return withLocalChanges(local);

    const todo = await request<ApiTodo>(`/todos/${id}`, { signal });
    return withLocalChanges(toTask(todo));
  },

  async create(newTask: NewTask): Promise<Task> {
    const created = await request<ApiTodo>('/todos/add', {
      method: 'POST',
      body: toApiPayload({ title: newTask.title, completed: false }),
    });
    // DummyJSON щоразу повертає той самий id, а id у списку має бути унікальним
    const id = sessionTasks.has(created.id) ? nextLocalId++ : created.id;
    // client-only поля (description, priority, category) беремо з форми
    const task: Task = { ...toTask(created), ...newTask, id };
    sessionTasks.set(id, task);
    return task;
  },

  // Повертає лише те, що застосовано; решту полів UI лишає як є
  async update(id: number, changes: TaskChanges): Promise<TaskChanges> {
    // задача створена в цій сесії: зміни лишаються на клієнті
    if (sessionTasks.has(id)) {
      rememberChanges(id, changes);
      return changes;
    }

    const payload: { todo?: string; completed?: boolean } = {};
    if (changes.title !== undefined) payload.todo = changes.title;
    if (changes.completed !== undefined) payload.completed = changes.completed;

    const updated = await request<ApiTodo>(`/todos/${id}`, {
      method: 'PATCH',
      body: payload,
    });

    // повертаємо лише відправлені поля: у симульованій відповіді решта застаріла
    const applied: TaskChanges = {};
    if (changes.title !== undefined) applied.title = updated.todo;
    if (changes.completed !== undefined) applied.completed = updated.completed;
    rememberChanges(id, applied);
    return applied;
  },

  async delete(id: number): Promise<void> {
    if (!sessionTasks.has(id)) {
      await request<unknown>(`/todos/${id}`, { method: 'DELETE' });
    }
    // чистимо стікери лише після успіху
    sessionTasks.delete(id);
    localChanges.delete(id);
  },
};