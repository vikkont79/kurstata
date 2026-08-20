import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@libsql/client'

const env: Record<string, string> = {}
for (const line of fs.readFileSync(path.join(__dirname, '../.env'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) env[m[1]] = m[2]
}

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
})

async function main() {
  const { rows } = await client.execute(
    'SELECT id, name, email, created_at FROM users ORDER BY created_at'
  )

  if (rows.length === 0) {
    console.log('В БД нет пользователей')
    return
  }

  for (const r of rows) {
    console.log(`${r.created_at ?? '?'} | ${r.email} | ${r.name} | ${r.id}`)
  }
  console.log(`---\nВсего: ${rows.length}`)
}

main().catch((e) => {
  console.error('Ошибка:', e.message)
  process.exit(1)
})