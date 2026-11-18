import { useEffect, useRef, useState } from 'react'; // NEW: useEffect, useRef
import type { FormEvent } from 'react';
import { useTaskContext } from '../hooks/useTaskContext';
import type { NewTask, Priority, Task } from '../types/task';
import './TaskForm.scss';

interface TaskFormProps {
  editingTask: Task | null;
  onCreate: (values: NewTask) => Promise<void>;
  onUpdate: (id: number, values: NewTask) => Promise<void>;
}

function TaskForm({ editingTask, onCreate, onUpdate }: TaskFormProps) {
  const { cancelEdit, showToast } = useTaskContext();
  const isEditing = editingTask !== null;

  // NEW: посилання на поле назви
  const titleRef = useRef<HTMLInputElement>(null);

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

  // NEW: при вході в режим редагування ставимо фокус на назву
  // (браузер заодно прокручує сторінку до форми)
  useEffect(() => {
    if (editingTask) titleRef.current?.focus();
  }, [editingTask]);

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

    setIsSubmitting(true);
    setError('');
    try {
      if (editingTask) {
        await onUpdate(editingTask.id, values);
        showToast('Зміни збережено');
        cancelEdit(); // форма перемонтується в режим «нове завдання»
      } else {
        await onCreate(values);
        // успіх: очищаємо форму й показуємо повідомлення
        setTitle('');
        setDescription('');
        setCategory('');
        setPriority('medium');
        showToast('Завдання створено');
      }
    } catch {
      // помилка: поля НЕ очищуємо, щоб користувач не втратив введене
      const message = editingTask
        ? 'Не вдалося зберегти зміни. Спробуйте ще раз.'
        : 'Не вдалося створити завдання. Спробуйте ще раз.';
      setError(message);
      showToast(message, 'error');
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
          ref={titleRef} // NEW
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