import { useEffect, useState } from 'react';
import { isAbortError } from '../api/httpClient';
import { toErrorMessage } from '../api/errorMessage';
import { taskRepository } from '../repositories/taskRepository';
import type { NewTask, Task } from '../types/task';

export const PAGE_SIZE = 10;

//Задаємо три можливі стани завантаження
export type LoadStatus = 'loading' | 'success' | 'error';

interface TasksState {
  status: LoadStatus;
  tasks: Task[];
  total: number;
  error: string | null;
}

export function useTasks() {
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  // server state: зберігається поточний стан даних із сервера
  const [state, setState] = useState<TasksState>({
    status: 'loading',   //один із тих трьох варіантів
    tasks: [],           //масив задач
    total: 0,            //кількість задач
    error: null,         //текст помилки
  });

  useEffect(() => {
    //На кожен новий запит ми створюємо свою окрему «кнопку стоп» (controller), щоб керувати саме цим запитом.
    const controller = new AbortController();

    taskRepository
      .getAll({
        limit: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,  // Рахуємо, скільки записів пропустити для поточної сторінки (для 1-ї сторінки skip = 0)
        signal: controller.signal,
      })
      .then((result) => {
        setState({
          status: 'success',
          tasks: result.tasks,
          total: result.total,
          error: null,
        });
      })

      .catch((error: unknown) => {
        // Якщо запит скасували навмисне — нічого не робимо, це не помилка для користувача
        if (isAbortError(error)) return;

        setState((prev) => ({
          ...prev,
          status: 'error',
          error: toErrorMessage(error),
        }));
      });

    // Скасовуємо попередній запит при зміні сторінки/перезапуску сторінки,
    // щоб стара відповідь не перезаписала нові дані
    return () => controller.abort();
  }, [page, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));

  const goToPage = (next: number) => {
    const target = Math.min(Math.max(next, 1), totalPages);
    if (target === page) return; 
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    setPage(target);
  };

  //Коли сталась помилка і користувач тисне «Спробувати ще», retry ставить status: 'loading' і збільшує reloadKey на 1
  const retry = () => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    setReloadKey((key) => key + 1);
  };

  // POST: після успіху оновлюємо server state без перезавантаження сторінки.
  const createTask = async (values: NewTask): Promise<void> => {
    const created = await taskRepository.create(values);
    setState((prev) => ({
      ...prev,
      tasks: [created, ...prev.tasks],
      total: prev.total + 1,
    }));
  };

  // PATCH: накладаємо на задачу лише ті поля, які підтвердив сервер
  const toggleTask = async (id: number): Promise<void> => {
    const current = state.tasks.find((task) => task.id === id);
    if (!current) return;

    const applied = await taskRepository.update(id, {
      completed: !current.completed,
    });

    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, ...applied } : task,
      ),
    }));
  };

  // PATCH назви + client-only поля. На сервер іде лише title,
  const updateTask = async (id: number, values: NewTask): Promise<void> => {
    const applied = await taskRepository.update(id, { title: values.title });

    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id ? { ...task, ...values, ...applied } : task,
      ),
    }));
  };

    // DELETE: список оновлюємо лише після успішної відповіді
  const deleteTask = async (id: number): Promise<void> => {
    await taskRepository.delete(id);
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
      total: Math.max(0, prev.total - 1),
    }));
  };

  // Видаляє всі виконані на поточній сторінці. Повертає, скільки не вдалося:
  // успішні прибираємо зі state, невдалі лишаються в списку
  const clearCompleted = async (): Promise<number> => {
    const ids = state.tasks.filter((task) => task.completed).map((task) => task.id);
    const results = await Promise.allSettled(
      ids.map((id) => taskRepository.delete(id)),
    );
    const deletedIds = ids.filter((_, i) => results[i].status === 'fulfilled');

    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => !deletedIds.includes(task.id)),
      total: Math.max(0, prev.total - deletedIds.length),
    }));
    return ids.length - deletedIds.length;
  };

  return {
    tasks: state.tasks,
    status: state.status,
    error: state.error,
    isEmpty: state.status === 'success' && state.tasks.length === 0,
    total: state.total,
    page,
    totalPages,
    goToPage,
    retry,
    createTask,
    toggleTask,
    updateTask,
    deleteTask,
    clearCompleted
  };
}