import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskStats from './components/TaskStats';
import TaskFilters from './components/TaskFilters';
import TaskList from './components/TaskList';
import Pagination from './components/Pagination';
import Toast from './components/Toast';
import { useEffect } from 'react';
import { useTaskContext } from './hooks/useTaskContext';
import { useTasks } from './hooks/useTasks';
import './App.scss';

function App() {
  // client/UI state
  const { editingTask } = useTaskContext();
  // server state
  const {
    tasks,
    status,
    error,
    isEmpty,
    total,
    page,
    totalPages,
    goToPage,
    retry,
  } = useTasks();

  // derived state: рахуємо під час render
  const activeCount = tasks.filter((task) => !task.completed).length;

  // Effect: оновлює заголовок сторінки браузера
  useEffect(() => {
    document.title = `Study Planner — ${activeCount} active tasks`;
  }, [activeCount]);

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <TaskForm key={editingTask?.id ?? 'new'} />
        <TaskStats tasks={tasks} total={total} />
        <TaskFilters />
        <TaskList
          tasks={tasks}
          status={status}
          error={error}
          isEmpty={isEmpty}
          onRetry={retry}
        />
        <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
      </main>
      <Toast />
    </div>
  );
}

export default App;