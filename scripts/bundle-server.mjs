import { build } from "esbuild";
import { resolve } from "path";
import { existsSync, mkdirSync } from "fs";

const outdir = resolve(import.meta.dirname, "..", "dist-server");
if (!existsSync(outdir)) mkdirSync(outdir, { recursive: true });

const result = await build({
  entryPoints: [resolve(import.meta.dirname, "..", "server/index.ts")],
  outfile: resolve(outdir, "server.cjs"),
  bundle: true,
  platform: "node",
  target: "node22",
  format: "cjs",
  external: ["node-pty"],
  resolveExtensions: [".ts", ".js", ".mjs", ".cjs", ".json"],
  mainFields: ["module", "main"],
  sourcemap: false,
});

for (const w of result.warnings) console.warn("⚠", w.text.replace(/\n.*/g, ""));
if (result.errors.length) {
  for (const e of result.errors) console.error("✖", e.text);
  process.exit(1);
} else {
  console.log("✓ bundled to dist-server/server.cjs");
}
