import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  format: ["esm"],
  sourcemap: true,
  minify: true,
  target: "node14",
  noExternal: ["zod", "dotenv", "commander", "execa", "ora", "chalk"],
}));
