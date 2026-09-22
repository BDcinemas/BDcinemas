import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Default to '/BDcinemas/' for project repo deployment, allowing VITE_BASE_PATH override
  let basePath = env.VITE_BASE_PATH || process.env.VITE_BASE_PATH || '/BDcinemas/';
  if (basePath === '/' && !process.env.VITE_BASE_PATH_OVERRIDE_ROOT) {
    basePath = '/BDcinemas/';
  }

  return {
    plugins: [react()],
    base: basePath,
    server: {
      host: '0.0.0.0',
      port: 3000,
    },
    preview: {
      host: '0.0.0.0',
      port: 3000,
    }
  };
});
