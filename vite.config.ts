import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readdirSync, readFileSync } from 'fs';
import dts from 'vite-plugin-dts';
import packageJson from './package.json';

const fontsDir = resolve(__dirname, 'src/fonts');

/**
 * Library mode always inlines CSS assets as base64, which would bloat the
 * stylesheet by ~300 kB. Emit the self-hosted fonts as separate files in
 * dist/fonts and point the CSS at them, so consumers' bundlers serve them
 * from their own domain and browsers only download them when used.
 */
function emitFontFiles(): Plugin {
  return {
    name: 'a11y-emit-font-files',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const fonts = readdirSync(fontsDir)
        .filter((fileName) => fileName.endsWith('.woff2'))
        .map((fileName) => ({ fileName, source: readFileSync(resolve(fontsDir, fileName)) }));

      for (const font of fonts) {
        this.emitFile({ type: 'asset', fileName: `fonts/${font.fileName}`, source: font.source });
      }
      this.emitFile({
        type: 'asset',
        fileName: 'fonts/OpenDyslexic-LICENSE.txt',
        source: readFileSync(resolve(fontsDir, 'OpenDyslexic-LICENSE.txt')),
      });

      for (const output of Object.values(bundle)) {
        if (output.type !== 'asset' || !output.fileName.endsWith('.css')) continue;
        let css = output.source.toString();
        for (const font of fonts) {
          const dataUrl = `data:font/woff2;base64,${font.source.toString('base64')}`;
          css = css.split(dataUrl).join(`./fonts/${font.fileName}`);
        }
        if (css.includes('data:font/')) {
          this.error('Inlined font left in CSS – add it to src/fonts');
        }
        output.source = css;
      }
    },
  };
}

export default defineConfig({
  define: {
    __A11Y_WIDGET_VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src'],
    }),
    emitFontFiles(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AccessibilityWidget',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
        },
      },
    },
    cssCodeSplit: false,
  },
});
