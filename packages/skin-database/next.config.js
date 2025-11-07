/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["knex", "imagemin-optipng", "discord.js"],
  experimental: {
    viewTransition: true,
  },
};

module.exports = nextConfig;
