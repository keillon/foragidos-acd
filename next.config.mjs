let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true
  },
  // Add this section to exclude debug pages from the build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'md', 'mdx'],
  output: 'standalone',
  // Exclude debug routes from production build
  async rewrites () {
    return [
      {
        source: '/debug-visit',
        destination: '/404'
      },
      {
        source: '/debug',
        destination: '/404'
      },
      {
        source: '/test',
        destination: '/404'
      }
    ]
  }
}

mergeConfig(nextConfig, userConfig)

function mergeConfig (nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key]
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
