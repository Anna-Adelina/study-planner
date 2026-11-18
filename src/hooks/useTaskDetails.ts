import { useEffect, useState } from 'react';
import { isAbortError } from '../api/httpClient';
import { toErrorMessage } from '../api/errorMessage';
import { taskRepository } from '../repositories/taskRepository';
import type { LoadStatus } from './useTasks';
import type { Task } from '../types/task';

interface DetailsState {
  status: LoadStatus;
  task: Task | null;
  error: string | null;
}

export function useTaskDetails(taskId: number) {
  const [reloadKey, setReloadKey] = useState(0);
  // початковий стан — loading; новий taskId = нове монтування (через key в App)
  const [state, setState] = useState<DetailsState>({
    status: 'loading',
    task: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    taskRepository
      .getById(taskId, controller.signal)
      .then((task) => setState({ status: 'success', task, error: null }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return; // скасований запит — не помилка
        setState({ status: 'error', task: null, error: toErrorMessage(error) });
      });

    return () => controller.abort();
  }, [taskId, reloadKey]);

  const retry = () => {
    setState({ status: 'loading', task: null, error: null });
    setReloadKey((key) => key + 1);
  };

  return { ...state, retry };
}