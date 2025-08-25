export const fmtMoney = (n?: number | null, dSmall = 6) =>
  n == null ? '—' : (Math.abs(Number(n)) >= 1
    ? Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n))
    : Number(n).toFixed(dSmall));

export const fmtCompact = (n?: number | null, d = 2) =>
  n == null ? '—' : Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: d }).format(n);

export const fmtDateShort = (ms: number, granularity: '24h'|'7d'|'30d'|'90d'|'1y') => {
  const d = new Date(ms);
  if (granularity === '24h') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
