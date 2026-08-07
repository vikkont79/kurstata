type MetricCellProps = {
  label: string
  value: string
}

const MetricCell = ({ label, value }: MetricCellProps) => {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className="font-medium text-zinc-800 dark:text-zinc-200">{value}</span>
    </div>
  )
}

export { MetricCell }
