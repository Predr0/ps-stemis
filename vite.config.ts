import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite" // Importando o plugin novo
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Ativando o motor da v4
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})