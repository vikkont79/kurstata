'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/shared/ui/button/Button'
import { Input } from '@/shared/ui/input/Input'
import { Label } from '@/shared/ui/label/Label'
import { Modal } from '@/shared/ui/modal/Modal'
import { resetPasswordSchema, INVALID_LINK_MESSAGE } from '@/features/auth/types'
import { resetPassword } from '@/features/auth/api/resetPassword'
import { FORGOT_PASSWORD_MODAL_ID } from '@/features/auth/ui/ForgotPasswordModal'

const RESET_PASSWORD_MODAL_ID = 'reset-password-modal'

const resetFormSchema = resetPasswordSchema
  .extend({
    confirmPassword: z.string().min(1, 'Повторите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

type ResetFormValues = z.infer<typeof resetFormSchema>

const ResetPasswordModal = ({ token }: { token: string }) => {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register: registerField,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetFormSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const isInvalidLink = serverError === INVALID_LINK_MESSAGE

  const closeModal = () => {
    const dialog = document.getElementById(RESET_PASSWORD_MODAL_ID)
    if (dialog instanceof HTMLDialogElement) {
      dialog.close()
    }
    reset()
    setServerError(null)
  }

  const openForgotPassword = () => {
    closeModal()
    const dialog = document.getElementById(FORGOT_PASSWORD_MODAL_ID)
    if (dialog instanceof HTMLDialogElement) {
      dialog.showModal()
    }
  }

  const onSubmit = async (data: ResetFormValues) => {
    setServerError(null)

    try {
      const result = await resetPassword(token, { password: data.password })

      if (!result.success) {
        setServerError(result.error)
        toast.error('Ошибка сброса пароля')
        return
      }

      toast.success('Пароль изменён')
      closeModal()
      const url = new URL(window.location.href)
      url.searchParams.delete('reset')
      router.replace(url.pathname + url.search, { scroll: false })
    } catch {
      setServerError('Не удалось связаться с сервером. Попробуйте позже')
      toast.error('Ошибка сброса пароля')
    }
  }

  return (
    <Modal id={RESET_PASSWORD_MODAL_ID} labelledBy={`${RESET_PASSWORD_MODAL_ID}-title`} className="relative">
      <h3 id={`${RESET_PASSWORD_MODAL_ID}-title`} className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Новый пароль
      </h3>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Label error={errors.password?.message}>
          Новый пароль
          <Input
            type="password"
            autoComplete="new-password"
            hasError={!!errors.password}
            {...registerField('password')}
          />
        </Label>

        <Label error={errors.confirmPassword?.message}>
          Повторите пароль
          <Input
            type="password"
            autoComplete="new-password"
            hasError={!!errors.confirmPassword}
            {...registerField('confirmPassword')}
          />
        </Label>

        {serverError && (
          <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {serverError}
          </p>
        )}

        {isInvalidLink ? (
          <Button type="button" onClick={openForgotPassword} className="w-full">
            Запросить новую ссылку
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Подождите…' : 'Сохранить'}
          </Button>
        )}
      </form>

      <Button
        variant="ghost"
        square
        aria-label="Закрыть"
        commandfor={RESET_PASSWORD_MODAL_ID}
        command="close"
        className="absolute right-0 top-0"
      >
        ✕
      </Button>
    </Modal>
  )
}

export { ResetPasswordModal, RESET_PASSWORD_MODAL_ID }
