import { useTaskContext } from '../hooks/useTaskContext';
import TaskItem from './TaskItem';
import './TaskList.scss';

//якщо завдань немає, покажи повідомлення, і далі код не виконується
function TaskList() {
  const { tasks, filter } = useTaskContext();

  // derived state: відфільтрований список обчислюється під час render
  const visibleTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return true;
  });

  if (tasks.length === 0) {
    return (
      <div className="task-list__empty">
        <p>Завдань поки немає.</p>
        <p>Додайте перше навчальне завдання.</p>
      </div>
    );
  }

  if (visibleTasks.length === 0) {
    return <p className="task-list__empty">За цим фільтром завдань немає.</p>;
  }

  return (
    <ul className="task-list">
      {visibleTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
}

export default TaskList;