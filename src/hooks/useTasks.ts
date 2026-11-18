import { useEffect, useState } from 'react';
import { isAbortError } from '../api/httpClient';
import { toErrorMessage } from '../api/errorMessage';
import { taskRepository } from '../repositories/taskRepository';
import type { Task } from '../types/task';

export const PAGE_SIZE = 10;

export type LoadStatus = 'loading' | 'success' | 'error';

interface TasksState {
  status: LoadStatus;
  tasks: Task[];
  total: number;
  error: string | null;
}

export function useTasks() {
  // client/UI state: яку сторінку хоче бачити користувач
  const [page, setPage] = useState(1);
  // лічильник для кнопки «Спробувати ще»
  const [reloadKey, setReloadKey] = useState(0);
  // server state: те, що прийшло з API
  const [state, setState] = useState<TasksState>({
    status: 'loading',
    tasks: [],
    total: 0,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    taskRepository
      .getAll({
        limit: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
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
        // скасований запит — не помилка для користувача
        if (isAbortError(error)) return;
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: toErrorMessage(error),
        }));
      });

    // cleanup: нова сторінка або демонтаж → скасовуємо попередній запит
    return () => controller.abort();
  }, [page, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));

  const goToPage = (next: number) => {
    const target = Math.min(Math.max(next, 1), totalPages);
    if (target === page) return; // інакше застрягнемо в loading без нового запиту
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    setPage(target);
  };

  const retry = () => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    setReloadKey((key) => key + 1);
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
  };
}