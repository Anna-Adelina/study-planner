import { useTaskContext } from '../hooks/useTaskContext';
import type { LoadStatus } from '../hooks/useTasks';
import type { Task } from '../types/task';
import TaskItem from './TaskItem';
import './TaskList.scss';

interface TaskListProps {
  tasks: Task[];
  status: LoadStatus;
  error: string | null;
  isEmpty: boolean;
  onRetry: () => void;
  onSelect: (task: Task) => void;
  onToggle: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function TaskList({ tasks, status, error, isEmpty, onRetry, onSelect, onToggle, onDelete }: TaskListProps) {
  const { filter } = useTaskContext();

  // Поки запит виконується — показуємо індикатор завантаження
  if (status === 'loading') {
    return (
      <p className="task-list__empty" role="status">
        Loading...
      </p>
    );
  }

  // Якщо сталася помилка — показуємо текст помилки і кнопку повтору запиту
  if (status === 'error') {
    return (
      <div className="task-list__error" role="alert">
        <p>{error ?? 'Помилка завантаження.'}</p>
        <button className="task-list__retry" type="button" onClick={onRetry}>
          Спробувати ще
        </button>
      </div>
    );
  }

  // Успішний запит, але задач на сторінці немає — виводимо порожній стан
  if (isEmpty) {
    return <p className="task-list__empty">Завдань не знайдено.</p>;
  }

  const visibleTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return true;
  });

  if (visibleTasks.length === 0) {
    return <p className="task-list__empty">За цим фільтром завдань немає.</p>;
  }

  // Якщо попередні перевірки пройшли — малюємо відфільтрований список задач
  return (
    <ul className="task-list">
      {visibleTasks.map((task) => (
        <TaskItem key={task.id} task={task} onSelect={onSelect} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}

export default TaskList;