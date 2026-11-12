import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskStats from './components/TaskStats';
import TaskFilters from './components/TaskFilters';
import TaskList from './components/TaskList';
import { useTaskContext } from './hooks/useTaskContext';
import './App.scss';

function App() {
  const { editingTask } = useTaskContext();

  //корінь, обгортка app__main
  return (
    <div className="app">
      <Header />
      <main className="app__main">
        {/* key перемонтовує форму: нове завдання ↔ редагування ↔ інше завдання */}
        <TaskForm key={editingTask?.id ?? 'new'} />
        <TaskStats />
        <TaskFilters />
        <TaskList />
      </main>
    </div>
  );
}

export default App;