import { useState } from 'react';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskStats from './components/TaskStats';
import TaskFilters from './components/TaskFilters';
import TaskList from './components/TaskList';
import { initialTasks } from './data/initialTasks';
import type { FilterMode, NewTask, Task } from './types/task';
import './App.scss';

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<FilterMode>('all');

  const handleAddTask = (newTask: NewTask) => {
    setTasks((prev) => [
      ...prev,
      { ...newTask, id: Date.now(), completed: false },
    ]);
  };

  const handleToggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((task) => !task.completed));
  };

  const hasCompleted = tasks.some((task) => task.completed);

  const visibleTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    return true;
  });

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <TaskForm onAddTask={handleAddTask} />
        <TaskStats tasks={tasks} />
        <TaskFilters 
          currentFilter={filter}
          onFilterChange={setFilter}
          hasCompleted={hasCompleted}
          onClearCompleted={handleClearCompleted} 
        />
        <TaskList
          tasks={visibleTasks}
          totalCount={tasks.length}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
        />
      </main>
    </div>
  );
}

export default App;