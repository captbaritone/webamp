/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["knex", "imagemin-optipng", "discord.js"],
};

module.exports = nextConfig;
