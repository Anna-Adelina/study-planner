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

export type TaskChanges = Partial<Pick<Task, 'title' | 'completed'>>;

//DummyJSON лише імітує запити і нічого не зберігає.
//localChanges і sessionTasks запам'ятовують зміни на час сесії й накладають їх на відповідь сервера. 
const localChanges = new Map<number, TaskChanges>();
const sessionTasks = new Map<number, Task>();

let nextLocalId = 1_000_000; 

function withLocalChanges(task: Task): Task {
  return { ...task, ...localChanges.get(task.id) };
}

function rememberChanges(id: number, changes: TaskChanges): void {
  localChanges.set(id, { ...localChanges.get(id), ...changes });
}

//getAll, getById, create, update, delete
export const taskRepository = {
  async getAll({ limit, skip, signal }: GetAllParams): Promise<TaskPage> {
    const data = await request<TodosResponse>(
      //Шлях (endpoint) до ресурсу на сервері та параметри пагінації (limit — скільки взяти, skip — скільки пропустити).
      `/todos?limit=${limit}&skip=${skip}`,
      { signal },
    );
    return {
      // data.todos.map(toTask) - Переводимо формат API (поле todo) у нашу модель задачі (title) через toTask
      tasks: data.todos.map(toTask).map(withLocalChanges),
      total: data.total,
      skip: data.skip,
      limit: data.limit,
    };
  },

  async getById(id: number, signal?: AbortSignal): Promise<Task> {

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

    const id = sessionTasks.has(created.id) ? nextLocalId++ : created.id;

    const task: Task = { ...toTask(created), ...newTask, id };
    sessionTasks.set(id, task);
    return task;
  },

  async update(id: number, changes: TaskChanges): Promise<TaskChanges> {

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
    sessionTasks.delete(id);
    localChanges.delete(id);
  },
};