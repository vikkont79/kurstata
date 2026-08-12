import { z } from 'zod'
import { MAX_PASSWORD_BYTES } from '@/shared/lib/auth'

const PASSWORD_TOO_LONG = 'Пароль слишком длинный'

export const INVALID_LINK_MESSAGE = 'Ссылка недействительна или истекла'

const passwordMaxBytes = (password: string): boolean =>
  new TextEncoder().encode(password).length <= MAX_PASSWORD_BYTES

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Введите email').pipe(z.email('Некорректный email')),
  password: z.string().min(1, 'Введите пароль').refine(passwordMaxBytes, PASSWORD_TOO_LONG),
})

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Имя минимум 2 символа'),
  email: z.string().trim().min(1, 'Введите email').pipe(z.email('Некорректный email')),
  password: z.string().min(6, 'Пароль минимум 6 символов').refine(passwordMaxBytes, PASSWORD_TOO_LONG),
})

export const requestResetSchema = z.object({
  email: z.string().trim().min(1, 'Введите email').pipe(z.email('Некорректный email')),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Пароль минимум 6 символов').refine(passwordMaxBytes, PASSWORD_TOO_LONG),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
export type RequestResetValues = z.infer<typeof requestResetSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
