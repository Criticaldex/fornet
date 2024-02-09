/** @type {import('next').NextConfig} */
const nextConfig = {
   experimental: {
      esmExternals: "loose",
      serverComponentsExternalPackages: ["mongoose", "bcryptjs"]
   },
   // async redirects() {
   //    return [
   //       {
   //          source: '/',
   //          destination: `/dashboard/${process.env.DASHBOARD_DEFAULT_LINE}/${process.env.DASHBOARD_DEFAULT_NAME}`,
   //          permanent: false,
   //       },
   //       {
   //          source: '/dashboard',
   //          destination: `/dashboard/${process.env.DASHBOARD_DEFAULT_LINE}/${process.env.DASHBOARD_DEFAULT_NAME}`,
   //          permanent: false,
   //       },
   //       {
   //          source: '/dashboard/:line',
   //          destination: `/dashboard/:line/${process.env.DASHBOARD_DEFAULT_NAME}`,
   //          permanent: false,
   //       }
   //    ];
   // },
   i18n: {
      // These are all the locales you want to support in
      // your application
      locales: ['en', 'es', 'ca'],
      // This is the default locale you want to be used when visiting
      // a non-locale prefixed path e.g. `/hello`
      defaultLocale: 'es',
   },
}

module.exports = nextConfig
// module.exports = {}
