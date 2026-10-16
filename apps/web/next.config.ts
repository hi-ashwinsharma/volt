import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@volt/types",
    "@volt/math",
    "@volt/policy",
    "@volt/config",
  ],
};

export default nextConfig;
