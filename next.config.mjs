/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "api.qrserver.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/bazi", destination: "/lifekline", permanent: false },
      { source: "/chart", destination: "/lifekline", permanent: false },
      { source: "/palm", destination: "/xiang", permanent: false },
      { source: "/face", destination: "/xiang", permanent: false },
      { source: "/settings", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
