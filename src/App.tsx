import { useState } from 'react';
import Header from './components/Header';
import TaskList from './components/TaskList';
import { initialTasks } from './data/initialTasks';
import type { Task } from './types/task';
import './App.scss';

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

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

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <TaskList
          tasks={tasks}
          totalCount={tasks.length}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
        />
      </main>
    </div>
  );
}

export default App;