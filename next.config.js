/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  reactStrictMode: true,
  images: {
    domains: ['rentfun.infura-ipfs.io'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};
