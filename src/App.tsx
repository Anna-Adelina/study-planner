import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskStats from './components/TaskStats';
import TaskFilters from './components/TaskFilters';
import TaskList from './components/TaskList';
import './App.scss';

function App() {
  //корінь, обгортка app__main
  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <TaskForm />
        <TaskStats />
        <TaskFilters />
        <TaskList />
      </main>
    </div>
  );
}

export default App;