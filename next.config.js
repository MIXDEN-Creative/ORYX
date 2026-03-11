/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  // Allow Cloudflare Tunnel to request Next dev assets (/_next/*) without getting blocked
  // IMPORTANT: use HOSTNAMES (no https://)
  allowedDevOrigins: [
    "equipped-included-fish-armstrong.trycloudflare.com",
    "departments-referred-views-female.trycloudflare.com",
    "*.trycloudflare.com",
  ],

  // Optional: helps in monorepos so Next doesn't guess workspace root wrong
  outputFileTracingRoot: path.resolve(__dirname, "../../../.."),
};

module.exports = nextConfig;
