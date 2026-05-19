// apps/web/next.config.js

const path = require("path");

/** @type {import("next").NextConfig} */
const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },

  // GloryGames uses server routes, Prisma, auth, leaderboards, sitemap, etc.
  // Do not add output: "export".
};

module.exports = nextConfig;