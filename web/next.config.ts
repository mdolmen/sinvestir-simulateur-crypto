import type { NextConfig } from "next";

// In local dev the Python API runs as a separate server; proxy /api/* to it.
// Defaults to 127.0.0.1:8000 (override with API_PROXY_ORIGIN). On Vercel the
// Python function is same-origin, so no rewrite is applied in production.
const apiProxyOrigin =
  process.env.API_PROXY_ORIGIN ??
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : "");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiProxyOrigin) return [];
    return [{ source: "/api/:path*", destination: `${apiProxyOrigin}/api/:path*` }];
  },
};

export default nextConfig;
