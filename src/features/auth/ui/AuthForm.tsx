'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button/Button'
import { Input } from '@/shared/ui/input/Input'
import { Label } from '@/shared/ui/label/Label'
import { loginSchema, registerSchema } from '@/features/auth/types'
import { login } from '@/features/auth/api/login'
import { register } from '@/features/auth/api/register'

type Mode = 'login' | 'register'

type FormValues = {
  name: string
  email: string
  password: string
}

const AuthForm = ({ modalId }: { modalId: string }) => {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [serverError, setServerError] = useState<string | null>(null)

  const isLogin = mode === 'login'

  const {
    register: registerField,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { name: '', email: '', password: '' },
  })

  const switchMode = (next: Mode) => {
    setMode(next)
    setServerError(null)
    reset()
  }

  const closeModal = () => {
    const dialog = document.getElementById(modalId)
    if (dialog instanceof HTMLDialogElement) {
      dialog.close()
    }
  }

  const onSubmit = async (data: FormValues) => {
    setServerError(null)

    const parsed = (isLogin ? loginSchema : registerSchema).safeParse(data)
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (typeof field === 'string') {
          setError(field as keyof FormValues, { message: issue.message })
        }
      })
      return
    }

    const result = isLogin ? await login(parsed.data) : await register(parsed.data)

    if (!result.success) {
      setServerError(result.error)
      toast.error(isLogin ? 'Ошибка входа' : 'Ошибка регистрации')
      return
    }

    toast.success(isLogin ? 'Добро пожаловать' : 'Регистрация завершена')
    closeModal()
    router.refresh()
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {!isLogin && (
        <Label error={errors.name?.message}>
          Имя
          <Input hasError={!!errors.name} {...registerField('name')} />
        </Label>
      )}

      <Label error={errors.email?.message}>
        Email
        <Input
          type="email"
          autoComplete="email"
          hasError={!!errors.email}
          {...registerField('email')}
        />
      </Label>

      <Label error={errors.password?.message}>
        Пароль
        <Input
          type="password"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          hasError={!!errors.password}
          {...registerField('password')}
        />
      </Label>

      {serverError && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {serverError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Подождите…' : isLogin ? 'Войти' : 'Зарегистрироваться'}
      </Button>

      <div className="flex items-center justify-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
        {isLogin ? (
          <>
            Нет аккаунта?
            <button
              type="button"
              className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
              onClick={() => switchMode('register')}
            >
              Регистрация
            </button>
          </>
        ) : (
          <>
            Уже есть аккаунт?
            <button
              type="button"
              className="font-medium text-zinc-900 hover:underline dark:text-zinc-100"
              onClick={() => switchMode('login')}
            >
              Войти
            </button>
          </>
        )}
      </div>
    </form>
  )
}

export { AuthForm }
