# Kurstata

Учёт рабочих смен: ввод данных по дням (смены, часы, заказы, выручка) и сводка по неделям.

## Стек

- [Next.js](https://nextjs.org) 16 (App Router) + React 19
- TypeScript (strict)
- Tailwind CSS 4
- [Drizzle ORM](https://orm.drizzle.team) + [Turso](https://turso.tech) (libSQL)
- React Hook Form + Zod
- Аутентификация: bcrypt + JWT в httpOnly-cookie

## Требования

- Node.js 22+
- pnpm

## Установка

```bash
pnpm install
```

Создать `.env` по образцу `.env.example` и заполнить переменные.

## Переменные окружения

| Переменная | Описание |
|---|---|
| `TURSO_DATABASE_URL` | URL базы Turso (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Токен доступа Turso |
| `JWT_SECRET` | Секрет подписи JWT-сессий, минимум 32 символа. Сгенерировать: `openssl rand -base64 32` |
| `RESEND_API_KEY` | Ключ API Resend (опционально). Без него письма печатаются в консоль вместо отправки |

Конфигурация окружения валидируется при старте (`src/shared/lib/env.ts`) — при ошибке приложение падает с понятным сообщением.

## Команды

```bash
pnpm dev          # dev-сервер
pnpm build        # production-сборка
pnpm start        # запуск production-сборки
pnpm lint         # ESLint
pnpm tsc --noEmit # проверка типов
pnpm db:generate  # генерация миграции из изменений schema
pnpm db:migrate   # применение миграций
pnpm db:studio    # Drizzle Studio
```

## База данных

Схема: `db/schema.ts`, клиент: `db/client.ts`, миграции: `db/migrations/`.

При изменении схемы:

```bash
pnpm db:generate
pnpm db:migrate
```

## Структура проекта

Feature-Sliced Design:

- `src/app/` — роутинг Next.js (layout, page)
- `src/sections/` — сборка страниц
- `src/widgets/` — крупные блоки (шапка)
- `src/features/` — пользовательские сценарии (авторизация, ввод дня)
- `src/entities/` — бизнес-сущности (пользователь, день)
- `src/shared/` — переиспользуемое (UI, API, утилиты)

## Авторизация

Email + пароль. Регистрация и вход — через server actions. Сессия — JWT (7 дней) в httpOnly-cookie; logout отзывает все сессии серверно (счётчик `token_version`). Защита от подбора: блокировка аккаунта после 5 неудачных попыток на 15 минут.

## Деплой

Сборка и деплой — Vercel, автоматически при пуше в ветку. Переменные окружения задаются в настройках проекта Vercel.
