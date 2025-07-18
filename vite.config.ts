import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://89.169.183.192:8080/user-service/api/v1',
      '/market-data-service': {
        target: 'http://wolf-street.ru',
        changeOrigin: true,
        ws: true,
        secure: false,
      },
    },
  },
  define: {
    global: 'window',
  },
});
