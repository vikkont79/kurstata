'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button/Button'
import { ConfirmModal } from '@/shared/ui/confirm-modal/ConfirmModal'
import { AuthForm, AUTH_MODAL_ID } from '@/features/auth'
import { logout } from '@/features/auth/api/logout'
import { ResetPasswordModal, RESET_PASSWORD_MODAL_ID } from '@/features/auth/ui/ResetPasswordModal'

const LOGOUT_CONFIRM_ID = 'logout-confirm-modal'

interface AuthControlsProps {
  userName?: string
  openAuthOnMount?: boolean
  returnTo?: string
  resetToken?: string
  sessionError?: boolean
}

const AuthControls = ({ userName, openAuthOnMount, returnTo, resetToken, sessionError }: AuthControlsProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!openAuthOnMount || userName) {
      return
    }
    const dialog = document.getElementById(AUTH_MODAL_ID)
    if (dialog instanceof HTMLDialogElement) {
      dialog.showModal()
    }
  }, [openAuthOnMount, userName, searchParams])

  useEffect(() => {
    if (sessionError) {
      toast.error('Не удалось загрузить профиль')
    }
  }, [sessionError])

  useEffect(() => {
    if (!resetToken || userName) {
      return
    }
    const dialog = document.getElementById(RESET_PASSWORD_MODAL_ID)
    if (dialog instanceof HTMLDialogElement) {
      dialog.showModal()
    }
  }, [resetToken, userName])

  const handleLogout = async () => {
    try {
      const result = await logout()
      if (!result.success) {
        toast.error('Не удалось выйти')
        return
      }
      router.refresh()
    } catch {
      toast.error('Не удалось выйти')
    }
  }

  return (
    <>
      {userName ? (
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
            title={userName}
          >
            {userName.slice(0, 2).toUpperCase()}
          </span>
          <Button
            variant="secondary"
            square
            aria-label="Выйти"
            commandfor={LOGOUT_CONFIRM_ID}
            command="show-modal"
          >
            🚪
          </Button>
        </div>
      ) : (
        <Button variant="secondary" square aria-label="Войти" commandfor={AUTH_MODAL_ID} command="show-modal">
          🔑
        </Button>
      )}
      <AuthForm returnTo={returnTo} />
      {resetToken && <ResetPasswordModal token={resetToken} />}
      <ConfirmModal
        id={LOGOUT_CONFIRM_ID}
        title="Выйти из аккаунта?"
        message="Вы действительно хотите выйти? Для повторного входа понадобится пароль."
        confirmLabel="Выйти"
        onConfirm={handleLogout}
      />
    </>
  )
}

export { AuthControls }
