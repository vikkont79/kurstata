<!-- BEGIN:nextjs-agent-rules -->
# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.
<!-- END:nextjs-agent-rules -->

# Project Rules — kurstata

Read AGENTS.md rules below before any task.

---

## Зоны ответственности

### Можно редактировать
- `src/app/` — **только роутинг** (layout, page, loading, error, not-found). Никакой бизнес-логики, компонентов, стилей. Передаёт параметры (`params`, `searchParams`) в соответствующие секции.
- `src/sections/` — сборка страниц (аналог FSD `pages`). Каждый слайс по домену (`main`, `catalog`, `profile`).
- `src/widgets/` — крупные блоки (Header, Footer, Sidebar, модалки).
- `src/features/` — пользовательские сценарии (auth, add-to-cart, filters).
- `src/entities/` — бизнес-сущности (user, product, order).
- `src/shared/` — переиспользуемое: UI-кит, API-клиент, хуки, утилиты, типы.
- `public/` — статические файлы (изображения, шрифты).
- `AGENTS.md` — правила для агентов.

### НЕЛЬЗЯ трогать без явного запроса пользователя
- `package.json` — добавление/удаление зависимостей
- `next.config.ts` — конфигурация Next.js
- `tsconfig.json` — настройки TypeScript
- `eslint.config.mjs` — правила линтинга
- `postcss.config.mjs` — конфигурация PostCSS
- `.gitignore` — список игнорируемых файлов

### Запретные зоны (никогда не трогать)
- `node_modules/` — управляется только через pnpm
- `.next/` — билд Next.js, генерируется автоматически
- `pnpm-lock.yaml` — блокировка зависимостей
- `next-env.d.ts` — авто-генерируемый TypeScript-деклерейшн
- Файлы с секретами/токенами (`.env*` etc.)
- Любой сгенерированный/бинарный контент

---

## Режим подтверждения

### По умолчанию
- Агент **всегда** перед изменениями показывает план и ждёт подтверждения.
- Только после команды `"Выполняй"`, `"ОК"` или `"Да"` — начинает писать код.

### Можно пропустить
- Если в запросе есть слово `"сразу"` или `"без подтверждения"` — агент делает без остановок.

### Исключения (всегда спрашивать, даже при "сразу")
- Удаление файлов
- Изменение `package.json` / `next.config.ts` / `tsconfig.json`
- Запуск команд, которые могут изменить окружение (`pnpm install`, `git push --force`)

---

## Структура проекта (FSD)

### Слои и их назначение

| Слой | Назначение |
|------|------------|
| **`src/app/`** | Чистый роутинг Next.js App Router. Только передача параметров (`params`, `searchParams`). Никакой бизнес-логики, компонентов, стилей. |
| **`src/sections/`** | Аналог FSD `pages`. Сборка страниц. Подключает виджеты, фичи, сущности. Не путать с `app/`. |
| **`src/widgets/`** | Крупные блоки (шапка, футер, сайдбар, модалки) |
| **`src/features/`** | Пользовательские сценарии (действия, формы, интерактив) |
| **`src/entities/`** | Бизнес-сущности (пользователь, товар, заказ, отзыв) |
| **`src/shared/`** | UI-киты, API-клиенты, хуки, утилиты, константы, общие типы |

### Структура каждого слайса

```
src/{layer}/{domain}/
├── ui/       — компоненты и стили
├── api/      — всё, что связано с сервером (запросы, мутации, клиенты)
├── lib/      — вспомогательный код (хуки, утилиты, helpers)
└── types/    — TypeScript-типы для этого слайса
```

---

## Правила экспортов

### `src/app/` (роутинг Next.js)
- Только `export default function`
- Без стрелочных функций, без именованных экспортов
- Сигнатура как в шаблоне: `export default function Page() { ... }`

### Вне `src/app/` (компоненты, возвращающие JSX)
- Константа со стрелочной функцией и явным `return`
- Именованный экспорт в конце файла

