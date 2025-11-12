import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Tagger plugin disabled due to dev crash (esbuild service stopped on Windows). Safe-load wrapper below.
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  // Removed conditional componentTagger plugin to fix dev startup error.
  // If you need it again, uncomment the import and line below.
  // plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
