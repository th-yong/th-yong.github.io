/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.BASE_PATH || '',
  images: {
    unoptimized: true,
  },
  // 빌드 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 환경 변수를 클라이언트에 주입 (정적 사이트용)
  // NEXT_PUBLIC_ 접두사가 있어야 클라이언트에서 접근 가능
  // GITHUB_ 접두사는 예약어이므로 REPO_ 접두사 사용
  env: {
    NEXT_PUBLIC_ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
    NEXT_PUBLIC_REPO_OWNER: process.env.REPO_OWNER || 'th-yong',
    NEXT_PUBLIC_REPO_NAME: process.env.REPO_NAME || 'th-yong.github.io',
    NEXT_PUBLIC_REPO_BRANCH: process.env.REPO_BRANCH || 'main',
    // GITHUB_TOKEN은 보안상 클라이언트에 노출하지 않음 - 사용자가 입력하도록 함
  },
}

module.exports = nextConfig

