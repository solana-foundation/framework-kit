import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

const nextConfig = {
	reactStrictMode: true,
};

export default withMDX(nextConfig);
