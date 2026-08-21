import { z } from 'zod'

const shiftSchema = z.object({
  startTime: z.iso.time('Укажите корректное время'),
  endTime: z.iso.time('Укажите корректное время'),
  orders: z.number().int('Целое число').min(0, 'Заказы >= 0').max(1000, 'Слишком много заказов'),
}).refine(
  (data) => data.startTime < data.endTime,
  { message: 'Начало должно быть раньше конца', path: ['endTime'] },
)

export const dayDateSchema = z.iso.date('Укажите корректную дату')

export const addDaySchema = z.object({
  date: dayDateSchema,
  shifts: z.array(shiftSchema).min(1, 'Добавьте хотя бы одну смену').max(20, 'Максимум 20 смен за день'),
  dayTotal: z.number().min(0, 'Сумма должна быть >= 0').max(1000000, 'Слишком большая сумма'),
})

export type AddDayValues = z.infer<typeof addDaySchema>
