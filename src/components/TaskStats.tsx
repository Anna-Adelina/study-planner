import type { Task } from '../types/task';
import './TaskStats.scss';

interface TaskStatsProps {
  tasks: Task[];
}

function TaskStats({ tasks }: TaskStatsProps) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const active = total - completed;

  // JSX вставляється JavaScript-вираз через дужки
  return (
    <div className="task-stats">
      <span className="task-stats__item">Всього: {total}</span> 
      <span className="task-stats__item">Виконано: {completed}</span>
      <span className="task-stats__item">Не виконано: {active}</span>
    </div>
  );
}

export default TaskStats;