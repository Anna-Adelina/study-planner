import type { Task } from '../types/task';
import TaskItem from './TaskItem';
import './TaskList.scss';

interface TaskListProps {
  tasks: Task[];
  totalCount: number;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

function TaskList({ tasks, totalCount, onToggle, onDelete }: TaskListProps) {
  if (totalCount === 0) {
    return (
      <div className="task-list__empty">
        <p>Завдань поки немає.</p>
        <p>Додайте перше навчальне завдання.</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return <p className="task-list__empty">За цим фільтром завдань немає.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

export default TaskList;