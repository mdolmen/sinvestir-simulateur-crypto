import type { NextConfig } from "next";

// In local dev the Python API runs as a separate server. Set API_PROXY_ORIGIN
// (e.g. http://127.0.0.1:8000) to proxy /api/* to it. On Vercel the Python
// function is same-origin, so no rewrite is needed.
const apiProxyOrigin = process.env.API_PROXY_ORIGIN;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiProxyOrigin) return [];
    return [{ source: "/api/:path*", destination: `${apiProxyOrigin}/api/:path*` }];
  },
};

export default nextConfig;
