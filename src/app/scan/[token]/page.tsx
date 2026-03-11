import crypto from "crypto";

export const runtime = "nodejs";

const SECRET = process.env.QR_SECRET || "dev_secret";

function verify(token: string) {
  const parts = token.split(".");

  if (parts.length !== 4) {
    return { ok: false, reason: "Malformed token" };
  }

  const [publicId, eventId, expires, sig] = parts;

  if (Date.now() > Number(expires)) {
    return { ok: false, reason: "Expired" };
  }

  const payload = `${publicId}.${eventId}.${expires}`;

  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");

  if (expected !== sig) {
    return { ok: false, reason: "Invalid signature" };
  }

  return {
    ok: true,
    publicId,
    eventId,
  };
}

export default async function Page({
  params,
}: {
  params: { token: string };
}) {
  const result = verify(params.token);

  if (!result.ok) {
    return (
      <div style={{
        height: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle,#3b1a5c,#0a0612)",
        color: "white",
        textAlign: "center"
      }}>
        <div>
          <h1 style={{
            color: "#ff4d4d",
            fontSize: 48
          }}>
            ✕ INVALID
          </h1>

          <p>{result.reason}</p>

          <a href="/scanner/login">
            Staff login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: "100vh",
      display: "grid",
      placeItems: "center",
      background:
        "radial-gradient(circle,#3b1a5c,#0a0612)",
      color: "white",
      textAlign: "center"
    }}>
      <div>
        <h1 style={{
          color: "#4cff88",
          fontSize: 48
        }}>
          ✓ VALID
        </h1>

        <p>Ticket accepted</p>

        <p style={{ opacity: 0.6 }}>
          {result.publicId}
        </p>

        <a href="/scanner/login">
          Staff check-in
        </a>
      </div>
    </div>
  );
}
