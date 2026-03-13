export const fmt = (n) => {
  n = parseFloat(n) || 0;
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
  return '$' + n.toFixed(0);
};

export const fmtNum = (n) => (parseFloat(n) || 0).toLocaleString();
export const fmtPct = (n) => (parseFloat(n) || 0).toFixed(2) + '%';
export const fmtDate = (ts) => new Date(ts * 1000).toLocaleDateString();

export const colors = [
  '#6366f1','#22c55e','#3b82f6','#eab308','#ef4444','#06b6d4','#f97316',
  '#a855f7','#ec4899','#14b8a6','#84cc16','#f43f5e','#8b5cf6','#0ea5e9','#d946ef',
];
