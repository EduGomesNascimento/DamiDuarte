import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Caminho base do GitHub Pages (https://<usuario>.github.io/<repositorio>/).
// No GitHub Actions o nome do repositório vem de GITHUB_REPOSITORY, então o
// site continua funcionando se o repositório for renomeado.
// VITE_BASE permite forçar outro caminho (ex.: "/" para domínio próprio).
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "DamiDuarte";
const productionBase = process.env.VITE_BASE ?? `/${repositoryName}/`;

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? productionBase : "/",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
}));
