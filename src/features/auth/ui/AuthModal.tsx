import { Modal } from '@/shared/ui/modal/Modal'
import { AuthForm } from '@/features/auth/ui/AuthForm'

const AUTH_MODAL_ID = 'auth-modal'

const AuthModal = () => {
  const titleId = `${AUTH_MODAL_ID}-title`

  return (
    <Modal id={AUTH_MODAL_ID} labelledBy={titleId}>
      <h3 id={titleId} className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Авторизация
      </h3>
      <AuthForm modalId={AUTH_MODAL_ID} />
    </Modal>
  )
}

export { AuthModal, AUTH_MODAL_ID }
