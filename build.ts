import path from "path";
import { build, ssrBuild, createServer, BuildConfig } from "vite";
import { renderToString } from "@vue/server-renderer";
import Koa from "koa";
import koaMount from "koa-mount";
import koaStatic from "koa-static";
import fs from "fs-extra";

const appDist = path.join(process.cwd(), "dist");
const serverDist = path.join(appDist, "server");
const clientDist = path.join(appDist, "client");
const viteOutput = path.join(serverDist, "_assets");
const entryFile = path.join(process.cwd(), "index.ts");

/**
 * Common vite options for all builds
 */
const commonOptions = (): Partial<BuildConfig & { force: boolean }> => {
  const mode = process.env.NODE_ENV;
  return {
    force: true,
    emitManifest: true,
    mode,
    optimizeDeps: {
      include: [],
      exclude: [],
    },
  };
};
/**
 * Run Vite development server
 */
export const developApp = async (): Promise<void> => {
  const server = createServer({
    ...commonOptions(),
  });
  const port = process.env.PORT || 3000;

  await server.listen(port);

  console.log(`development server @ http://localhost:${port}`);
};
/**
 * Serves a built app from [cwd]/dist
 */
export const serveBuild = async (): Promise<void> => {
  const assets = new Koa();
  assets.use(koaStatic(path.join(clientDist, "_assets")));
  const app = new Koa();

  app.use(koaMount("/_assets", assets));

  app.use(async (cxt) => {
    const { factorApp } = require(viteOutput);
    const context = { url: cxt.url };

    const fa = await factorApp(context);
    const content = await renderToString(fa, context);

    const basicHtml = fs.readFileSync(
      path.join(clientDist, "index.html"),
      "utf-8"
    );
    const indexOutput = basicHtml.replace(
      '<div id="app"></div>',
      `<div id="app" data-server-rendered="true">${content}</div>`
    );

    cxt.body = indexOutput;
  });

  app.listen(3000, () => {
    console.log(`LISTENING http://localhost:3000`);
  });
};
/**
 * Builds the production application for server and client
 */
export const buildApp = async (): Promise<void> => {
  await build({
    ...commonOptions(),
    outDir: clientDist,
  });

  await ssrBuild({
    ...commonOptions(),
    outDir: serverDist,
    rollupInputOptions: {
      input: { index: entryFile },
      preserveEntrySignatures: "allow-extension",
    },
  });

  console.log(`application built`);
};

const run = async (): Promise<void> => {
  await buildApp();
  await serveBuild();
};

run();
