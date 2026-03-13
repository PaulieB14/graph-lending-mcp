import { fmt } from './format';

export const chartOpts = {
  line: (yFmt) => ({
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { labels: { color: '#e1e4eb' } } },
    scales: {
      x: { ticks: { color: '#8b90a0', maxTicksLimit: 10 }, grid: { color: '#2d3148' } },
      y: { ticks: { color: '#8b90a0', callback: yFmt || (v => fmt(v)) }, grid: { color: '#2d3148' } },
    },
  }),
  bar: (stacked, yFmt) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#e1e4eb' } } },
    scales: {
      x: { stacked, ticks: { color: '#8b90a0', maxTicksLimit: 10 }, grid: { color: '#2d3148' } },
      y: { stacked, ticks: { color: '#8b90a0', callback: yFmt || (v => v) }, grid: { color: '#2d3148' } },
    },
  }),
  hbar: {
    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#8b90a0', callback: v => fmt(v) }, grid: { color: '#2d3148' } },
      y: { ticks: { color: '#e1e4eb', font: { size: 11 } }, grid: { display: false } },
    },
  },
};
