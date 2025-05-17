/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Image optimization settings
  images: {
    domains: [
      "images.unsplash.com",
      "source.unsplash.com",
      "s-light.tiket.photos",
      "www.ancol.com",
      "seaworld.com",
      "www.arestravel.com",
      "travel-journal-api-bootcamp.do.dibimbing.id",
      "res.cloudinary.com", // Add if you use Cloudinary
      "res.klook.com",
      "i.natgeofe.com",
      "asset.kompas.com",
      "akcdn.detik.net.id",
      "awsimages.detik.net.id",
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Add compression
  compress: true,

  // Add webpack optimization
  webpack: (config, { dev, isServer }) => {
    // Only optimize in production build
    if (!dev && !isServer) {
      // Enable tree-shaking and minification
      config.optimization.minimize = true;

      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: "all",
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: "framework",
            chunks: "all",
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];

              return `npm.${packageName.replace("@", "")}`;
            },
            priority: 20,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: "commons",
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
          styles: {
            name: "styles",
            test: /\.(css|scss)$/,
            chunks: "all",
            minChunks: 1,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  // Add HTTP/2 Server Push
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizeServerReact: true, // Optimize server-side rendering
    scrollRestoration: true, // Restore scroll position
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN || "localhost",
  },

  // Output configuration for better static optimization
  output: "standalone",

  // Power-pack plugins
  poweredByHeader: false, // Remove X-Powered-By header

  // Add redirects or rewrites if needed
  async redirects() {
    return [
      // Example redirect
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Enable optimized international routing
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

export default nextConfig;
