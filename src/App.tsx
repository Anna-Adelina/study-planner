import { useState } from 'react';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { initialTasks } from './data/initialTasks';
import type { NewTask, Task } from './types/task';
import './App.scss';

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

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

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <TaskForm onAddTask={handleAddTask} />
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