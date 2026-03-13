import { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import ProtocolSelect from '../components/ProtocolSelect';
import Loading from '../components/Loading';
import { TokIcon } from '../utils/icons';
import { fmt, fmtPct } from '../utils/format';
import { chartOpts } from '../utils/chartConfig';

export default function RatesPage({ protocols }) {
  const [slug, setSlug] = useState('aave-v3');
  const [markets, setMarkets] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const didAutoLoad = useRef(false);

  const load = () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    fetch(`/api/rates/${slug}`)
      .then((r) => r.json())
      .then(setMarkets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!didAutoLoad.current && slug) { didAutoLoad.current = true; load(); }
  }, []);

  if (loading) return <><ProtocolSelect protocols={protocols} value={slug} onChange={setSlug} onLoad={load} label="Load Rates" /><Loading /></>;
  if (error) return <><ProtocolSelect protocols={protocols} value={slug} onChange={setSlug} onLoad={load} label="Load Rates" /><div className="loading" style={{ color: 'var(--red)' }}>{error}</div></>;
  if (!markets) return <ProtocolSelect protocols={protocols} value={slug} onChange={setSlug} onLoad={load} label="Load Rates" />;

  const top = markets.slice(0, 15);
  const chartData = {
    labels: top.map((m) => m.inputToken?.symbol || '?'),
    datasets: [
      { label: 'Supply APR %', data: top.map((m) => parseFloat(m.rates?.find((r) => r.side === 'LENDER')?.rate || 0)), backgroundColor: '#22c55e', borderRadius: 3 },
      { label: 'Borrow APR %', data: top.map((m) => parseFloat(m.rates?.find((r) => r.side === 'BORROWER')?.rate || 0)), backgroundColor: '#ef4444', borderRadius: 3 },
    ],
  };

  return (
    <>
      <ProtocolSelect protocols={protocols} value={slug} onChange={setSlug} onLoad={load} label="Load Rates" />
      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">Rate Comparison</div>
          <div className="chart-container"><Bar data={chartData} options={chartOpts.bar(false, (v) => v + '%')} /></div>
        </div>
        <div className="card">
          <div className="card-title">Rate Table</div>
          <div className="scroll-table table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Market</th><th>Token</th>
                  <th style={{ textAlign: 'right' }}>TVL</th>
                  <th style={{ textAlign: 'right' }}>Supply APR</th>
                  <th style={{ textAlign: 'right' }}>Borrow APR</th>
                </tr>
              </thead>
              <tbody>
                {markets.map((m, i) => {
                  const sr = m.rates?.find((r) => r.side === 'LENDER');
                  const br = m.rates?.find((r) => r.side === 'BORROWER');
                  return (
                    <tr key={i}>
                      <td>{m.name || m.id?.slice(0, 10)}</td>
                      <td><span className="token-cell"><TokIcon symbol={m.inputToken?.symbol} /> {m.inputToken?.symbol || '?'}</span></td>
                      <td style={{ textAlign: 'right' }}>{fmt(m.totalValueLockedUSD)}</td>
                      <td style={{ textAlign: 'right' }} className="positive">{sr ? fmtPct(sr.rate) : '--'}</td>
                      <td style={{ textAlign: 'right' }} className="negative">{br ? fmtPct(br.rate) : '--'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
