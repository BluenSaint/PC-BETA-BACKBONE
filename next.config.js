/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export to enable middleware and authentication
  // output: 'export',
  
  // Configure images for server-side rendering
  images: {
    domains: ['clerk.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Explicitly include admin routes
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Ensure all routes are properly generated
  trailingSlash: false,
  
  // Add rewrites for admin routes
  async rewrites( ) {
    return [
      {
        source: '/login',
        destination: '/login',
      },
      {
        source: '/signup',
        destination: '/signup',
      },
      {
        source: '/admin/control',
        destination: '/admin/control',
      },
      {
        source: '/admin/control/:path*',
        destination: '/admin/control/:path*',
      },
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      }
    ];
  },
  
  // Add CORS headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' }
        ]
      }
    ];
  }
};
module.exports = nextConfig;
