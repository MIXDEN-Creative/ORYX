import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ScanLanding({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  // If someone hits /scan?token=XYZ, redirect to the real route
  if (token) {
    redirect(`/scan/${encodeURIComponent(token)}`);
  }

  // Pure server-rendered page: no window checks, no hydration mismatch
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(900px 520px at 50% 30%, rgba(162,89,255,0.22), rgba(0,0,0,1) 70%)",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "min(720px, 92vw)", textAlign: "center" }}>
        <div style={{ fontWeight: 900, letterSpacing: 1, fontSize: 34 }}>
          EVNTSZN SCAN
        </div>

        <div style={{ marginTop: 14, opacity: 0.8, lineHeight: 1.4 }}>
          Scan a ticket QR to validate it.
          <br />
          Staff check-in stays protected behind login.
        </div>

        <div style={{ marginTop: 20 }}>
          <Link
            href="/login"
            style={{
              color: "#A259FF",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
