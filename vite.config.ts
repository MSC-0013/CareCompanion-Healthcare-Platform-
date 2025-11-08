import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";

  // ✅ Always include /api in backend base
  const backendURL =
    process.env.VITE_API_URL ||
    (isProd
      ? "https://your-backend.onrender.com/api"
      : "http://localhost:5000/api");

  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
      strictPort: true,
      proxy: {
        // ✅ Ensure /api requests are correctly proxied in dev mode
        "/api": {
          target: backendURL,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
      port: 4173,
    },

    build: {
      outDir: "dist",
      emptyOutDir: true,
    },

    plugins: [
      react(),
      ...(mode === "development" ? [componentTagger()] : []),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    assetsInclude: ["**/*.csv"],

    define: {
      "process.env": process.env,
    },
  };
});
