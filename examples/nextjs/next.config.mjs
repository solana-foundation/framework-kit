/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	transpilePackages: ['@solana/client', '@solana/react-hooks', '@solana/web3-compat', '@solana/kit'],
};

export default nextConfig;
