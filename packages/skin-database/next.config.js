const {
  HTML_LIMITED_BOT_UA_RE,
} = require("next/dist/shared/lib/router/utils/html-bots");

// Link preview crawlers that read metadata only from <head>. Next streams
// metadata into the body for crawlers it doesn't list, so these would see a
// page without a title or preview image. htmlLimitedBots replaces Next's list
// rather than adding to it, so they're added to Next's own.
const LINK_PREVIEW_BOTS = [
  "Mastodon",
  "Pleroma",
  "Akkoma",
  "Misskey",
  "Bluesky",
  "Cardyb",
  "TelegramBot",
  "Iframely",
  "Embedly",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  htmlLimitedBots: new RegExp(
    `${HTML_LIMITED_BOT_UA_RE.source}|${LINK_PREVIEW_BOTS.join("|")}`,
    "i"
  ),
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
