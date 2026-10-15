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
  // Lets a deploy build into a separate directory (NEXT_DIST_DIR=.next-build)
  // while the running servers keep serving the previous build from .next,
  // then swap them. `next start` doesn't set it, so it always serves .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    viewTransition: true,
    // The production server has little memory to spare for builds.
    webpackMemoryOptimizations: true,
  },
};

module.exports = nextConfig;
