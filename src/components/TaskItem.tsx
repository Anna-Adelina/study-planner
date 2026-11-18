import { useState } from 'react';
import { useTaskContext } from '../hooks/useTaskContext';
import { priorityLabels, type Task } from '../types/task';
import './TaskItem.scss';

interface TaskItemProps {
  task: Task;
  onSelect: (task: Task) => void;
  onToggle: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function TaskItem({ task, onSelect, onToggle, onDelete }: TaskItemProps) {
  const { startEdit, showToast } = useTaskContext();
  // UI state цієї картки
  const [isToggling, setIsToggling] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const className = [
    'task-item',
    task.completed && 'task-item--completed',
    isDeleting && 'task-item--pending',
  ]
    .filter(Boolean)
    .join(' ');

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(task.id);
    } catch {
      showToast('Не вдалося змінити статус завдання', 'error');
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
      showToast('Завдання видалено');
      // успіх: картка зникне зі списку разом зі своїм state
    } catch {
      showToast('Не вдалося видалити завдання', 'error');
      setIsDeleting(false); // підтвердження лишається відкритим: можна повторити
    }
  };

  return (
    <li className={className}>
      <div className="task-item__content">
        <h3 className="task-item__title">{task.title}</h3>
        {task.description && (
          <p className="task-item__description">{task.description}</p>
        )}
        <div className="task-item__meta">
          <span className="task-item__category">{task.category}</span>
          <span className={`task-item__priority task-item__priority--${task.priority}`}>
            {priorityLabels[task.priority]}
          </span>
          <span className="task-item__status">
            {isDeleting
              ? 'Видаляється...'
              : task.completed
                ? 'Виконано'
                : 'Не виконано'}
          </span>
        </div>
      </div>

      <div className="task-item__actions">
        <button
          className="task-item__button"
          type="button"
          onClick={() => onSelect(task)}
        >
          Деталі
        </button>

        <button
          className="task-item__button"
          type="button"
          disabled={isDeleting || isToggling}
          onClick={handleToggle}
        >
          {isToggling ? '...' : task.completed ? 'Повернути' : 'Виконано'}
        </button>

        <button
          className="task-item__button"
          type="button"
          disabled={isDeleting}
          onClick={() => startEdit(task.id)}
        >
          Редагувати
        </button>

        {task.completed &&
          (isConfirmingDelete ? (
            <>
              <span className="task-item__confirm-text">Видалити завдання?</span>
              <button
                className="task-item__button task-item__button--danger"
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? '...' : 'Так, видалити'}
              </button>
              <button
                className="task-item__button"
                type="button"
                disabled={isDeleting}
                onClick={() => setIsConfirmingDelete(false)}
              >
                Ні
              </button>
            </>
          ) : (
            <button
              className="task-item__button task-item__button--danger"
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
            >
              Видалити
            </button>
          ))}
      </div>
    </li>
  );
}

export default TaskItem;