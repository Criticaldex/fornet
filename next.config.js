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
            destination: `/dashboard/${process.env.DASHBOARD_DEFAULT_LINE}/${process.env.DASHBOARD_DEFAULT_NAME}`,
            permanent: false,
         },
         {
            source: '/dashboard',
            destination: `/dashboard/${process.env.DASHBOARD_DEFAULT_LINE}/${process.env.DASHBOARD_DEFAULT_NAME}`,
            permanent: false,
         },
         {
            source: '/dashboard/:line',
            destination: `/dashboard/:line/${process.env.DASHBOARD_DEFAULT_NAME}`,
            permanent: false,
         }
      ];
   }
}

module.exports = nextConfig
// module.exports = {}
