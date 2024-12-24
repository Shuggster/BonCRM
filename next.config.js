/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PORT: process.env.PORT || "3001",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  serverRuntimeConfig: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  publicRuntimeConfig: {
    // Add public runtime configs here if needed
  },
}

module.exports = nextConfig
