import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  // Determine base path based on deployment platform
  let basePath = "/";
  if (process.env.NODE_ENV === "production") {
    // Vercel: explicitly use root path
    if (process.env.VERCEL || process.env.VERCEL_ENV) {
      basePath = "/";
    }
    // GitHub Pages: use repository name as base path
    else if (process.env.GITHUB_PAGES || process.env.CI) {
      basePath = "/voca-aid/";
    }
  }

  return {
    base: basePath,
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
