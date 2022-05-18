/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	webpack(config) {
		config.output.webassemblyModuleFilename = 'static/wasm_interface.wasm';
		config.experiments = { asyncWebAssembly: true };
		return config;
	},
	future: {
		webpack5: false,
	},
};

export default nextConfig;
