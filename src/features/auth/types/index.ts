import { z } from 'zod'

// Лимит алгоритма bcrypt: пароли длиннее 72 байт молча обрезаются
const MAX_PASSWORD_BYTES = 72

const PASSWORD_TOO_LONG = 'Пароль слишком длинный'

export const INVALID_LINK_MESSAGE = 'Ссылка недействительна или истекла'

export const INVALID_CODE_MESSAGE = 'Код недействителен или истёк'

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

export const confirmSchema = z.object({
  email: z.string().trim().min(1, 'Введите email').pipe(z.email('Некорректный email')),
  code: z.string().trim().regex(/^\d{6}$/, 'Код — 6 цифр'),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
export type RequestResetValues = z.infer<typeof requestResetSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
export type ConfirmValues = z.infer<typeof confirmSchema>
