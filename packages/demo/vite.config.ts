import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  build: {
    target: ["chrome74"],
    outDir: "../../output/o",
  },
  plugins: [vue()],
  resolve: {
    alias: {
      "@/": `${path.resolve(__dirname, "./src")}/`,
    },
  },
  server: {
    port: 3200,
  },
});
