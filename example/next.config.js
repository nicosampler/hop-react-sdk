/**
 * @type {import('next').NextConfig}
 */


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { webpack }) => {
    config.plugins.push(new webpack.IgnorePlugin({
        resourceRegExp: /^electron$/
    }),);
    return config
}
}

module.exports = nextConfig



