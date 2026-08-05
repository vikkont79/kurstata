import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-zinc-100 ${
          hasError
            ? 'border-red-500 focus:ring-red-500'
            : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100'
        } ${className ?? ''}`}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
