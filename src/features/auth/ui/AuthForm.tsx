'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button/Button'
import { Input } from '@/shared/ui/input/Input'
import { Label } from '@/shared/ui/label/Label'
import { Modal } from '@/shared/ui/modal/Modal'
import { loginSchema, registerSchema, type RegisterValues } from '@/features/auth/types'
import { login } from '@/features/auth/api/login'
import { register } from '@/features/auth/api/register'

type Mode = 'login' | 'register'

const AUTH_MODAL_ID = 'auth-modal'

const AuthForm = ({ returnTo }: { returnTo?: string }) => {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [serverError, setServerError] = useState<string | null>(null)

  const isLogin = mode === 'login'

  const safeReturnTo =
    returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : null

  const {
    register: registerField,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver((isLogin ? loginSchema : registerSchema) as typeof registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  const switchMode = (next: Mode) => {
    setMode(next)
    setServerError(null)
    reset()
  }

  const closeModal = () => {
    const dialog = document.getElementById(AUTH_MODAL_ID)
    if (dialog instanceof HTMLDialogElement) {
      dialog.close()
    }
  }

  const onSubmit = async (data: RegisterValues) => {
    setServerError(null)

    try {
      const result = isLogin ? await login(data) : await register(data)

      if (!result.success) {
        setServerError(result.error)
        toast.error(isLogin ? 'Ошибка входа' : 'Ошибка регистрации')
        return
      }

      toast.success(isLogin ? 'Добро пожаловать' : 'Регистрация завершена')
      closeModal()
      if (safeReturnTo) {
        router.replace(safeReturnTo)
      } else {
        router.refresh()
      }
    } catch {
      setServerError('Не удалось связаться с сервером. Попробуйте позже')
      toast.error(isLogin ? 'Ошибка входа' : 'Ошибка регистрации')
    }
  }

  return (
    <Modal id={AUTH_MODAL_ID} labelledBy={`${AUTH_MODAL_ID}-title`} className="relative">
      <h3 id={`${AUTH_MODAL_ID}-title`} className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Авторизация
      </h3>

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

      <Button
        variant="ghost"
        square
        aria-label="Закрыть"
        commandfor={AUTH_MODAL_ID}
        command="close"
        className="absolute right-0 top-0"
      >
        ✕
      </Button>
    </Modal>
  )
}

export { AuthForm, AUTH_MODAL_ID }
