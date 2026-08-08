import 'server-only'
import { z } from 'zod'

const envSchema = z.object({
  TURSO_DATABASE_URL: z.string().min(1, 'TURSO_DATABASE_URL не задан'),
  TURSO_AUTH_TOKEN: z.string().min(1, 'TURSO_AUTH_TOKEN не задан'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET слишком короткий (минимум 32 символа)'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Ошибка конфигурации окружения:')
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
  }
  throw new Error('Проверьте переменные окружения в .env и перезапустите приложение')
}

export const env = parsed.data
