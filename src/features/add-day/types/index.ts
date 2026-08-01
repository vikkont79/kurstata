import { z } from 'zod'

const shiftSchema = z.object({
  startTime: z.string().min(1, 'Укажите начало смены'),
  endTime: z.string().min(1, 'Укажите конец смены'),
  orders: z.coerce.number().int('Целое число').min(0, 'Заказы >= 0'),
}).refine(
  (data) => data.startTime < data.endTime,
  { message: 'Начало должно быть раньше конца', path: ['endTime'] },
)

export const formSchema = z.object({
  date: z.string().min(1, 'Дата обязательна'),
  shifts: z.array(shiftSchema).min(1, 'Добавьте хотя бы одну смену'),
  dayTotal: z.coerce.number().min(0, 'Сумма должна быть >= 0'),
})

export type FormInput = z.input<typeof formSchema>
export type FormValues = z.infer<typeof formSchema>
