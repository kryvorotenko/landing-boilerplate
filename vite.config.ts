import viteTsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc'
import {defineConfig} from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteTsconfigPaths()],
  build: {
    outDir: 'build',
  },
  server: {
    port: 3000,
    open: true,
  },
})
