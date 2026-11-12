import { useTaskContext } from '../hooks/useTaskContext';
import type { FilterMode } from '../types/task';
import './TaskFilters.scss';

const filters: { value: FilterMode; label: string }[] = [
  { value: 'all', label: 'Всі' },
  { value: 'completed', label: 'Виконані' },
  { value: 'active', label: 'Не виконані' },
];

function TaskFilters() {
  const { tasks, filter, setFilter, clearCompleted, resetTasks } = useTaskContext();
  const hasCompleted = tasks.some((task) => task.completed);
  const handleReset = () => {
    if (window.confirm('Скинути всі завдання до початкових? Ваші зміни буде втрачено.')) {
      resetTasks();
    }
  };

  return (
    <div className="task-filters">
      {filters.map((item) => (
        <button
          key={item.value}
          type="button"
          className={
            item.value === filter
              ? 'task-filters__button task-filters__button--active' //активна кнопка
              : 'task-filters__button'
          }
          onClick={() => setFilter(item.value)}
        >
          {item.label}
        </button>
      ))}

      <button
        type="button"
        className="task-filters__clear"
        disabled={!hasCompleted}
        onClick={clearCompleted}
      >
        Очистити виконані
      </button>

      <button
        type="button"
        className="task-filters__reset"
        onClick={handleReset}
      >
        Скинути дані
      </button>
    </div>
  );
}

export default TaskFilters;