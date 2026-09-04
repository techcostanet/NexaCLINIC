import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import pkg from './package.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: [
        'chrome >= 58',
        'samsung >= 8',
        'safari >= 11',
        'edge >= 79',
        'firefox >= 58',
        'not IE 11'
      ],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    target: ['es2018', 'chrome58', 'edge79', 'safari11']
  }
})
