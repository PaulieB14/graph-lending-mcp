import { useState, useEffect } from 'react';
import GuidePage from './pages/GuidePage';
import OverviewPage from './pages/OverviewPage';
import ProtocolPage from './pages/ProtocolPage';
import RatesPage from './pages/RatesPage';
import ActivityPage from './pages/ActivityPage';
import ComparePage from './pages/ComparePage';

const TABS = [
  { id: 'guide', label: 'Guide' },
  { id: 'overview', label: 'Overview' },
  { id: 'protocol', label: 'Protocol Detail' },
  { id: 'rates', label: 'Interest Rates' },
  { id: 'activity', label: 'User Activity' },
  { id: 'compare', label: 'Compare' },
];

export default function App() {
  const [tab, setTab] = useState('guide');
  const [registry, setRegistry] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/registry')
      .then((r) => r.json())
      .then(setRegistry)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div style={{ padding: 40, color: '#ef4444', fontSize: 18 }}>Failed to connect. Make sure server is running.</div>;
  }

  const protocols = registry
    ? [...new Set(registry.map((r) => r.protocol))].sort()
    : [];

  return (
    <>
      <nav className="nav">
        <span className="nav-title">DeFi Lending</span>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-btn${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div className="container">
        {!registry ? (
          <div className="loading"><span className="spinner" />Loading...</div>
        ) : (
          <>
            {tab === 'guide' && <GuidePage registry={registry} onNavigate={setTab} />}
            {tab === 'overview' && <OverviewPage />}
            {tab === 'protocol' && <ProtocolPage protocols={protocols} />}
            {tab === 'rates' && <RatesPage protocols={protocols} />}
            {tab === 'activity' && <ActivityPage protocols={protocols} />}
            {tab === 'compare' && <ComparePage protocols={protocols} />}
          </>
        )}
      </div>
      <footer style={{ textAlign: 'center', padding: '24px 20px', color: 'var(--text2)', fontSize: 12, borderTop: '1px solid var(--border)', marginTop: 32 }}>
        Powered by <a href="https://thegraph.com" target="_blank" rel="noopener" style={{ color: 'var(--accent2)' }}>The Graph Protocol</a> &nbsp;&bull;&nbsp; Built on <a href="https://messari.io/subgraphs" target="_blank" rel="noopener" style={{ color: 'var(--accent2)' }}>Messari Standardized Subgraphs</a>
      </footer>
    </>
  );
}
