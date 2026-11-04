import type { FilterMode } from '../types/task';
import './TaskFilters.scss';

interface TaskFiltersProps {
  currentFilter: FilterMode;
  onFilterChange: (filter: FilterMode) => void;
}

const filters: { value: FilterMode; label: string }[] = [
  { value: 'all', label: 'Всі' },
  { value: 'completed', label: 'Виконані' },
  { value: 'active', label: 'Не виконані' },
];

function TaskFilters({ currentFilter, onFilterChange }: TaskFiltersProps) {
  return (
    <div className="task-filters">
      {filters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          className={
            filter.value === currentFilter
              ? 'task-filters__button task-filters__button--active'
              : 'task-filters__button'
          }
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default TaskFilters;