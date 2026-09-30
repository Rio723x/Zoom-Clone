import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // StrictMode's dev-only double mount makes the video SDK provider call join() twice,
  // and the second call rejects with ERROR_OPERATION_IN_PROGRESS (an unhandled rejection).
  reactStrictMode: false,
};

export default nextConfig;
