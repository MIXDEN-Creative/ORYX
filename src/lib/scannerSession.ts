import crypto from "crypto";

type ScannerSession = {
  orgId: string;
  orgSlug: string;
  staffId: string;
  staffName: string;
  iat: number;
};

function getSecret() {
  const secret = process.env.SCANNER_SESSION_SECRET || "";
  if (!secret) {
    throw new Error("Missing SCANNER_SESSION_SECRET");
  }
  return secret;
}

function b64url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function unb64url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64").toString("utf8");
}

function sign(data: string) {
  return b64url(
    crypto.createHmac("sha256", getSecret()).update(data).digest()
  );
}

export function createScannerSession(payload: ScannerSession) {
  const body = b64url(JSON.stringify(payload));
  const sig = sign(body);
  return `${body}.${sig}`;
}

export function readScannerSession(token?: string | null): ScannerSession | null {
  try {
    if (!token) return null;
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;

    const expected = sign(body);

    const a = Buffer.from(sig);
    const b = Buffer.from(expected);

    if (a.length !== b.length) return null;
    if (!crypto.timingSafeEqual(a, b)) return null;

    const parsed = JSON.parse(unb64url(body));
    if (!parsed?.orgId || !parsed?.orgSlug || !parsed?.staffId) return null;

    return parsed;
  } catch {
    return null;
  }
}
