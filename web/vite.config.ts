import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/DamiDuarte/" : "/",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
}));
