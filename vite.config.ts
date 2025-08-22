import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  // Determine base path based on deployment platform
  let basePath = "/";
  if (process.env.NODE_ENV === "production") {
    // GitHub Pages needs /voca-aid/ base path
    if (process.env.GITHUB_PAGES || process.env.CI) {
      basePath = "/voca-aid/";
    }
    // Vercel and other platforms use root path
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