```ts
// ✅ правильно
const ProductCard = () => {
  return <div>...</div>
}

export { ProductCard }
```

```ts
// ❌ неправильно
export default function ProductCard() { ... }
export const ProductCard = () => <div>...</div>
```

### Не-JSX-файлы (утилиты, хуки, API, константы, типы)
- Без ограничений: `export function`, `export const`, `export type` — как удобно

### Индексные файлы
- `index.ts` — в каждом сегменте (`ui/`, `lib/`, `types/`) и в каждом слайсе (`main/`, `catalog/`, `profile/`). Экспортируем только то, что предназначено для использования снаружи.

### Исключение: `api/`
- Файлы из сегмента `api/` всегда импортируются **напрямую по полному пути**, не через индексные файлы.

```ts
// ✅ правильно
import { getProducts } from '@/entities/product/api/getProducts'

// ❌ неправильно
import { getProducts } from '@/entities/product'
```

### Пример: связка app + sections

```ts
// src/app/page.tsx
import { MainPage } from '@/sections/main'

export default function Page() {
  return <MainPage />
}
```

```ts
// src/app/products/[id]/page.tsx
import { ProductSection } from '@/sections/catalog'

export default function Page({ params }: { params: { id: string } }) {
  return <ProductSection productId={params.id} />
}
```

---

## Обязательные проверки перед коммитом

1. **Lint:** `pnpm lint` — без ошибок и предупреждений
2. **Types:** `pnpm tsc --noEmit` — проект должен собираться (включает проверку типов)
3. **Tailwind:** не использовать устаревшие директивы `@tailwind` / `@apply` (Tailwind v4 использует `@import "tailwindcss"`)

---

## Архитектурные принципы

1. **App Router + `src/`** — весь код в `src/`, маршруты — через файловую систему в `src/app/`
2. **Tailwind v4** — используй `@import "tailwindcss"` в CSS, `@theme inline {}` для кастомных токенов. Не используй `tailwind.config.js` (его нет и не будет)
3. **Path alias `@/`** — все импорты внутри `src/` через `@/name`, не через относительные пути (`../../`)
4. **Типизация** — strict mode TypeScript, `Readonly<>` для пропсов, типы выносить в отдельные файлы при разрастании
5. **Шрифты** — через `next/font/google` с CSS-переменными (`--font-geist-sans`, `--font-geist-mono`)
6. **Темы** — через CSS-переменные и `prefers-color-scheme`
7. **pnpm** — только pnpm для управления зависимостями (не npm/yarn)

---

## Правило: проверка API

Перед созданием файлов конфигурации (drizzle.config.ts, next.config.ts и т.д.) — **проверять актуальный API** зависимости:
- `node_modules/{package}/package.json` — версия
- `node_modules/{package}/dist/` — типы/документация
- npm-страница или оф. доки, если типов недостаточно

Не полагаться на предыдущий опыт — API мог измениться.

## Заметки по стек-версиям

- Next.js `^16.2.12` — перед написанием кода проверять `node_modules/next/dist/docs/` на актуальные API
- React `^19.2.4`
- Tailwind CSS `^4`
- ESLint Flat Config (`eslint.config.mjs`)

## Окружение (bash-команды)

Проект лежит на WSL-файловой системе, но bash-инструмент запускает PowerShell.
Исполняемые файлы в WSL недоступны в PATH из PowerShell. Запускать через `wsl <full-path>`:

- `pnpm`: `/home/vikkont/.local/share/pnpm/pnpm`
- `node`: `/home/vikkont/.local/share/pnpm/nodejs/22.21.1/bin/node`

Пример установки зависимости:
```powershell
wsl /home/vikkont/.local/share/pnpm/pnpm add package-name
```

Пример сборки (требуется node в PATH):
```powershell
wsl env PATH="/home/vikkont/.local/share/pnpm/nodejs/22.21.1/bin:$PATH" /home/vikkont/.local/share/pnpm/nodejs/22.21.1/bin/node node_modules/next/dist/bin/next build
```
