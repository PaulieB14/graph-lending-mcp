import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import Loading from '../components/Loading';
import { NetIcon } from '../utils/icons';
import { fmt, fmtNum } from '../utils/format';
import { chartOpts } from '../utils/chartConfig';

const PRE_SELECTED = ['aave-v3', 'compound-v3', 'spark-lend', 'makerdao', 'aave-v2'];

export default function ComparePage({ protocols }) {
  const [selected, setSelected] = useState(new Set(PRE_SELECTED));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggle = (p) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p); else next.add(p);
      return next;
    });
  };

  const load = () => {
    const arr = [...selected];
    if (arr.length < 2) { alert('Select at least 2 protocols'); return; }
    setLoading(true);
    setError(null);
    fetch('/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ protocols: arr }),
    })
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const chartData = data ? {
    labels: data.map((d) => d.slug || d.protocol),
    datasets: [
      { label: 'TVL', data: data.map((d) => parseFloat(d.totalValueLockedUSD || 0)), backgroundColor: '#6366f1', borderRadius: 3 },
      { label: 'Deposits', data: data.map((d) => parseFloat(d.totalDepositBalanceUSD || 0)), backgroundColor: '#22c55e', borderRadius: 3 },
      { label: 'Borrows', data: data.map((d) => parseFloat(d.totalBorrowBalanceUSD || 0)), backgroundColor: '#3b82f6', borderRadius: 3 },
    ],
  } : null;

  return (
    <>
      <p className="tab-desc">Select 2+ protocols to compare side-by-side.</p>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Select Protocols</div>
        <div className="chip-container">
          {protocols.map((p) => (
            <span key={p} className={`chip${selected.has(p) ? ' selected' : ''}`} onClick={() => toggle(p)}>{p}</span>
          ))}
        </div>
      </div>
      <div className="controls">
        <button className="btn" onClick={load}>Compare Selected</button>
      </div>

      {loading && <Loading />}
      {error && <div className="loading" style={{ color: 'var(--red)' }}>{error}</div>}

      {chartData && (
        <>
          <div className="card">
            <div className="card-title">TVL Comparison</div>
            <div className="chart-container"><Bar data={chartData} options={chartOpts.bar(false, (v) => fmt(v))} /></div>
          </div>
          <div className="card" style={{ marginTop: 16 }}>
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
                  {data.map((d, i) => (
                    <tr key={i}>
                      <td><strong>{d.slug || d.protocol}</strong></td>
                      <td><span className="badge-network"><NetIcon network={d.network} className="icon-sm" /> {d.network}</span></td>
                      <td style={{ textAlign: 'right' }}>{fmt(d.totalValueLockedUSD)}</td>
                      <td style={{ textAlign: 'right' }}>{fmt(d.totalDepositBalanceUSD)}</td>
                      <td style={{ textAlign: 'right' }}>{fmt(d.totalBorrowBalanceUSD)}</td>
                      <td style={{ textAlign: 'right' }}>{fmtNum(d.cumulativeUniqueUsers)}</td>
                      <td style={{ textAlign: 'right' }}>{d.totalPoolCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
