import { useEffect } from 'react';
import { UNDO_DELAY_MS } from '../context/TaskProvider';
import { useTaskContext } from '../hooks/useTaskContext';
import './Toast.scss';

const TOAST_DURATION_MS = 3000;

function Toast() {
  const { toast, dismissToast, pendingDeletion, undoDelete } =
    useTaskContext();

  // Effect: автоматично ховаємо звичайний Toast; cleanup скидає таймер,
  // якщо з'явилось нове повідомлення або компонент розмонтовано
  useEffect(() => {
    if (!toast) return;
    const timerId = setTimeout(dismissToast, TOAST_DURATION_MS);
    return () => clearTimeout(timerId);
  }, [toast, dismissToast]);

  if (!toast && !pendingDeletion) return null;

  return (
    <div className="toast-stack">
      {pendingDeletion && (
        // key перезапускає анімацію прогресу, якщо видалення замінилось новим
        <div
          key={pendingDeletion.ids.join('-')}
          className="toast toast--pending"
          role="status"
        >
          <div className="toast__row">
            <p className="toast__message">
              {pendingDeletion.kind === 'completed'
                ? `Виконані завдання (${pendingDeletion.ids.length}) буде видалено`
                : 'Завдання буде видалено'}
            </p>
            <button
              className="toast__action"
              type="button"
              onClick={undoDelete}
            >
              Скасувати
            </button>
          </div>
          <div className="toast__progress" aria-hidden="true">
            <div
              className="toast__progress-bar"
              style={{ animationDuration: `${UNDO_DELAY_MS}ms` }}
            />
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`toast toast--${toast.variant}`}
          role={toast.variant === 'error' ? 'alert' : 'status'}
        >
          <p className="toast__message">{toast.message}</p>
          <button
            className="toast__close"
            type="button"
            aria-label="Закрити повідомлення"
            onClick={dismissToast}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default Toast;