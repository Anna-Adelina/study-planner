import { initialTasks } from '../data/initialTasks';
import type { NewTask, Task, TaskState } from '../types/task';

export type TaskAction =
  | { type: 'add'; payload: Task }
  | { type: 'toggle'; payload: { id: number } }
  | { type: 'update'; payload: { id: number; changes: NewTask } }
  | { type: 'requestDelete'; payload: { id: number } }
  | { type: 'confirmDelete' }
  | { type: 'undoDelete' }
  | { type: 'clearCompleted' }
  | { type: 'reset' };

export function createInitialState(tasks: Task[] = initialTasks): TaskState {
  return { tasks, pendingDeletion: null };
}

const removeByIds = (tasks: Task[], ids: number[]): Task[] =>
  tasks.filter((task) => !ids.includes(task.id));

export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'add':
      return { ...state, tasks: [...state.tasks, action.payload] };

    //чиста функція
    case 'toggle':
      return {
        ...state, //створюються нові об'єкти
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id //шукає чий id збігається з переданим у action.payload.id.
            ? { ...task, completed: !task.completed }  //Якщо ID збігся, створює копію цього завдання з значенням completed
            : task,
        ),
      };

    case 'update':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.changes }
            : task,
        ),
      };

    case 'requestDelete': {
      if (!state.tasks.some((task) => task.id === action.payload.id)) {
        return state;
      }
      // Одне активне видалення одночасно: попереднє підтверджуємо
      const tasks = state.pendingDeletion
        ? removeByIds(state.tasks, state.pendingDeletion.ids)
        : state.tasks;
      return {
        tasks,
        pendingDeletion: { ids: [action.payload.id], kind: 'single' },
      };
    }

    case 'clearCompleted': {
      // Спочатку підтверджуємо попереднє видалення (якщо є)
      const tasks = state.pendingDeletion
        ? removeByIds(state.tasks, state.pendingDeletion.ids)
        : state.tasks;
      const ids = tasks.filter((task) => task.completed).map((task) => task.id);
      if (ids.length === 0) return state;
      return { tasks, pendingDeletion: { ids, kind: 'completed' } };
    }

    case 'confirmDelete':
      if (!state.pendingDeletion) return state;
      return {
        tasks: removeByIds(state.tasks, state.pendingDeletion.ids),
        pendingDeletion: null,
      };

    case 'undoDelete':
      if (!state.pendingDeletion) return state;
      return { ...state, pendingDeletion: null };

    case 'reset':
      return createInitialState();

    default:
      return state;
  }
}