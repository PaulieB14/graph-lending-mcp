import { useState, useEffect, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import StatCard from '../components/StatCard';
import ProtocolSelect from '../components/ProtocolSelect';
import Loading from '../components/Loading';
import { TokIcon } from '../utils/icons';
import { fmt, fmtNum, fmtPct, fmtDate } from '../utils/format';
import { chartOpts } from '../utils/chartConfig';

export default function ProtocolPage({ protocols }) {
  const [slug, setSlug] = useState('aave-v3');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const didAutoLoad = useRef(false);

  const load = () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`/api/protocol/${slug}`).then((r) => r.json()),
      fetch(`/api/markets/${slug}?first=50`).then((r) => r.json()),
      fetch(`/api/financials/${slug}?days=30`).then((r) => r.json()),
    ])
      .then(([proto, markets, fin]) => setData({ proto, markets, fin }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!didAutoLoad.current && slug) { didAutoLoad.current = true; load(); }
  }, []);

  if (loading) return <><ProtocolSelect protocols={protocols} value={slug} onChange={setSlug} onLoad={load} /><Loading /></>;
  if (error) return <><ProtocolSelect protocols={protocols} value={slug} onChange={setSlug} onLoad={load} /><div className="loading" style={{ color: 'var(--red)' }}>{error}</div></>;
  if (!data) return <ProtocolSelect protocols={protocols} value={slug} onChange={setSlug} onLoad={load} />;

  const { proto, markets, fin } = data;
  const finR = (fin || []).slice().reverse();
  const dates = finR.map((f) => fmtDate(f.timestamp));

  const lineData = {
    labels: dates,
    datasets: [
      { label: 'TVL', data: finR.map((f) => parseFloat(f.totalValueLockedUSD || 0)), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.3 },
      { label: 'Daily Deposits', data: finR.map((f) => parseFloat(f.dailyDepositUSD || 0)), borderColor: '#22c55e', tension: 0.3 },
      { label: 'Daily Borrows', data: finR.map((f) => parseFloat(f.dailyBorrowUSD || 0)), borderColor: '#3b82f6', tension: 0.3 },
    ],
  };

  const barData = {
    labels: dates,
    datasets: [
      { label: 'Daily Deposits', data: finR.map((f) => parseFloat(f.dailyDepositUSD || 0)), backgroundColor: '#22c55e', borderRadius: 2 },
      { label: 'Daily Borrows', data: finR.map((f) => parseFloat(f.dailyBorrowUSD || 0)), backgroundColor: '#3b82f6', borderRadius: 2 },
      { label: 'Daily Liquidations', data: finR.map((f) => parseFloat(f.dailyLiquidateUSD || 0)), backgroundColor: '#ef4444', borderRadius: 2 },
    ],
  };

  const mks = markets || [];

  return (
    <>
      <ProtocolSelect protocols={protocols} value={slug} onChange={setSlug} onLoad={load} />
      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <StatCard title="TVL" value={fmt(proto.totalValueLockedUSD)} />
        <StatCard title="Deposits" value={fmt(proto.totalDepositBalanceUSD)} />
        <StatCard title="Borrows" value={fmt(proto.totalBorrowBalanceUSD)} />
        <StatCard title="Users" value={fmtNum(proto.cumulativeUniqueUsers)} sub={`${proto.totalPoolCount} pools`} />
      </div>
      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">TVL & Volume (30d)</div>
          <div className="chart-container"><Line data={lineData} options={chartOpts.line()} /></div>
        </div>
        <div className="card">
          <div className="card-title">Daily Activity (30d)</div>
          <div className="chart-container"><Bar data={barData} options={chartOpts.bar(true, (v) => fmt(v))} /></div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-title">Markets</div>
        <div className="scroll-table table-wrap">
          <table>
            <thead>
              <tr>
                <th>Market</th><th>Token</th>
                <th style={{ textAlign: 'right' }}>TVL</th>
                <th style={{ textAlign: 'right' }}>Deposits</th>
                <th style={{ textAlign: 'right' }}>Borrows</th>
                <th style={{ textAlign: 'right' }}>Supply APR</th>
                <th style={{ textAlign: 'right' }}>Borrow APR</th>
              </tr>
            </thead>
            <tbody>
              {mks.map((m, i) => {
                const sr = m.rates?.find((r) => r.side === 'LENDER')?.rate;
                const br = m.rates?.find((r) => r.side === 'BORROWER')?.rate;
                return (
                  <tr key={i}>
                    <td>{m.name || m.id?.slice(0, 10)}</td>
                    <td><span className="token-cell"><TokIcon symbol={m.inputToken?.symbol} /> {m.inputToken?.symbol || '?'}</span></td>
                    <td style={{ textAlign: 'right' }}>{fmt(m.totalValueLockedUSD)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt(m.totalDepositBalanceUSD)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt(m.totalBorrowBalanceUSD)}</td>
                    <td style={{ textAlign: 'right' }} className="positive">{sr ? fmtPct(sr) : '--'}</td>
                    <td style={{ textAlign: 'right' }} className="negative">{br ? fmtPct(br) : '--'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
