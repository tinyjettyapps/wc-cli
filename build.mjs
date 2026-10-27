import { build, transform } from "esbuild";
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync("package.json", "utf8"));

const dev = process.argv.includes("--dev");

const banner = [
  "#!/usr/bin/env node",
  // Bundled CommonJS deps still call require/__dirname at runtime.
  'import { createRequire as __wcCreateRequire } from "node:module";',
  'import { fileURLToPath as __wcFileURLToPath } from "node:url";',
  'import { dirname as __wcDirname } from "node:path";',
  "const require = __wcCreateRequire(import.meta.url);",
  "const __filename = __wcFileURLToPath(import.meta.url);",
  "const __dirname = __wcDirname(__filename);",
  // Bundled deps use node:punycode etc.; their deprecation noise is not actionable here.
  "process.noDeprecation = true;",
].join("\n");

// Everything is bundled into one file so `npx wc-uri` installs nothing.
const result = await build({
  entryPoints: ["src/cli.ts"],
  bundle: true,
  write: false,
  outfile: "dist/cli.js",
  platform: "node",
  target: "node20",
  format: "esm",
  sourcemap: dev ? "inline" : false,
  legalComments: "none",
  // Optional native speedups for `ws`; it falls back to JS without them.
  external: ["bufferutil", "utf-8-validate"],
  banner: { js: banner },
  define: { __VERSION__: JSON.stringify(version) },
  logLevel: "warning",
});

// When an ESM package (e.g. @walletconnect/core) imports a CommonJS one,
// esbuild follows Node and hands over module.exports as `default`, ignoring
// `__esModule`. These packages are written for bundler interop (the web dapp
// is built with webpack), where `default` is `exports.default`, so drop
// esbuild's Node-mode flag from every interop call.
const interop = /__toESM\((require_[\w$]+\(\)), 1\)/g;
let code = result.outputFiles[0].text;
// If esbuild changes this helper's shape the rewrite would silently do nothing
// and the CLI would only break at runtime.
if (!interop.test(code)) throw new Error("build.mjs: no __toESM(..., 1) calls to rewrite; check the esbuild output");
code = code.replace(interop, "__toESM($1)");

if (!dev) {
  code = (
    await transform(code, {
      minify: true,
      format: "esm",
      target: "node20",
      legalComments: "none",
    })
  ).code;
}

mkdirSync("dist", { recursive: true });
writeFileSync("dist/cli.js", code);
chmodSync("dist/cli.js", 0o755);
