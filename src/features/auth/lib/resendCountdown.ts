const getResendCountdownSeconds = (endsAtMs: number, nowMs: number = Date.now()): number => {
  if (endsAtMs <= 0) return 0
  return Math.max(0, Math.ceil((endsAtMs - nowMs) / 1000))
}

export { getResendCountdownSeconds }
