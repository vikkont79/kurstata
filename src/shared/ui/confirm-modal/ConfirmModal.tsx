import { Button } from '@/shared/ui/button/Button'
import { Modal } from '@/shared/ui/modal/Modal'

interface ConfirmModalProps {
  id: string
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel?: () => void
}

const ConfirmModal = ({
  id,
  title,
  message,
  confirmLabel = 'Удалить',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const titleId = `${id}-title`

  return (
    <Modal id={id} labelledBy={titleId}>
      <h3 id={titleId} className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        {message}
      </p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" commandfor={id} command="close" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="danger" commandfor={id} command="close" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

export { ConfirmModal }
