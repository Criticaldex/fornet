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
            destination: `/dashboard`,
            permanent: false,
         }
      ];
   }
}

module.exports = nextConfig
// module.exports = {}
