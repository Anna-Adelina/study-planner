import { useState } from 'react';
import { useTaskContext } from '../hooks/useTaskContext';
import type { FilterMode, Task } from '../types/task';
import './TaskFilters.scss';

const filters: { value: FilterMode; label: string }[] = [
  { value: 'all', label: 'Всі' },
  { value: 'completed', label: 'Виконані' },
  { value: 'active', label: 'Не виконані' },
];

interface TaskFiltersProps {
  tasks: Task[];
  // повертає, скільки задач не вдалося видалити
  onClearCompleted: () => Promise<number>;
}

function TaskFilters({ tasks, onClearCompleted }: TaskFiltersProps) {
  const { filter, setFilter, showToast } = useTaskContext();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // derived state
  const completedCount = tasks.filter((task) => task.completed).length;
  const showConfirm = isConfirming && completedCount > 0;

  const handleClear = async () => {
    setIsClearing(true);
    try {
      const failed = await onClearCompleted();
      if (failed === 0) {
        showToast('Виконані завдання видалено');
      } else {
        showToast(`Не вдалося видалити завдань: ${failed}`, 'error');
      }
    } finally {
      setIsClearing(false);
      setIsConfirming(false);
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

      {showConfirm ? (
        <>
          <span className="task-filters__confirm-text">
            Видалити виконані на сторінці ({completedCount})?
          </span>
          <button
            type="button"
            className="task-filters__clear"
            disabled={isClearing}
            onClick={handleClear}
          >
            {isClearing ? '...' : 'Так'}
          </button>
          <button
            type="button"
            className="task-filters__button"
            disabled={isClearing}
            onClick={() => setIsConfirming(false)}
          >
            Ні
          </button>
        </>
      ) : (
        <button
          type="button"
          className="task-filters__clear"
          disabled={completedCount === 0}
          onClick={() => setIsConfirming(true)}
        >
          Очистити виконані
        </button>
      )}
    </div>
  );
}

export default TaskFilters;