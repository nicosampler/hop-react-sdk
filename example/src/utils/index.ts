export const formatNumber = (value: string | number): string =>
  Intl.NumberFormat('en', {
    maximumFractionDigits: 4,
  }).format(Number(value))
