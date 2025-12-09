/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript error checking during builds
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint during builds
  },
  serverExternalPackages: ['mongodb', 'mongoose', 'bcryptjs'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Ignore MongoDB optional dependencies for both client and server
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'mongodb-client-encryption': false,
      'aws4': false,
      'gcp-metadata': false,
      'snappy': false,
      'socks': false,
      'kerberos': false,
      '@mongodb-js/zstd': false,
      '@aws-sdk/credential-providers': false,
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'fs': false,
        'net': false,
        'tls': false,
        'crypto': false,
        'stream': false,
        'util': false,
        'url': false,
        'querystring': false,
      };
    }

    // Ignore optional MongoDB dependencies
    config.externals = config.externals || [];
    config.externals.push({
      'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
      'aws4': 'commonjs aws4',
      'gcp-metadata': 'commonjs gcp-metadata',
      'snappy': 'commonjs snappy',
      'socks': 'commonjs socks',
      'kerberos': 'commonjs kerberos',
      '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
      '@aws-sdk/credential-providers': 'commonjs @aws-sdk/credential-providers',
    });
    
    return config;
  },
};

module.exports = nextConfig;
