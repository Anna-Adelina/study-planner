import { useState } from 'react';
import type { FormEvent } from 'react';
import type { NewTask, Priority } from '../types/task';
import './TaskForm.scss';

interface TaskFormProps {
  onAddTask: (task: NewTask) => void;
}

function TaskForm({ onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (title.trim() === '') {
      setError('Назва завдання обов’язкова');
      return;
    }

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'Без категорії',
      priority,
    });

    setTitle('');
    setDescription('');
    setCategory('');
    setPriority('medium');
    setError('');
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form__field">
        <label className="task-form__label" htmlFor="task-title">
          Назва
        </label>
        <input
          id="task-title"
          className="task-form__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {error && <p className="task-form__error">{error}</p>}
      </div>

      <div className="task-form__field">
        <label className="task-form__label" htmlFor="task-description">
          Опис
        </label>
        <textarea
          id="task-description"
          className="task-form__input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="task-form__field">
        <label className="task-form__label" htmlFor="task-category">
          Категорія
        </label>
        <input
          id="task-category"
          className="task-form__input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      <div className="task-form__field">
        <label className="task-form__label" htmlFor="task-priority">
          Пріоритет
        </label>
        <select
          id="task-priority"
          className="task-form__input"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
        >
          <option value="low">Низький</option>
          <option value="medium">Середній</option>
          <option value="high">Високий</option>
        </select>
      </div>

      <button className="task-form__button" type="submit">
        Додати
      </button>
    </form>
  );
}

export default TaskForm;