import { defineConfig } from 'drizzle-kit'
import { env } from './src/shared/lib/env'

export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: `${env.TURSO_DATABASE_URL}?authToken=${env.TURSO_AUTH_TOKEN}`,
  },
})
