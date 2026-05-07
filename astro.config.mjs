import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://alisonpark3.github.io",
  server: {
    host: true,
    port: 4321
  }
});
