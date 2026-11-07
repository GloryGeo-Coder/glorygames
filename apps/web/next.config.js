// apps/web/next.config.js

const path = require("path");

/** @type {import("next").NextConfig} */
const nextConfig = {
  async rewrites() {
    return { beforeFiles: [{ source: "/play/brick-playground-3d", destination: "/play/brick-playground-3d.html" }] };
  },

  turbopack: {
    root: path.resolve(__dirname),
  },

  webpack: (config) => {
    config.experiments = {
      ...(config.experiments || {}),
      asyncWebAssembly: true,
    };

    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    return config;
  },
};

module.exports = nextConfig;