import Link from "next/link";

export default function HomePage() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.badge}>EVNTSZN</div>
        <h1 style={styles.h1}>The next generation event platform</h1>
        <p style={styles.subtext}>
          EVNTSZN is a ticketing and event management platform that helps people
          discover events, purchase tickets, and helps organizers create, manage,
          and monetize events.
        </p>

        <div style={styles.buttonRow}>
          <a href="mailto:support@evntszn.com" style={styles.primaryButton}>
            Contact Support
          </a>
          <a href="#services" style={styles.secondaryButton}>
            View Services
          </a>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>About EVNTSZN</h2>
        <p style={styles.bodyText}>
          EVNTSZN provides event discovery, digital ticket sales, organizer tools,
          event management features, and event check-in solutions for live experiences.
          The platform is built for attendees seeking events and for organizers who
          want to host, manage, and grow their events.
        </p>
      </section>

      <section id="services" style={styles.section}>
        <h2 style={styles.h2}>Services</h2>

        <div style={styles.cardGrid}>
          <div style={styles.card}>
            <h3 style={styles.h3}>For Attendees</h3>
            <ul style={styles.list}>
              <li>Discover events and live experiences</li>
              <li>Purchase event tickets online</li>
              <li>Receive digital ticket confirmations</li>
              <li>Attend hosted events promoted through EVNTSZN</li>
            </ul>
          </div>

          <div style={styles.card}>
            <h3 style={styles.h3}>For Organizers</h3>
            <ul style={styles.list}>
              <li>Create and publish events</li>
              <li>Sell tickets through the platform</li>
              <li>Manage attendance and event operations</li>
              <li>Use event check-in and organizer tools</li>
            </ul>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Customer Support</h2>
        <p style={styles.bodyText}>
          For questions related to tickets, support, disputes, or platform use,
          contact us at:
        </p>
        <p style={styles.contact}>
          <strong>Email:</strong>{" "}
          <a href="mailto:support@evntszn.com" style={styles.link}>
            support@evntszn.com
          </a>
        </p>
        <p style={styles.contact}>
          <strong>Business:</strong> EVNTSZN
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.h2}>Policies</h2>
        <div style={styles.policyLinks}>
          <Link href="/refund-policy" style={styles.linkButton}>
            Refund Policy
          </Link>
          <Link href="/terms" style={styles.linkButton}>
            Terms of Service
          </Link>
          <Link href="/privacy" style={styles.linkButton}>
            Privacy Policy
          </Link>
        </div>
      </section>

      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2026 EVNTSZN. All rights reserved.</p>
        <div style={styles.footerLinks}>
          <Link href="/refund-policy" style={styles.footerLink}>
            Refund Policy
          </Link>
          <Link href="/terms" style={styles.footerLink}>
            Terms
          </Link>
          <Link href="/privacy" style={styles.footerLink}>
            Privacy
          </Link>
        </div>
      </footer>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#000000",
    color: "#F5F5F5",
    fontFamily: "Arial, sans-serif",
    padding: "0",
    margin: "0",
  },
  hero: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "100px 24px 60px",
    textAlign: "center",
  },
  badge: {
    display: "inline-block",
    padding: "8px 14px",
    border: "1px solid #A259FF",
    borderRadius: "999px",
    color: "#A259FF",
    marginBottom: "24px",
    fontWeight: 700,
    letterSpacing: "0.08em",
  },
  h1: {
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
    lineHeight: 1.05,
    marginBottom: "20px",
    fontWeight: 800,
  },
  subtext: {
    fontSize: "1.1rem",
    lineHeight: 1.7,
    color: "#D0D0D0",
    maxWidth: "760px",
    margin: "0 auto 32px",
  },
  buttonRow: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryButton: {
    backgroundColor: "#A259FF",
    color: "#000000",
    padding: "14px 22px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: 700,
  },
  secondaryButton: {
    border: "1px solid #444",
    color: "#F5F5F5",
    padding: "14px 22px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: 700,
  },
  section: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "30px 24px 40px",
  },
  h2: {
    fontSize: "2rem",
    marginBottom: "16px",
    color: "#FFFFFF",
  },
  h3: {
    fontSize: "1.2rem",
    marginBottom: "12px",
    color: "#FFFFFF",
  },
  bodyText: {
    fontSize: "1rem",
    lineHeight: 1.8,
    color: "#D8D8D8",
    maxWidth: "850px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    backgroundColor: "#111111",
    border: "1px solid #2A2A2A",
    borderRadius: "16px",
    padding: "24px",
  },
  list: {
    paddingLeft: "20px",
    lineHeight: 1.9,
    color: "#D8D8D8",
  },
  contact: {
    fontSize: "1rem",
    lineHeight: 1.8,
    color: "#D8D8D8",
    margin: "4px 0",
  },
  link: {
    color: "#A259FF",
    textDecoration: "none",
  },
  policyLinks: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    marginTop: "16px",
  },
  linkButton: {
    padding: "12px 16px",
    border: "1px solid #A259FF",
    borderRadius: "10px",
    color: "#A259FF",
    textDecoration: "none",
    fontWeight: 700,
  },
  footer: {
    borderTop: "1px solid #1F1F1F",
    marginTop: "40px",
    padding: "24px",
    textAlign: "center",
  },
  footerText: {
    color: "#AFAFAF",
    marginBottom: "12px",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  footerLink: {
    color: "#A259FF",
    textDecoration: "none",
  },
};