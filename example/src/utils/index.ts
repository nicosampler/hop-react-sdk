export const formatNumber = (value: number): string =>
  value !== undefined
    ? Intl.NumberFormat('en', {
        maximumFractionDigits: 4,
      }).format(value)
    : ''
