export default function Dashboard() {
  return (
    <main style={{padding: 32, fontFamily: 'system-ui'}}>
      <h1 style={{fontSize: 42, margin: 0}}>ORYX Dashboard</h1>

      <div style={{marginTop: 16, lineHeight: 1.8}}>
        <div><strong>Organization:</strong> No org selected</div>
        <div><strong>Role:</strong> No role assigned</div>
        <div><strong>Modules:</strong> None</div>
      </div>

      <p style={{marginTop: 24, opacity: 0.85}}>Admin system is active.</p>

      <div style={{marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap'}}>
        <a href="/admin" style={{padding: '10px 14px', border: '1px solid #444', borderRadius: 10}}>Admin</a>
        <a href="/" style={{padding: '10px 14px', border: '1px solid #444', borderRadius: 10}}>Home</a>
      </div>
    </main>
  );
}
