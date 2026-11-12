import { useEffect } from 'react';
import { useTaskContext } from '../hooks/useTaskContext';
import './Toast.scss';

const TOAST_DURATION_MS = 3000;

function Toast() {
  const { toast, dismissToast } = useTaskContext();

  // Effect: автоматично ховаємо Toast; cleanup скидає таймер,
  // якщо з'явилось нове повідомлення або компонент розмонтовано
  useEffect(() => {
    if (!toast) return;
    const timerId = setTimeout(dismissToast, TOAST_DURATION_MS);
    return () => clearTimeout(timerId);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
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
  );
}

export default Toast;