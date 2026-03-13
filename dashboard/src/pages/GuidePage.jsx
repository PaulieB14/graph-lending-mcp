import { NetIcon } from '../utils/icons';

export default function GuidePage({ registry, onNavigate }) {
  const byNet = {};
  registry.forEach((r) => {
    if (!byNet[r.network]) byNet[r.network] = new Set();
    byNet[r.network].add(r.protocol);
  });
  const sorted = Object.entries(byNet).sort((a, b) => b[1].size - a[1].size);

  return (
    <>
      <div className="guide-hero">
        <h1>DeFi <span>Lending</span> Dashboard</h1>
        <p>Live data from {registry.length} lending deployments across {Object.keys(byNet).length} networks via The Graph.</p>
        <p style={{ color: 'var(--text2)', fontSize: 12, marginTop: 8 }}>
          Powered by <a href="https://thegraph.com" target="_blank" rel="noopener" style={{ color: 'var(--accent2)' }}>The Graph Protocol</a> &bull; <a href="https://messari.io/subgraphs" target="_blank" rel="noopener" style={{ color: 'var(--accent2)' }}>Messari Standardized Subgraph Schema</a>
        </p>
      </div>

      <div className="guide-enter">
        <button className="btn" onClick={() => onNavigate('overview')}>Enter Dashboard</button>
      </div>

      <div className="guide-section">
        <h2>Protocols by Network</h2>
        {sorted.map(([net, protos]) => (
          <div className="net-group" key={net}>
            <h3><NetIcon network={net} className="icon-lg" /> {net} ({protos.size})</h3>
            <div className="net-chips">
              {[...protos].sort().map((p) => (
                <span className="net-chip" key={p}>{p}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="guide-section">
        <h2>Key Terms</h2>
        <p style={{ color: 'var(--text2)', fontSize: '13px', lineHeight: 1.8 }}>
          <strong>TVL</strong> — Total USD value locked &nbsp;&bull;&nbsp;
          <strong>Supply APR</strong> — Annual rate earned by lenders &nbsp;&bull;&nbsp;
          <strong>Borrow APR</strong> — Annual rate paid by borrowers &nbsp;&bull;&nbsp;
          <strong>Liquidation</strong> — Forced repayment when collateral drops &nbsp;&bull;&nbsp;
          <strong>Market</strong> — Single lending pool for one asset &nbsp;&bull;&nbsp;
          <strong>DAU</strong> — Daily active wallets
        </p>
      </div>
    </>
  );
}
