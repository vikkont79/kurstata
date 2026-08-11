'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button/Button'
import { Input } from '@/shared/ui/input/Input'
import { Label } from '@/shared/ui/label/Label'
import { Modal } from '@/shared/ui/modal/Modal'
import { requestResetSchema, type RequestResetValues } from '@/features/auth/types'
import { requestPasswordReset } from '@/features/auth/api/requestPasswordReset'

const FORGOT_PASSWORD_MODAL_ID = 'forgot-password-modal'

const ForgotPasswordModal = () => {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register: registerField,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RequestResetValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: '' },
  })

  const closeModal = () => {
    const dialog = document.getElementById(FORGOT_PASSWORD_MODAL_ID)
    if (dialog instanceof HTMLDialogElement) {
      dialog.close()
    }
    reset()
    setServerError(null)
    setSubmitted(false)
  }

  const onSubmit = async (data: RequestResetValues) => {
    setServerError(null)

    try {
      const result = await requestPasswordReset(data)

      if (!result.success) {
        setServerError(result.error)
        toast.error('Ошибка отправки')
        return
      }

      setSubmitted(true)
    } catch {
      setServerError('Не удалось связаться с сервером. Попробуйте позже')
      toast.error('Ошибка отправки')
    }
  }

  return (
    <Modal id={FORGOT_PASSWORD_MODAL_ID} labelledBy={`${FORGOT_PASSWORD_MODAL_ID}-title`} className="relative">
      <h3 id={`${FORGOT_PASSWORD_MODAL_ID}-title`} className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Восстановление пароля
      </h3>

      {submitted ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Если аккаунт с таким email существует, мы отправили письмо со ссылкой для сброса пароля.
          </p>
          <Button type="button" onClick={closeModal}>
            Понятно
          </Button>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Label error={errors.email?.message}>
            Email
            <Input type="email" autoComplete="email" hasError={!!errors.email} {...registerField('email')} />
          </Label>

          {serverError && (
            <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {serverError}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Подождите…' : 'Отправить'}
          </Button>
        </form>
      )}

      <Button
        variant="ghost"
        square
        aria-label="Закрыть"
        commandfor={FORGOT_PASSWORD_MODAL_ID}
        command="close"
        className="absolute right-0 top-0"
      >
        ✕
      </Button>
    </Modal>
  )
}

export { ForgotPasswordModal, FORGOT_PASSWORD_MODAL_ID }
