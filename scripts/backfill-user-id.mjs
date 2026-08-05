import { createClient } from '@libsql/client'

const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env

const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
})

const arg = process.argv[2]

if (!arg) {
  const { rows } = await client.execute('SELECT id, email, name FROM users ORDER BY created_at')
  console.table(rows)
  process.exit(0)
}

const { rows } = await client.execute({
  sql: 'SELECT id FROM users WHERE id = ? OR email = ?',
  args: [arg, arg],
})

if (!rows.length) {
  console.error('Пользователь не найден по id или email:', arg)
  process.exit(1)
}

const { id } = rows[0]
const result = await client.execute({
  sql: 'UPDATE days SET user_id = ? WHERE user_id IS NULL',
  args: [id],
})

console.log(`Обновлено дней: ${result.rowsAffected}`)
