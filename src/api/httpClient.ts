//Значення береться зі змінної оточення VITE_API_URL
const BASE_URL: string | undefined = import.meta.env.VITE_API_URL;  

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

// Перевіряємо, чи запит скасували навмисне — це не помилка сервера
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

export async function request<T>(
  path: string,
  { method = 'GET', body, signal }: RequestOptions = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new Error('VITE_API_URL не задано. Перевір файл .env');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    signal, // Передаємо сигнал скасування, щоб можна було перервати запит (наприклад, при виході зі сторінки)
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  //fetch не кидає помилку 404/500 сам. 
  // if перехоплює відповідь і кидає об'єкт HttpError із кодом статусу (response.status), 
  if (!response.ok) {
    throw new HttpError(response.status, `Помилка сервера (${response.status})`);
  }

  return (await response.json()) as T;
}