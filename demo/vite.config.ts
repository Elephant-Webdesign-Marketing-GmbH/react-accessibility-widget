import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import packageJson from '../package.json';

export default defineConfig({
  define: {
    __A11Y_WIDGET_VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [react()],
  base: '/react-accessibility-widget/',
  build: {
    outDir: 'dist',
  },
});
