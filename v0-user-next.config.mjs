/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  // Desabilitar a geração estática completamente
  output: 'standalone',
  // Configuração para evitar pré-renderização de páginas que dependem de dados dinâmicos
  staticPageGenerationTimeout: 1000,
}

export default nextConfig

