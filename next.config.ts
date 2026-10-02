import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // old slug with the «Николо-» misspelling
        source: "/trips/kaluga-nikolo-lenivets-2026",
        destination: "/trips/kaluga-nikola-lenivets-2026",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
