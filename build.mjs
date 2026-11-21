import {
  readFile,
  writeFile,
  mkdir,
  readdir,
  copyFile,
  rm,
} from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { resolveView, escapeHTML, renamedProjects } from "./src/model.js";
import { renderPage } from "./src/render.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const { build, transform } = createRequire(import.meta.url)("esbuild");
const catalog = JSON.parse(
  await readFile(new URL("data/projects.json", import.meta.url)),
);
const platforms = JSON.parse(
  await readFile(new URL("data/platforms.json", import.meta.url)),
);
const ids = new Set();
for (const project of catalog) {
  assert(
    /^[a-z0-9-]+$/.test(project.id) && !ids.has(project.id),
    "Invalid or duplicate project ID",
  );
  ids.add(project.id);
  for (const field of ["names", "descriptions", "tips"]) {
    assert(
      project[field]?.length === 3 &&
        project[field].every(
          (value) => typeof value === "string" && value.trim(),
        ),
      `${project.id}: incomplete ${field}`,
    );
  }
  assert(
    ["tool", "game"].includes(project.category),
    `${project.id}: invalid category`,
  );
  assert(
    new URL(project.url).protocol === "https:",
    `${project.id}: invalid launch URL`,
  );
  assert(
    platforms.cloudflare.launchUrls[project.id],
    `${project.id}: missing Cloudflare launch URL`,
  );
}
const digest = (bytes) =>
  createHash("sha256").update(bytes).digest("hex").slice(0, 12);
const routes = [
  "index.html",
  "tools.html",
  "games.html",
  "about.html",
  "search.html",
  "404.html",
  "project.html",
  ...catalog.map((p) => "projects/" + p.id + ".html"),
];

for (const [platform, config] of Object.entries(platforms)) {
  const projects = catalog.map((p) => ({
    ...p,
    url: config.launchUrls?.[p.id] || p.url,
  }));
  const directory = root + "dist/" + platform;
  await mkdir(directory + "/assets", { recursive: true });
  await mkdir(directory + "/projects", { recursive: true });
  const bundle = await build({
    entryPoints: [root + "src/app.js"],
    bundle: true,
    write: false,
    minify: true,
    format: "esm",
    target: "es2022",
    legalComments: "none",
    plugins: [
      {
        name: "catalog-data",
        setup(b) {
          b.onResolve({ filter: /^@catalog$/ }, () => ({
            path: "catalog",
            namespace: "data",
          }));
          b.onLoad({ filter: /.*/, namespace: "data" }, () => ({
            contents: "export const projects=" + JSON.stringify(projects),
            loader: "js",
          }));
        },
      },
    ],
  });
  const code = bundle.outputFiles[0].contents,
    css = (
      await transform(await readFile(root + "styles.css", "utf8"), {
        loader: "css",
        minify: true,
        target: "es2022",
      })
    ).code;
  const scriptName = "app." + digest(code) + ".js",
    styleName = "styles." + digest(css) + ".css";
  for (const file of await readdir(directory + "/assets"))
    if (/^(app|styles)\.[a-f0-9]{12}\.(js|css)$/.test(file))
      await rm(directory + "/assets/" + file);
  await writeFile(directory + "/assets/" + scriptName, code);
  await writeFile(directory + "/assets/" + styleName, css);
  await copyFile(root + "favicon.svg", directory + "/assets/favicon.svg");
  for (const path of routes) {
    const url = new URL(path, config.baseUrl),
      view = resolveView(url, config.baseUrl, projects, "en");
    const page = renderPage(view, projects, config.baseUrl);
    const prefix =
      path === "404.html"
        ? config.baseUrl
        : path.startsWith("projects/")
          ? "../"
          : "";
    const html = `<!doctype html>\n<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${escapeHTML(view.id ? projects.find((p) => p.id === view.id)?.descriptions[0] || "Project directory" : "FionViber’s collection of browser tools and games.")}"><meta name="theme-color" content="#e6f0f8"><title>${escapeHTML(page.title)}</title><link rel="icon" href="${prefix}assets/favicon.svg"><link rel="stylesheet" href="${prefix}assets/${styleName}"><script type="module" src="${prefix}assets/${scriptName}"></script></head><body data-page="${view.page}" data-project="${view.id || ""}"><div id="app">${page.html}</div><noscript><p class="wrap">Project links work without JavaScript. Enable it for search and language selection.</p></noscript></body></html>\n`;
    await writeFile(directory + "/" + path, html);
  }
  // Existing bookmarks may include a language preference or an anchor.
  const aliases = [];
  for (const [oldId, id] of Object.entries(renamedProjects)) {
    const alias = "projects/" + oldId + ".html";
    const target = "./" + id + ".html";
    const destination = projects.find(project => project.id === id);
    assert(destination, "Invalid project redirect");
    const title = escapeHTML(destination.names[0]);
    const html = `<!doctype html><html lang="en-GB"><meta charset="utf-8"><title>${title}</title><link rel="canonical" href="${target}"><script>location.replace(${JSON.stringify(target)}+location.search+location.hash)</script><meta http-equiv="refresh" content="0;url=${target}"><a href="${target}">${title}</a></html>\n`;
    await writeFile(directory + "/" + alias, html);
    aliases.push(alias);
  }
  await writeFile(directory + "/.nojekyll", "");
  await writeFile(
    directory + "/build-manifest.json",
    JSON.stringify(
      {
        platform,
        baseUrl: config.baseUrl,
        scripts: [scriptName],
        styles: [styleName],
        pages: [...routes, ...aliases],
        projects: projects.map((p) => ({ id: p.id, url: p.url })),
      },
      null,
      2,
    ),
  );
  console.log(
    `${platform}: ${routes.length} pages; JS ${code.length} B, CSS ${Buffer.byteLength(css)} B`,
  );
}
