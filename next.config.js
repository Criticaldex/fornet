/** @type {import('next').NextConfig} */
const nextConfig = {
   experimental: {
      esmExternals: "loose",
      serverComponentsExternalPackages: ["mongoose", "bcryptjs"]
   },
   webpack(config) {
      config.module.rules.push({
         test: /\.svg$/,
         use: ["@svgr/webpack"]
      });
      return config;
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
         },
         {
            source: '/mqtt',
            destination: `/mqtt/${process.env.MQTT_DEFAULT}`,
            permanent: false,
         }
      ];
   }
}

module.exports = nextConfig
// module.exports = {}
