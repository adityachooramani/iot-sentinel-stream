import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Avoid static ESM import to prevent require() loading issues in build
const componentTaggerPlugin = async () => {
  const mod = await import("lovable-tagger");
  return mod.componentTagger();
};

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [
    react(),
    ...(mode === 'development' ? [await componentTaggerPlugin()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
