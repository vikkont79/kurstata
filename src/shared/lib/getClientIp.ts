const getClientIp = (headers: Headers): string | null => {
  const forwardedFor = headers.get('x-forwarded-for')
  if (!forwardedFor) return null
  const first = forwardedFor.split(',')[0]?.trim()
  return first || null
}

export { getClientIp }