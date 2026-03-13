export default function ProtocolSelect({ protocols, value, onChange, onLoad, label = 'Load' }) {
  return (
    <div className="controls">
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select protocol...</option>
        {protocols.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <button className="btn" onClick={onLoad}>{label}</button>
    </div>
  );
}
