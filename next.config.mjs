/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.AUTH_MODE === 'hybrid'
    ) {
      throw new Error('AUTH_MODE=hybrid is not allowed in production builds')
    }
    return config
  },
}

export default nextConfig
