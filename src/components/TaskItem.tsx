import { useTaskContext } from '../hooks/useTaskContext';
import type { Task } from '../types/task';
import './TaskItem.scss';

interface TaskItemProps {
  task: Task;
}

const priorityLabels = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
};

function TaskItem({ task }: TaskItemProps) {
  const { pendingDeletion, toggleTask, requestDelete } = useTaskContext();

  // derived state: чи очікує це завдання на видалення
  const isPendingDelete = pendingDeletion?.ids.includes(task.id) ?? false;

  const className = [
    'task-item',
    task.completed && 'task-item--completed',
    isPendingDelete && 'task-item--pending',
  ]
    .filter(Boolean)
    .join(' ');

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
          disabled={isPendingDelete}
          onClick={() => toggleTask(task.id)}
        >
          {task.completed ? 'Повернути' : 'Виконано'}
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