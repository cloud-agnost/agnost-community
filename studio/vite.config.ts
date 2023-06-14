import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src/'),
			routes: `${path.resolve(__dirname, './src/routes/')}`,
			services: `${path.resolve(__dirname, './src/services/')}`,
			utils: `${path.resolve(__dirname, './src/utils/')}`,
			constants: `${path.resolve(__dirname, './src/constants/')}`,
		},
	},
	server: {
		port: 4000,
		host: true,
	},
});
