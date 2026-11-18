import { HttpError } from './httpClient';

export function toErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 404) {
      return 'Завдання не знайдено на сервері (код 404).';
    }
    return `Помилка завантаження (код ${error.status}).`;
  }
  return 'Помилка завантаження. Перевірте інтернет-з’єднання.';
}