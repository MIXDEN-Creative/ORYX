export default function TermsPage() {
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
          Terms of Service
        </h1>

        <p style={{ lineHeight: 1.8, color: "#D8D8D8", marginBottom: "18px" }}>
          By accessing or using EVNTSZN, you agree to use the platform only for
          lawful purposes and in accordance with these terms.
        </p>

        <p style={{ lineHeight: 1.8, color: "#D8D8D8", marginBottom: "18px" }}>
          EVNTSZN provides tools for event discovery, ticket sales, event
          management, and related services for attendees and organizers.
        </p>

        <p style={{ lineHeight: 1.8, color: "#D8D8D8", marginBottom: "18px" }}>
          Event organizers are responsible for the accuracy of their event listings,
          event execution, and compliance with applicable laws and regulations.
        </p>

        <p style={{ lineHeight: 1.8, color: "#D8D8D8", marginBottom: "18px" }}>
          EVNTSZN reserves the right to remove content, suspend accounts, or limit
          access to the platform where necessary to protect the business, users, or
          the integrity of the platform.
        </p>

        <p style={{ lineHeight: 1.8, color: "#D8D8D8", marginBottom: "18px" }}>
          For support or legal inquiries, contact{" "}
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