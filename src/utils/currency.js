export const formatCurrency = (value, options = {}) => {
  const amount = Number(value)
  const safeValue = Number.isFinite(amount) ? amount : 0

  let min = typeof options.minimumFractionDigits === 'number' ? options.minimumFractionDigits : 2
  let max = typeof options.maximumFractionDigits === 'number' ? options.maximumFractionDigits : 2

  if (max < min) {
    max = min
  }

  const formatted = safeValue.toLocaleString('en-IN', {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  })
  return `₹${formatted}`
}
