import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTaskContext } from '../hooks/useTaskContext';
import type { Priority } from '../types/task';
import './TaskForm.scss';

function TaskForm() {
  const { addTask, updateTask, editingTask, cancelEdit, showToast } = useTaskContext();
  const isEditing = editingTask !== null;

  // початкові значення беремо із завдання, яке редагуємо (якщо воно є)
  const [title, setTitle] = useState(editingTask?.title ?? '');
  const [description, setDescription] = useState(editingTask?.description ?? '');
  const [category, setCategory] = useState(
    editingTask && editingTask.category !== 'Без категорії'
      ? editingTask.category
      : '',
  );
  const [priority, setPriority] = useState<Priority>(
    editingTask?.priority ?? 'medium',
  );
  const [error, setError] = useState('');

  //перевірка, що назва не порожня
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (title.trim() === '') {
      setError('Назва завдання обов’язкова');
      showToast('Не вдалося зберегти: вкажіть назву', 'error');
      return;
    }

    const values = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'Без категорії',
      priority,
    };

    if (editingTask) {
      updateTask(editingTask.id, values); // зміна йде через dispatch → reducer
      cancelEdit(); // форма перемонтується в режим «нове завдання»
      return;
    }

    addTask(values);
    setTitle('');
    setDescription('');
    setCategory('');
    setPriority('medium');
    setError('');
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {isEditing && <p className="task-form__mode">Редагування завдання</p>}

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

      <div className="task-form__actions">
        <button className="task-form__button" type="submit">
          {isEditing ? 'Зберегти' : 'Додати'}
        </button>
        {isEditing && (
          <button
            className="task-form__cancel"
            type="button"
            onClick={cancelEdit}
          >
            Скасувати
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;