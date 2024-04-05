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
            destination: `/en/dashboard/${process.env.DASHBOARD_DEFAULT_LINE}/${process.env.DASHBOARD_DEFAULT_NAME}`,
            permanent: false,
         },
         {
            source: '/:lng',
            destination: `/:lng/dashboard/${process.env.DASHBOARD_DEFAULT_LINE}/${process.env.DASHBOARD_DEFAULT_NAME}`,
            permanent: false,
         },
         {
            source: '/:lng/dashboard',
            destination: `/:lng/dashboard/${process.env.DASHBOARD_DEFAULT_LINE}/${process.env.DASHBOARD_DEFAULT_NAME}`,
            permanent: false,
         },
         {
            source: '/:lng/dashboard/:line',
            destination: `/:lng/dashboard/:line/${process.env.DASHBOARD_DEFAULT_NAME}`,
            permanent: false,
         }
      ];
   }
}

module.exports = nextConfig
// module.exports = {}
