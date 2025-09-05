
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // This is required to allow the Next.js dev server to accept requests from the
  // Cloud Workstations proxy.
  allowedDevOrigins: [
    'https://*.cloudworkstations.dev', 'localhost:3000', 'localhost:9003', 'localhost:9002','192.168.2.58', "https://9000-firebase-studio-1756568209616.cluster-76blnmxvvzdpat4inoxk5tmzik.cloudworkstations.dev"
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
