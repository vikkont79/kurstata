'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button/Button'
import { AuthModal, AUTH_MODAL_ID } from '@/features/auth'
import { logout } from '@/features/auth/api/logout'

interface AuthControlsProps {
  userName?: string
  openAuthOnMount?: boolean
}

const AuthControls = ({ userName, openAuthOnMount }: AuthControlsProps) => {
  const router = useRouter()

  useEffect(() => {
    if (!openAuthOnMount || userName) {
      return
    }
    const dialog = document.getElementById(AUTH_MODAL_ID)
    if (dialog instanceof HTMLDialogElement) {
      dialog.showModal()
    }
    router.replace(window.location.pathname, { scroll: false })
  }, [openAuthOnMount, userName, router])

  const handleLogout = async () => {
    const result = await logout()
    if (!result.success) {
      toast.error('Не удалось выйти')
      return
    }
    router.refresh()
  }

  return (
    <>
      {userName ? (
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            title={userName}
          >
            {userName.slice(0, 2).toUpperCase()}
          </span>
          <Button variant="secondary" onClick={handleLogout}>
            Выйти
          </Button>
        </div>
      ) : (
        <Button variant="secondary" commandfor={AUTH_MODAL_ID} command="show-modal">
          Войти
        </Button>
      )}
      <AuthModal />
    </>
  )
}

export { AuthControls }
