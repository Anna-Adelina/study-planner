import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskStats from './components/TaskStats';
import TaskFilters from './components/TaskFilters';
import TaskList from './components/TaskList';
import Toast from './components/Toast';
import { useEffect } from 'react';
import { useTaskContext } from './hooks/useTaskContext';
import './App.scss';

function App() {
  const { tasks, editingTask } = useTaskContext();

  // derived state: рахуємо під час render
  const activeCount = tasks.filter((task) => !task.completed).length;

  // Effect: синхронізація React state із document.title
  useEffect(() => {
    document.title = `Study Planner — ${activeCount} active tasks`;
  }, [activeCount]);

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <TaskForm key={editingTask?.id ?? 'new'} />
        <TaskStats />
        <TaskFilters />
        <TaskList />
      </main>
      <Toast />
    </div>
  );
}

export default App;