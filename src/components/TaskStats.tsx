import type { Task } from '../types/task';
import './TaskStats.scss';

interface TaskStatsProps {
  tasks: Task[];
  total: number;
}

function TaskStats({ tasks, total }: TaskStatsProps) {
  // derived state: рахуємо під час render
  const completed = tasks.filter((task) => task.completed).length;
  const active = tasks.length - completed;

  return (
    <div className="task-stats">
      <span className="task-stats__item">Всього: {total}</span>
      <span className="task-stats__item">Виконано на сторінці: {completed}</span>
      <span className="task-stats__item">Не виконано на сторінці: {active}</span>
    </div>
  );
}

export default TaskStats;