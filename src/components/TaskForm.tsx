import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTaskContext } from '../hooks/useTaskContext';
import type { NewTask, Priority } from '../types/task';
import './TaskForm.scss';

interface TaskFormProps {
  onCreate: (values: NewTask) => Promise<void>;
}

function TaskForm({ onCreate }: TaskFormProps) {
  const { updateTask, editingTask, cancelEdit, showToast } = useTaskContext();
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
  // UI state: чи йде зараз запит на сервер
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    //перевірка, що назва не порожня
    if (title.trim() === '') {
      setError('Назва завдання обов’язкова');
      showToast('Не вдалося зберегти: вкажіть назву', 'error');
      return;
    }

    const values: NewTask = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'Без категорії',
      priority,
    };

    if (editingTask) {
      updateTask(editingTask.id, values); // поки через reducer, переробимо на кроці 8
      cancelEdit(); // форма перемонтується в режим «нове завдання»
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onCreate(values);
      // успіх: очищаємо форму й показуємо повідомлення
      setTitle('');
      setDescription('');
      setCategory('');
      setPriority('medium');
      showToast('Завдання створено');
    } catch {
      // помилка: поля НЕ очищуємо, щоб користувач не втратив введене
      setError('Не вдалося створити завдання. Спробуйте ще раз.');
      showToast('Не вдалося створити завдання', 'error');
    } finally {
      setIsSubmitting(false);
    }
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
        <button
          className="task-form__button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Збереження...' : isEditing ? 'Зберегти' : 'Додати'}
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