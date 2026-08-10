import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  failedLoginAttempts: integer('failed_login_attempts').notNull().default(0),
  lockedUntil: text('locked_until'),
  tokenVersion: integer('token_version').notNull().default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
})

export const days = sqliteTable('days', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  dayTotal: real('day_total').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex('days_user_date_unique').on(table.userId, table.date),
])

export const shifts = sqliteTable('shifts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  dayId: text('day_id')
    .notNull()
    .references(() => days.id, { onDelete: 'cascade' }),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  orders: integer('orders').notNull().default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('shifts_day_id_idx').on(table.dayId),
])
