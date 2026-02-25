export default function PackagesPage() {
  return (
    <div className="page">
      <div className="bg-orbs" />
      <div className="glass">
        <div className="hero" style={{ paddingBottom: 0 }}>
          <div className="kicker">
            <span className="brand-dot" />
            ORYX Plans
          </div>

          <div className="oryx" style={{ marginBottom: 6 }}>ORYX</div>

          <div className="subhead">
            Choose a package. After signup, you’ll land in your org dashboard.
          </div>

          <div style={{ marginTop: 14 }}>
            <a className="pill" href="/">Back to login</a>
          </div>
        </div>

        <div className="panel" style={{ borderLeft: "none", borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <div className="packGrid">
            <div className="pack">
              <div className="packTitle">ORYX CORE</div>
              <div className="packPrice">$19 per seat/month (annual) or $24 per seat/month (monthly)</div>
              <div className="packFit">
                Best fit: small teams that need the ORYX foundation (org dashboards, roles, internal comms, basic workflows).
              </div>
            </div>

            <div className="pack">
              <div className="packTitle">ORYX PRO</div>
              <div className="packPrice">$39 per seat/month (annual) or $49 per seat/month (monthly)</div>
              <div className="packFit">
                Best fit: teams that need heavier coordination + management controls (more workflow depth, better reporting, stronger admin).
              </div>
            </div>

            <div className="pack">
              <div className="packTitle">ORYX STUDIO</div>
              <div className="packPrice">$59 per seat/month (annual) or $74 per seat/month (monthly)</div>
              <div className="packFit">
                Best fit: labels, agencies, studios that actually need the “money + media” side (royalties/commissions, file ops, ticketing, video features).
              </div>
            </div>

            <div className="pack">
              <div className="packTitle">ORYX ENTERPRISE</div>
              <div className="packPrice">Custom (typical starting point: $7,500/month + $75/seat/month, annual)</div>
              <div className="packFit">
                Best fit: multi-department orgs that need SSO, custom security, SLAs, dedicated onboarding, and compliance-style controls.
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <button className="btn btnPrimary" onClick={() => alert("Next: we wire this to signup + billing.")}>
              Continue to account creation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
