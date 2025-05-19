import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      nodePolyfills({
        globals: {
          Buffer: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      assetsInlineLimit: 0, // Disable inlining of smaller assets as data URLs
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.woff': 'file',
          '.woff2': 'file',
          '.ttf': 'file',
          '.eot': 'file',
        },
      },
    },
    define: {
      'import.meta.env.VITE_BYPASS_DAILY_LIMIT': JSON.stringify(env.VITE_BYPASS_DAILY_LIMIT),
    },
  };
});
