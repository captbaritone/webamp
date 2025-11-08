/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["knex", "imagemin-optipng", "discord.js"],
  experimental: {
    viewTransition: true,
  },
};

module.exports = nextConfig;
