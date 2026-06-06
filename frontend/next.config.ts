/** @type {import('next').NextConfig} */

const API_BASE_URL =
  process.env
    .NEXT_PUBLIC_BACKEND_URL ||
  'http://127.0.0.1:5000';

const nextConfig = {

  async rewrites() {

    return [

      {
        source: '/api/:path*',

        destination:
          `${API_BASE_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;