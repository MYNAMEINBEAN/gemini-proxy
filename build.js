import { build } from "esbuild";

await build({
    entryPoints: {
        sw: "src/index.js",
    },

    entryNames: "gp.[name]",
    outdir: "dist",
    bundle: true,
    logLevel: "info",
    treeShaking: true,
    minify: true,
    format: "esm",
    sourcemap: true,
});