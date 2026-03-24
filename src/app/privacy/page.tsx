export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <p style={{ lineHeight: 1.8, color: "#D8D8D8", marginBottom: "18px" }}>
          EVNTSZN, powered by ORYX, may collect information provided by users,
          including contact details, account information, and transaction-related
          information, in order to operate the platform and provide services.
        </p>

        <p style={{ lineHeight: 1.8, color: "#D8D8D8", marginBottom: "18px" }}>
          Information may be used for customer support, platform operations,
          transaction processing, and service improvement.
        </p>

        <p style={{ lineHeight: 1.8, color: "#D8D8D8", marginBottom: "18px" }}>
          EVNTSZN does not sell personal information. Information may be shared with
          trusted service providers where necessary to process payments, support
          events, or maintain platform functionality.
        </p>

        <p style={{ lineHeight: 1.8, color: "#D8D8D8", marginBottom: "18px" }}>
          For privacy-related questions, contact{" "}
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
