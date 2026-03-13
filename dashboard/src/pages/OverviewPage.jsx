import { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import StatCard from '../components/StatCard';
import Loading from '../components/Loading';
import { NetIcon } from '../utils/icons';
import { fmt, fmtNum, colors } from '../utils/format';
import { chartOpts } from '../utils/chartConfig';

export default function OverviewPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/protocols')
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="loading" style={{ color: 'var(--red)' }}>{error}</div>;
  if (!data) return <Loading />;

  const { protocols, live } = data;
  const totalTvl = protocols.reduce((s, p) => s + parseFloat(p.totalValueLockedUSD || 0), 0);
  const totalUsers = protocols.reduce((s, p) => s + parseInt(p.cumulativeUniqueUsers || 0), 0);
  const totalPools = protocols.reduce((s, p) => s + parseInt(p.totalPoolCount || 0), 0);

  const top10 = protocols.slice(0, 10);
  const barData = {
    labels: top10.map((p) => p.slug.replace(/-/g, ' ')),
    datasets: [{
      label: 'TVL', data: top10.map((p) => parseFloat(p.totalValueLockedUSD || 0)),
      backgroundColor: colors.slice(0, 10), borderRadius: 4,
    }],
  };

  const byNet = {};
  protocols.forEach((p) => {
    const n = p.network || '?';
    byNet[n] = (byNet[n] || 0) + parseFloat(p.totalValueLockedUSD || 0);
  });
  const nets = Object.entries(byNet).sort((a, b) => b[1] - a[1]);
  const doughnutData = {
    labels: nets.map((e) => e[0]),
    datasets: [{ data: nets.map((e) => e[1]), backgroundColor: colors }],
  };
  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: '#e1e4eb', font: { size: 11 }, padding: 8, boxWidth: 12 } } },
  };

  return (
    <>
      <p className="tab-desc">Global view of curated lending protocols. All data uses universal fields that work across every schema version.</p>
      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <StatCard title="Total TVL" value={fmt(totalTvl)} sub={`${live} live protocols`} />
        <StatCard title="Unique Users" value={fmtNum(totalUsers)} sub="Cumulative" />
        <StatCard title="Total Pools" value={fmtNum(totalPools)} sub="All protocols" />
        <StatCard title="Live Protocols" value={live} sub="With data" />
      </div>
      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">TVL by Protocol (Top 10)</div>
          <div className="chart-container"><Bar data={barData} options={chartOpts.hbar} /></div>
        </div>
        <div className="card">
          <div className="card-title">TVL by Network</div>
          <div className="chart-container"><Doughnut data={doughnutData} options={doughnutOpts} /></div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">All Protocols</div>
        <div className="scroll-table table-wrap">
          <table>
            <thead>
              <tr>
                <th>Protocol</th><th>Network</th>
                <th style={{ textAlign: 'right' }}>TVL</th>
                <th style={{ textAlign: 'right' }}>Deposits</th>
                <th style={{ textAlign: 'right' }}>Borrows</th>
                <th style={{ textAlign: 'right' }}>Users</th>
                <th style={{ textAlign: 'right' }}>Pools</th>
              </tr>
            </thead>
            <tbody>
              {protocols.map((p, i) => (
                <tr key={i}>
                  <td><strong>{p.slug}</strong></td>
                  <td><span className="badge-network"><NetIcon network={p.network} className="icon-sm" /> {p.network}</span></td>
                  <td style={{ textAlign: 'right' }}>{fmt(p.totalValueLockedUSD)}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(p.totalDepositBalanceUSD)}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(p.totalBorrowBalanceUSD)}</td>
                  <td style={{ textAlign: 'right' }}>{fmtNum(p.cumulativeUniqueUsers)}</td>
                  <td style={{ textAlign: 'right' }}>{p.totalPoolCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
