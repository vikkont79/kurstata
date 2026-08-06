import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Введите email').pipe(z.email('Некорректный email')),
  password: z.string().min(1, 'Введите пароль'),
})

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Имя минимум 2 символа'),
  email: z.string().trim().min(1, 'Введите email').pipe(z.email('Некорректный email')),
  password: z.string().min(6, 'Пароль минимум 6 символов'),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
