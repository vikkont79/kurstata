interface LabelProps {
  children: React.ReactNode
  error?: string
  className?: string
}

const Label = ({ children, error, className }: LabelProps) => {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ''}`}>
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {children}
      </span>
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </label>
  )
}

export { Label }
