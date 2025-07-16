import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/auth': 'http://158.160.190.168:8080/user-service/api/v1',
      '/auth': 'http://89.169.183.192:8080/user-service/api/v1',
    },
  },
});
