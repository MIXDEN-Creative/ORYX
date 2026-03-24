export default function RefundPolicyPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "#F5F5F5",
        padding: "40px 24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "24px" }}>
          Refund and Dispute Policy
        </h1>

        <p style={{ lineHeight: 1.8, color: "#D8D8D8", marginBottom: "18px" }}>
          EVNTSZN, powered by ORYX, is a ticketing and event management platform
          that helps facilitate ticket sales between event organizers and attendees.
        </p>

        <p style={{ lineHeight: 1.8, color: "#D8D8D8", marginBottom: "18px" }}>
          Unless otherwise stated on a specific event page, all ticket purchases are
          final. Refund eligibility may depend on the organizer’s policy and the
          circumstances surrounding the event.
        </p>

        <p style={{ lineHeight: 1.8, color: "#D8D8D8", marginBottom: "18px" }}>
          If an event is canceled and not rescheduled, customers may be eligible for
          a full refund.
        </p>

        <p style={{ lineHeight: 1.8, color: "#D8D8D8", marginBottom: "18px" }}>
          If an event is postponed or rescheduled, tickets may remain valid for the
          new event date unless otherwise communicated.
        </p>

        <p style={{ lineHeight: 1.8, color: "#D8D8D8", marginBottom: "18px" }}>
          For disputes, refund questions, or ticket issues, contact{" "}
          <a
            href="mailto:support@evntszn.com"
            style={{ color: "#A259FF", textDecoration: "none" }}
          >
            support@evntszn.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
