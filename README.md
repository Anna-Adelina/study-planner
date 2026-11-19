# Study Planner

Планувальник навчальних завдань на React 19 + TypeScript + Vite.
Лабораторна робота №10: інтеграція з REST API, API layer, Repository Pattern,
асинхронні стани, CRUD, пагінація та скасування запитів.

## Запуск

Потрібен Node.js 22.22 або новіший.

```bash
npm install
cp .env.example .env   # у PowerShell: Copy-Item .env.example .env
npm run dev
```

Скрипти: `npm run dev`, `npm run build`, `npm run lint`.

## Конфігурація

URL API береться зі змінної середовища (файл `.env` не додається до Git):

```
VITE_API_URL=https://dummyjson.com
```

## API

Використовується [DummyJSON Todos](https://dummyjson.com/docs/todos).

| Метод | Endpoint | Призначення |
|---|---|---|
| GET | `/todos?limit=10&skip=0` | список із пагінацією |
| GET | `/todos/:id` | одне завдання |
| POST | `/todos/add` | створення |
| PATCH | `/todos/:id` | оновлення (`title`, `completed`) |
| DELETE | `/todos/:id` | видалення |

DummyJSON лише **симулює** POST, PATCH і DELETE: відповідь повертається, але сервер
нічого не зберігає. Тому після успішної операції клієнт сам оновлює свій state, а
`taskRepository` запам'ятовує зміни за поточну сесію. Після перезавантаження сторінки
дані повертаються до стану сервера. Поля `description`, `priority` і `category`
API не підтримує: це client-only metadata.

## Архітектура

```
UI-компоненти  →  hooks (useTasks, useTaskDetails)  →  taskRepository  →  httpClient  →  REST API
```

| Шар | Файл | Відповідальність |
|---|---|---|
| HTTP client | `src/api/httpClient.ts` | URL із `VITE_API_URL`, `fetch`, перевірка `response.ok`, `HttpError`, `AbortSignal` |
| Repository | `src/repositories/taskRepository.ts` | endpoint-и, mapping DTO ↔ `Task`, особливості навчального API |
| Mapper | `src/repositories/taskMapper.ts` | `ApiTodo` → `Task` і назад |
| Server state | `src/hooks/useTasks.ts` | список, loading/error/empty/success, пагінація, retry, скасування запитів, CRUD |
| Деталі | `src/hooks/useTaskDetails.ts` | отримання завдання за id зі скасуванням |
| Client/UI state | `src/context/TaskProvider.tsx` | фільтр, редаговане завдання, toast |

UI-компоненти не містять URL і прямих HTTP-викликів.

## Стани та скасування запитів

- loading, success, error (з кнопкою «Спробувати ще») та empty для списку й деталей;
- під час переходу між сторінками попередній GET скасовується через `AbortController`;
  скасований запит не показується користувачу як помилка;
- видалення потребує підтвердження в інтерфейсі.

## Стилі

SCSS із BEM: кожен компонент має власний `.scss` файл поруч.

## Git

Робота виконана у гілці `feature/rest-api`, коміти за Conventional Commits.