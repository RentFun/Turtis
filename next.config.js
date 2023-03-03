/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['rentfun.infura-ipfs.io'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};
