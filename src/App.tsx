import { useEffect, useState } from 'react';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskDetails from './components/TaskDetails';
import TaskStats from './components/TaskStats';
import TaskFilters from './components/TaskFilters';
import TaskList from './components/TaskList';
import Pagination from './components/Pagination';
import Toast from './components/Toast';
import { useTaskContext } from './hooks/useTaskContext';
import { useTasks } from './hooks/useTasks';
import './App.scss';

function App() {
  // client/UI state
  const { editingId, cancelEdit } = useTaskContext();
  // зберігаємо лише id, а не копію задачі: так дані не дублюються
  const [selectedId, setSelectedId] = useState<number | null>(null);

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
    createTask,
    toggleTask,
    updateTask,
    deleteTask,
    clearCompleted,
  } = useTasks();

  // derived state: знаходимо задачі у server state під час render
  const editingTask = tasks.find((task) => task.id === editingId) ?? null;
  const selectedTask = tasks.find((task) => task.id === selectedId) ?? null;

  const activeCount = tasks.filter((task) => !task.completed).length;

  // Effect: оновлює заголовок сторінки браузера
  useEffect(() => {
    document.title = `Study Planner — ${activeCount} active tasks`;
  }, [activeCount]);

  const handleDelete = async (id: number) => {
    await deleteTask(id);
    // деталі закриються самі: видалена задача зникла з tasks, і selectedTask став null
    if (editingId === id) cancelEdit();
  };

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <TaskForm
          key={editingTask?.id ?? 'new'}
          editingTask={editingTask}
          onCreate={createTask}
          onUpdate={updateTask}
        />

        {selectedTask && (
          <TaskDetails
            // змінився статус чи назва: перемонтовуємо, і деталі завантажуються заново
            key={`${selectedTask.id}-${selectedTask.title}-${selectedTask.completed}`}
            task={selectedTask}
            onClose={() => setSelectedId(null)}
          />
        )}

        <TaskStats tasks={tasks} total={total} />
        <TaskFilters tasks={tasks} onClearCompleted={clearCompleted} />
        <TaskList
          tasks={tasks}
          status={status}
          error={error}
          isEmpty={isEmpty}
          onRetry={retry}
          onSelect={(task) => setSelectedId(task.id)}
          onToggle={toggleTask}
          onDelete={handleDelete}
        />
        <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
      </main>
      <Toast />
    </div>
  );
}

export default App;