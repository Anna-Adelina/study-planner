import { useEffect, useState } from 'react';

type Validator<T> = (value: unknown) => value is T;

function readValue<T>(key: string, initialValue: T, validate?: Validator<T>): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return initialValue;
    const parsed: unknown = JSON.parse(raw);
    if (validate && !validate(parsed)) return initialValue;
    return parsed as T;
  } catch {
    // пошкоджений JSON або недоступний localStorage — не ламаємо застосунок
    return initialValue;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validate?: Validator<T>,
) {
  // ліниве читання: виконується лише при першому render
  const [value, setValue] = useState<T>(() =>
    readValue(key, initialValue, validate),
  );

  // синхронізація з зовнішньою системою (браузерне сховище)
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // сховище переповнене або заборонене — ігноруємо
    }
  }, [key, value]);

  return [value, setValue] as const;
}