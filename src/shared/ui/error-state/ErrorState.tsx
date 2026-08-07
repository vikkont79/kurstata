const ErrorState = ({ message }: { message: string }) => {
  return (
    <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-8 text-center text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
      {message}
    </div>
  )
}

export { ErrorState }
