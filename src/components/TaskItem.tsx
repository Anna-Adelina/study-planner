import { useState } from 'react';
import { useTaskContext } from '../hooks/useTaskContext';
import { priorityLabels, type Task } from '../types/task';
import './TaskItem.scss';

interface TaskItemProps {
  task: Task;
  onSelect: (task: Task) => void;
  onToggle: (id: number) => Promise<void>;
}

function TaskItem({ task, onSelect, onToggle }: TaskItemProps) {
  const { pendingDeletion, requestDelete, startEdit, showToast } = useTaskContext();
  // UI state: чи йде зараз запит на зміну статусу цієї задачі
  const [isToggling, setIsToggling] = useState(false);

  // derived state: чи очікує це завдання на видалення
  const isPendingDelete = pendingDeletion?.ids.includes(task.id) ?? false;

  const className = [
    'task-item',
    task.completed && 'task-item--completed',
    isPendingDelete && 'task-item--pending',
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
            {isPendingDelete
              ? 'Буде видалено'
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
          disabled={isPendingDelete || isToggling}
          onClick={handleToggle}
        >
          {isToggling ? '...' : task.completed ? 'Повернути' : 'Виконано'}
        </button>

        <button
          className="task-item__button"
          type="button"
          disabled={isPendingDelete}
          onClick={() => startEdit(task.id)}
        >
          Редагувати
        </button>

        {task.completed && (
          <button
            className="task-item__button task-item__button--danger"
            type="button"
            disabled={isPendingDelete}
            onClick={() => requestDelete(task.id)}
          >
            Видалити
          </button>
        )}
      </div>
    </li>
  );
}

export default TaskItem;