import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PWA 지원을 위한 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // 이미지 최적화
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  // 환경변수 검증
  env: {
    CUSTOM_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'VocaAid',
    CUSTOM_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
  },
  // 성능 최적화
  experimental: {
    optimizePackageImports: ['@notionhq/client'],
  },
};

export default nextConfig;
