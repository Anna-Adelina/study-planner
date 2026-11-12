import { useEffect, useState } from 'react';

type Validator<T> = (value: unknown) => value is T;

function readValue<T>(key: string, initialValue: T, validate?: Validator<T>): T {
  try {
    const raw = localStorage.getItem(key);
    // 1. Якщо в сховищі нічого немає — повертаємо дефолтне значення
    if (raw === null) return initialValue;
    const parsed: unknown = JSON.parse(raw);
    // 2. Якщо дані пошкоджені або не проходять бізнес-валідацію — відкидаємо їх
    if (validate && !validate(parsed)) return initialValue;
    return parsed as T;
  } catch {
    // 3. Захист від падіння: якщо JSON не валідний або localStorage заблокований
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