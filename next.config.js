/** @type {import('next').NextConfig} */
const nextConfig = {
   experimental: {
      esmExternals: "loose",
      serverComponentsExternalPackages: ["mongoose", "bcryptjs"]
   },
   async redirects() {
      return [
         {
            source: '/',
            destination: `/live/${process.env.LIVE_DEFAULT_INTERVAL}`,
            permanent: false,
         },
         {
            source: '/live',
            destination: `/live/${process.env.LIVE_DEFAULT_INTERVAL}`,
            permanent: false,
         }
      ];
   }
}

module.exports = nextConfig
// module.exports = {}
