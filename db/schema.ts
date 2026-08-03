import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const days = sqliteTable('days', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  date: text('date').notNull().unique(),
  dayTotal: real('day_total').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
})

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
