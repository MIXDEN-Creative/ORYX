import crypto from "crypto";

export function hashScannerPin(pin: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pin, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyScannerPin(pin: string, stored: string) {
  try {
    const [salt, hash] = String(stored || "").split(":");
    if (!salt || !hash) return false;

    const derived = crypto.scryptSync(pin, salt, 64).toString("hex");

    const a = Buffer.from(hash, "hex");
    const b = Buffer.from(derived, "hex");

    if (a.length !== b.length) return false;

    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
