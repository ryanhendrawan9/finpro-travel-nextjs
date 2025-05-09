/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "images.unsplash.com",
      "source.unsplash.com",
      "s-light.tiket.photos",
      "www.ancol.com",
      "seaworld.com",
      "www.arestravel.com",
      "travel-journal-api-bootcamp.do.dibimbing.id",
    ],
  },
  env: {
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
};

export default nextConfig;
