interface ModalProps {
  id: string
  labelledBy?: string
  className?: string
  children: React.ReactNode
}

const Modal = ({ id, labelledBy, className, children }: ModalProps) => {
  return (
    <dialog
      id={id}
      aria-labelledby={labelledBy}
      className={`m-auto w-full max-w-sm rounded-xl bg-white p-6 shadow-xl backdrop:bg-black/50 dark:bg-zinc-900 ${className ?? ''}`}
    >
      {children}
    </dialog>
  )
}

export { Modal }
