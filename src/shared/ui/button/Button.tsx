type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonCommand = 'show-modal' | 'show' | 'close'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  command?: ButtonCommand
  commandfor?: string
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300',
  secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
  danger: 'bg-red-600 text-white hover:bg-red-500',
  ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
}

const getButtonClassName = (variant: ButtonVariant, className?: string): string =>
  `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${className ?? ''}`

const Button = ({ variant = 'primary', className, disabled, children, ...props }: ButtonProps) => {
  return (
    <button className={getButtonClassName(variant, className)} disabled={disabled} {...props}>
      {children}
    </button>
  )
}

export { Button, getButtonClassName }
