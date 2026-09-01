// Formats a number using Indian digit grouping: 1234567 -> "₹12,34,567"
export function formatInr(amount: number): string {
  const rounded = Math.round(amount)
  const sign = rounded < 0 ? '-' : ''
  const s = Math.abs(rounded).toString()

  let grouped: string
  if (s.length <= 3) {
    grouped = s
  } else {
    const last3 = s.slice(-3)
    let rest = s.slice(0, -3)
    const parts: string[] = []
    while (rest.length > 2) {
      parts.unshift(rest.slice(-2))
      rest = rest.slice(0, -2)
    }
    if (rest) parts.unshift(rest)
    grouped = parts.join(',') + ',' + last3
  }

  return `${sign}\u20b9${grouped}`
}
