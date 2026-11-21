import { copyFile, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL(".", import.meta.url));
const source = root + "dist/github";
const manifest = JSON.parse(
  await readFile(source + "/build-manifest.json", "utf8"),
);
await mkdir(root + "assets", { recursive: true });
await mkdir(root + "projects", { recursive: true });
for (const file of await readdir(root + "assets")) {
  if (
    /^(app|styles)\.[a-f0-9]{12}\.(js|css)$/.test(file) ||
    ["app.js", "styles.css", "projects.js"].includes(file)
  )
    await rm(root + "assets/" + file);
}
for (const file of [...manifest.pages, ".nojekyll"]) {
  await mkdir(dirname(root + file), { recursive: true });
  await copyFile(source + "/" + file, root + file);
}
for (const file of [...manifest.scripts, ...manifest.styles, "favicon.svg"])
  await copyFile(source + "/assets/" + file, root + "assets/" + file);
await rm(root + "style.css", { force: true });
console.log("Updated the generated GitHub Pages root.");
