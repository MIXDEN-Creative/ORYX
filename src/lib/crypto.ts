import crypto from "crypto";

function toBase64Url(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(s: string) {
  const pad = 4 - (s.length % 4 || 4);
  const base64 = (s + "=".repeat(pad)).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64");
}

export function signPayload(payload: string, secret: string) {
  const key = Buffer.from(secret, "utf8");
  const sig = crypto.createHmac("sha256", key).update(payload).digest();
  return toBase64Url(sig);
}

export function verifyPayload(payload: string, sigB64Url: string, secret: string) {
  try {
    const expected = signPayload(payload, secret);
    const a = fromBase64Url(expected);
    const b = fromBase64Url(sigB64Url);

    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
