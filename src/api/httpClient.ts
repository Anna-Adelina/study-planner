const BASE_URL: string | undefined = import.meta.env.VITE_API_URL;

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

// Скасований запит — не помилка для користувача
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
    signal,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new HttpError(response.status, `Помилка сервера (${response.status})`);
  }

  return (await response.json()) as T;
}