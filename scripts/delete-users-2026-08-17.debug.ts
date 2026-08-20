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

const CREATED_ON = '2026-08-17'
const LIKE_ARG = `${CREATED_ON}%`

async function main() {
  const [users, days, shifts] = await client.batch(
    [
      {
        sql: 'SELECT id, name, email FROM users WHERE created_at LIKE ?',
        args: [LIKE_ARG],
      },
      {
        sql: 'SELECT COUNT(*) AS n FROM days WHERE user_id IN (SELECT id FROM users WHERE created_at LIKE ?)',
        args: [LIKE_ARG],
      },
      {
        sql: 'SELECT COUNT(*) AS n FROM shifts WHERE day_id IN (SELECT id FROM days WHERE user_id IN (SELECT id FROM users WHERE created_at LIKE ?))',
        args: [LIKE_ARG],
      },
    ],
    'read',
  )

  const targetUsers = users.rows
  const daysCount = Number(days.rows[0]?.n ?? 0)
  const shiftsCount = Number(shifts.rows[0]?.n ?? 0)

  console.log(`Будут удалены пользователи, созданные ${CREATED_ON}:`)
  for (const r of targetUsers) {
    console.log(`  ${r.email} | ${r.name} | ${r.id}`)
  }
  console.log(`  итого: ${targetUsers.length} пользователей`)
  console.log(`  связанных данных: days=${daysCount}, shifts=${shiftsCount}`)

  if (targetUsers.length === 0) {
    console.log('Никого удалять не нужно')
    return
  }

  if (!process.argv.includes('--confirm')) {
    console.log('\nНичего не удалено. Для выполнения запусти ещё раз с флагом --confirm')
    return
  }

  const [delShifts, delDays, delUsers] = await client.batch(
    [
      {
        sql: 'DELETE FROM shifts WHERE day_id IN (SELECT id FROM days WHERE user_id IN (SELECT id FROM users WHERE created_at LIKE ?))',
        args: [LIKE_ARG],
      },
      {
        sql: 'DELETE FROM days WHERE user_id IN (SELECT id FROM users WHERE created_at LIKE ?)',
        args: [LIKE_ARG],
      },
      {
        sql: 'DELETE FROM users WHERE created_at LIKE ?',
        args: [LIKE_ARG],
      },
    ],
    'write',
  )

  console.log(
    'Удалено:',
    `shifts=${delShifts.rowsAffected},`,
    `days=${delDays.rowsAffected},`,
    `users=${delUsers.rowsAffected}`,
  )
}

main().catch((e) => {
  console.error('Ошибка:', e.message)
  process.exit(1)
})