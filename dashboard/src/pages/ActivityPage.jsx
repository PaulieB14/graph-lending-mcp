import { useState, useEffect, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import ProtocolSelect from '../components/ProtocolSelect';
import Loading from '../components/Loading';
import { fmtNum, fmtDate } from '../utils/format';
import { chartOpts } from '../utils/chartConfig';

export default function ActivityPage({ protocols }) {
  const [slug, setSlug] = useState('aave-v3');
  const [snapshots, setSnapshots] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const didAutoLoad = useRef(false);

  const load = () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    fetch(`/api/usage/${slug}?days=30`)
      .then((r) => r.json())
      .then(setSnapshots)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!didAutoLoad.current && slug) { didAutoLoad.current = true; load(); }
  }, []);

  if (loading) return <><ProtocolSelect protocols={protocols} value={slug} onChange={setSlug} onLoad={load} /><Loading /></>;
  if (error) return <><ProtocolSelect protocols={protocols} value={slug} onChange={setSlug} onLoad={load} /><div className="loading" style={{ color: 'var(--red)' }}>{error}</div></>;
  if (!snapshots) return <ProtocolSelect protocols={protocols} value={slug} onChange={setSlug} onLoad={load} />;

  const snaps = (snapshots || []).slice().reverse();
  const dates = snaps.map((s) => fmtDate(s.timestamp));

  const dauData = {
    labels: dates,
    datasets: [
      { label: 'Daily Active Users', data: snaps.map((s) => parseInt(s.dailyActiveUsers || 0)), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.3 },
      { label: 'Cumulative Users', data: snaps.map((s) => parseInt(s.cumulativeUniqueUsers || 0)), borderColor: '#22c55e', tension: 0.3, yAxisID: 'y1' },
    ],
  };
  const dauOpts = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { labels: { color: '#e1e4eb' } } },
    scales: {
      x: { ticks: { color: '#8b90a0', maxTicksLimit: 10 }, grid: { color: '#2d3148' } },
      y: { position: 'left', ticks: { color: '#8b90a0' }, grid: { color: '#2d3148' } },
      y1: { position: 'right', ticks: { color: '#22c55e' }, grid: { display: false } },
    },
  };

  const txnData = {
    labels: dates,
    datasets: [
      { label: 'Deposits', data: snaps.map((s) => parseInt(s.dailyDepositCount || 0)), backgroundColor: '#22c55e', borderRadius: 2 },
      { label: 'Borrows', data: snaps.map((s) => parseInt(s.dailyBorrowCount || 0)), backgroundColor: '#3b82f6', borderRadius: 2 },
      { label: 'Repays', data: snaps.map((s) => parseInt(s.dailyRepayCount || 0)), backgroundColor: '#eab308', borderRadius: 2 },
      { label: 'Liquidations', data: snaps.map((s) => parseInt(s.dailyLiquidateCount || 0)), backgroundColor: '#ef4444', borderRadius: 2 },
    ],
  };

  return (
    <>
      <ProtocolSelect protocols={protocols} value={slug} onChange={setSlug} onLoad={load} />
      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">Daily Active Users</div>
          <div className="chart-container"><Line data={dauData} options={dauOpts} /></div>
        </div>
        <div className="card">
          <div className="card-title">Daily Transactions</div>
          <div className="chart-container"><Bar data={txnData} options={chartOpts.bar(true)} /></div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Usage Metrics</div>
        <div className="scroll-table table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Active Users</th>
                <th style={{ textAlign: 'right' }}>Txns</th>
                <th style={{ textAlign: 'right' }}>Deposits</th>
                <th style={{ textAlign: 'right' }}>Borrows</th>
                <th style={{ textAlign: 'right' }}>Repays</th>
                <th style={{ textAlign: 'right' }}>Liquidations</th>
              </tr>
            </thead>
            <tbody>
              {snaps.map((s, i) => (
                <tr key={i}>
                  <td>{fmtDate(s.timestamp)}</td>
                  <td style={{ textAlign: 'right' }}>{fmtNum(s.dailyActiveUsers)}</td>
                  <td style={{ textAlign: 'right' }}>{fmtNum(s.dailyTransactionCount)}</td>
                  <td style={{ textAlign: 'right' }}>{fmtNum(s.dailyDepositCount)}</td>
                  <td style={{ textAlign: 'right' }}>{fmtNum(s.dailyBorrowCount)}</td>
                  <td style={{ textAlign: 'right' }}>{fmtNum(s.dailyRepayCount)}</td>
                  <td style={{ textAlign: 'right' }}>{fmtNum(s.dailyLiquidateCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
