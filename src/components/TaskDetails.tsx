import { useTaskDetails } from '../hooks/useTaskDetails';
import { priorityLabels } from '../types/task';
import type { Task } from '../types/task';
import './TaskDetails.scss';

interface TaskDetailsProps {
  task: Task; // знімок зі списку: звідси беремо client-only поля
  onClose: () => void;
}

function TaskDetails({ task, onClose }: TaskDetailsProps) {
  const { status, task: fresh, error, retry } = useTaskDetails(task.id);

  // title і completed — свіжі з сервера, решту API не зберігає
  const details = fresh
    ? { ...task, title: fresh.title, completed: fresh.completed }
    : null;

  return (
    <section className="task-details" aria-label="Деталі завдання">
      <div className="task-details__header">
        <h2 className="task-details__heading">Деталі завдання</h2>
        <button className="task-details__close" type="button" onClick={onClose}>
          Закрити
        </button>
      </div>

      {status === 'loading' && (
        <p className="task-details__state" role="status">
          Loading...
        </p>
      )}

      {status === 'error' && (
        <div className="task-details__error" role="alert">
          <p>{error}</p>
          <button className="task-details__retry" type="button" onClick={retry}>
            Спробувати ще
          </button>
        </div>
      )}

      {status === 'success' && details && (
        <dl className="task-details__list">
          <dt className="task-details__term">Назва</dt>
          <dd className="task-details__value">{details.title}</dd>
          <dt className="task-details__term">Опис</dt>
          <dd className="task-details__value">{details.description || '—'}</dd>
          <dt className="task-details__term">Категорія</dt>
          <dd className="task-details__value">{details.category}</dd>
          <dt className="task-details__term">Пріоритет</dt>
          <dd className="task-details__value">{priorityLabels[details.priority]}</dd>
          <dt className="task-details__term">Статус</dt>
          <dd className="task-details__value">
            {details.completed ? 'Виконано' : 'Не виконано'}
          </dd>
        </dl>
      )}
    </section>
  );
}

export default TaskDetails;