import type { Task } from '../types/task';
import './TaskItem.scss';

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const priorityLabels = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
};

function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <li className={task.completed ? 'task-item task-item--completed' : 'task-item'}>
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
            {task.completed ? 'Виконано' : 'Не виконано'}
          </span>
        </div>
      </div>

      <div className="task-item__actions">
        <button
          className="task-item__button"
          type="button"
          onClick={() => onToggle(task.id)}
        >
          {task.completed ? 'Повернути' : 'Виконано'}
        </button>
        {task.completed && (
          <button
            className="task-item__button task-item__button--danger"
            type="button"
            onClick={() => onDelete(task.id)}
          >
            Видалити
          </button>
        )}
      </div>
    </li>
  );
}

export default TaskItem;