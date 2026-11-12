import { useTaskContext } from '../hooks/useTaskContext';
import './TaskStats.scss';

function TaskStats() {
  const { tasks } = useTaskContext();

  // derived state: рахуємо під час render, без useEffect
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const active = total - completed;

  return (
    <div className="task-stats">
      <span className="task-stats__item">Всього: {total}</span>
      <span className="task-stats__item">Виконано: {completed}</span>
      <span className="task-stats__item">Не виконано: {active}</span>
    </div>
  );
}

export default TaskStats;