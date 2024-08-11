/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.**.**",
        port: "",
        pathname: "/**/*",
      },
    ],
  },
  transpilePackages: ["next-mdx-remote"],
};

export default nextConfig;
