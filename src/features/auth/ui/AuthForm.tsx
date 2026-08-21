'use client'

import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button/Button'
import { Input } from '@/shared/ui/input/Input'
import { Label } from '@/shared/ui/label/Label'
import { Modal } from '@/shared/ui/modal/Modal'
import {
  loginSchema,
  registerSchema,
  confirmSchema,
  type RegisterValues,
  type ConfirmValues,
} from '@/features/auth/types'
import { login } from '@/features/auth/api/login'
import { register } from '@/features/auth/api/register'
import { confirmRegistration } from '@/features/auth/api/confirmRegistration'
import { resendRegistrationCode } from '@/features/auth/api/resendRegistrationCode'
import { ForgotPasswordModal, FORGOT_PASSWORD_MODAL_ID } from '@/features/auth/ui/ForgotPasswordModal'
import { ResendCooldown } from '@/features/auth/ui/ResendCooldown'

type Mode = 'login' | 'register'

const AUTH_MODAL_ID = 'auth-modal'

const cooldownEndsIn = (ms: number): number => Date.now() + ms

const AuthForm = ({ returnTo }: { returnTo?: string }) => {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [cooldownEndsAt, setCooldownEndsAt] = useState(0)

  const handleCooldownEnd = useCallback(() => setCooldownEndsAt(0), [])

  const isLogin = mode === 'login'

  const safeReturnTo =
    returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : null

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver((isLogin ? loginSchema : registerSchema) as typeof registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  const confirmForm = useForm<ConfirmValues>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { email: '', code: '' },
  })

  const switchMode = (next: Mode) => {
    setMode(next)
    setPendingEmail(null)
    setServerError(null)
    setIsResending(false)
    setCooldownEndsAt(0)
    registerForm.reset()
    confirmForm.reset({ email: '', code: '' })
  }

  const closeModal = () => {
    const dialog = document.getElementById(AUTH_MODAL_ID)
    if (dialog instanceof HTMLDialogElement) {
      dialog.close()
    }
  }

  const openForgotPassword = () => {
    closeModal()
    const dialog = document.getElementById(FORGOT_PASSWORD_MODAL_ID)
    if (dialog instanceof HTMLDialogElement) {
      dialog.showModal()
    }
  }

  const redirectAfterAuth = () => {
    if (safeReturnTo) {
      router.replace(safeReturnTo)
    } else {
      const url = new URL(window.location.href)
      url.searchParams.delete('auth')
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }

  const onSubmitRegister = async (data: RegisterValues) => {
    setServerError(null)

    try {
      if (isLogin) {
        const result = await login(data)
        if (!result.success) {
          setServerError(result.error)
          toast.error('Ошибка входа')
          return
        }
        toast.success('Добро пожаловать')
        closeModal()
        redirectAfterAuth()
        return
      }

      const result = await register(data)
      if (!result.success) {
        setServerError(result.error)
        toast.error('Ошибка регистрации')
        return
      }
      setPendingEmail(result.email)
      setCooldownEndsAt(cooldownEndsIn(result.cooldownMs))
      confirmForm.reset({ email: result.email, code: '' })
      toast.success('Код отправлен на почту')
    } catch {
      setServerError('Не удалось связаться с сервером. Попробуйте позже')
      toast.error(isLogin ? 'Ошибка входа' : 'Ошибка регистрации')
    }
  }

  const onSubmitConfirm = async (data: ConfirmValues) => {
    setServerError(null)

    try {
      const result = await confirmRegistration(data)

      if (!result.success) {
        setServerError(result.error)
        toast.error('Не удалось подтвердить код')
        return
      }

      toast.success('Регистрация завершена')
      setPendingEmail(null)
      setCooldownEndsAt(0)
      closeModal()
      redirectAfterAuth()
    } catch {
      setServerError('Не удалось связаться с сервером. Попробуйте позже')
      toast.error('Не удалось подтвердить код')
    }
  }

  const handleResend = async () => {
    if (!pendingEmail) return
    setServerError(null)
    setIsResending(true)

    try {
      const result = await resendRegistrationCode({ email: pendingEmail })

      if (!result.success) {
        if (result.cooldownMs) {
          setCooldownEndsAt(cooldownEndsIn(result.cooldownMs))
        } else {
          setServerError(result.error)
          toast.error('Не удалось отправить код')
        }
        return
      }

      setCooldownEndsAt(cooldownEndsIn(result.cooldownMs))
      confirmForm.setValue('code', '')
      confirmForm.setFocus('code')
      toast.success('Новый код отправлен')
    } catch {
      setServerError('Не удалось связаться с сервером. Попробуйте позже')
      toast.error('Не удалось отправить код')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <>
      <Modal id={AUTH_MODAL_ID} labelledBy={`${AUTH_MODAL_ID}-title`} className="relative">
        <h3 id={`${AUTH_MODAL_ID}-title`} className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Авторизация
        </h3>

        {pendingEmail ? (
          <form
            noValidate
            onSubmit={confirmForm.handleSubmit(onSubmitConfirm)}
            className="flex flex-col gap-4"
          >
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Мы отправили код на {pendingEmail}. Введите его для завершения регистрации. Код
              действует 15 минут.
            </p>

            <Label error={confirmForm.formState.errors.email?.message}>
              Email
              <Input
                type="email"
                readOnly
                hasError={!!confirmForm.formState.errors.email}
                {...confirmForm.register('email')}
              />
            </Label>

            <Label error={confirmForm.formState.errors.code?.message}>
              Код
              <Input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                hasError={!!confirmForm.formState.errors.code}
                {...confirmForm.register('code')}
              />
            </Label>

            {serverError && (
              <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              disabled={confirmForm.formState.isSubmitting}
              className="w-full"
            >
              {confirmForm.formState.isSubmitting ? 'Подождите…' : 'Подтвердить'}
            </Button>

            <button
              type="button"
              disabled={isResending || cooldownEndsAt > 0}
              className="self-center text-sm text-zinc-600 hover:underline disabled:opacity-60 dark:text-zinc-400"
              onClick={handleResend}
            >
              {isResending ? 'Отправляем…' : 'Отправить код повторно'}
            </button>

            <ResendCooldown endsAt={cooldownEndsAt} onEnd={handleCooldownEnd} />

            <button
              type="button"
              className="self-center text-sm text-zinc-600 hover:underline dark:text-zinc-400"
              onClick={() => switchMode('login')}
            >
              Назад ко входу
            </button>
          </form>
        ) : (
          <form
            noValidate
            onSubmit={registerForm.handleSubmit(onSubmitRegister)}
            className="flex flex-col gap-4"
          >
            {!isLogin && (
              <Label error={registerForm.formState.errors.name?.message}>
                Имя
                <Input hasError={!!registerForm.formState.errors.name} {...registerForm.register('name')} />
              </Label>
            )}

            <Label error={registerForm.formState.errors.email?.message}>
              Email
              <Input
                type="email"
                autoComplete="email"
                hasError={!!registerForm.formState.errors.email}
                {...registerForm.register('email')}
              />
            </Label>

            <Label error={registerForm.formState.errors.password?.message}>
              Пароль
              <Input
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                hasError={!!registerForm.formState.errors.password}
                {...registerForm.register('password')}
              />
            </Label>

            {serverError && (
              <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              disabled={registerForm.formState.isSubmitting}
              className="w-full"
            >
              {registerForm.formState.isSubmitting
                ? 'Подождите…'
                : isLogin
                  ? 'Войти'
                  : 'Зарегистрироваться'}
            </Button>

            {isLogin && (
              <button
                type="button"
                className="self-center text-sm text-zinc-600 hover:underline dark:text-zinc-400"
                onClick={openForgotPassword}
              >
                Забыли пароль?
              </button>
            )}

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
        )}

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
      <ForgotPasswordModal />
    </>
  )
}

export { AuthForm, AUTH_MODAL_ID }