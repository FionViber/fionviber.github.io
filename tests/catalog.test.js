import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  resolveView,
  searchProjects,
  pageURL,
  escapeHTML,
} from "../src/model.js";
import { renderPage } from "../src/render.js";
const projects = JSON.parse(
  await readFile(new URL("../data/projects.json", import.meta.url)),
);
const platforms = JSON.parse(
  await readFile(new URL("../data/platforms.json", import.meta.url)),
);
const base = "https://example.test/catalog/";

test("all detail routes support physical and clean URLs", () => {
  for (const project of projects)
    for (const suffix of [".html", ""]) {
      const view = resolveView(
        new URL(`projects/${project.id}${suffix}?lang=tw`, base),
        base,
        projects,
      );
      assert.equal(view.id, project.id);
      assert.equal(view.page, "detail");
      assert.equal(view.lang, "tw");
    }
});
test("external launches stay outside the directory router", () => {
  assert.equal(
    resolveView("https://another.test/", base, projects).internal,
    false,
  );
  assert.equal(
    resolveView("https://example.test/WebMC/", base, projects).internal,
    false,
  );
});
test("unknown and malformed routes show missing pages", () => {
  for (const path of [
    "projects/no-such-project",
    "projects/%ZZ",
    "random-page",
  ])
    assert.equal(
      resolveView(new URL(path, base), base, projects).page,
      "missing",
    );
  assert.equal(
    resolveView(new URL("project.html?id=missing", base), base, projects)
      .redirect,
    null,
  );
  assert(
    resolveView(
      new URL("project.html?id=webpp", base),
      base,
      projects,
    ).redirect.href.includes("projects/webpp.html"),
  );
});
test("language selection uses explicit supported URL first", () => {
  assert.equal(
    resolveView(new URL("?lang=zh", base), base, projects, "tw").lang,
    "zh",
  );
  assert.equal(
    resolveView(new URL("?lang=invalid", base), base, projects, "tw").lang,
    "tw",
  );
  assert.equal(resolveView(base, base, projects, "invalid").lang, "en");
});
test("search is multilingual and empty queries do not list everything", () => {
  assert.deepEqual(
    searchProjects(projects, "").map((p) => p.id),
    [],
  );
  assert(searchProjects(projects, "苏丹").some((p) => p.id === "websddyx"));
  assert.deepEqual(
    searchProjects(projects, "Saltline").map((p) => p.id),
    ["websaltline"],
  );
});
test("rendering preserves one header language control and welcome-only home", () => {
  for (const language of ["en", "zh", "tw"]) {
    const view = resolveView(
        pageURL("index.html", base, language),
        base,
        projects,
      ),
      html = renderPage(view, projects, base).html;
    assert.equal((html.match(/id="language"/g) || []).length, 1);
    assert(html.indexOf('id="language"') < html.indexOf("</header>"));
    assert(!html.includes('class="project-card"'));
    assert(!html.includes("Language changes apply"));
  }
});
test("every category card has exactly two independent links for each platform", () => {
  for (const config of Object.values(platforms)) {
    const data = projects.map((p) => ({
      ...p,
      url: config.launchUrls?.[p.id] || p.url,
    }));
    for (const [path, count] of [
      ["tools.html", projects.filter(p => p.category === "tool").length],
      ["games.html", projects.filter(p => p.category === "game").length],
    ]) {
      const html = renderPage(
        resolveView(new URL(path, config.baseUrl), config.baseUrl, data),
        data,
        config.baseUrl,
      ).html;
      assert.equal(
        (html.match(/class="card-button card-details"/g) || []).length,
        count,
      );
      assert.equal(
        (html.match(/class="card-button card-open"/g) || []).length,
        count,
      );
      for (const p of data.filter(
        (p) => p.category === (path === "tools.html" ? "tool" : "game"),
      ))
        assert(html.includes(escapeHTML(p.url)));
    }
  }
});
test("search markup escapes injected text", () => {
  const view = resolveView(
    pageURL("search.html", base, "en", { q: '"><img src=x onerror=alert(1)>' }),
    base,
    projects,
  );
  const html = renderPage(view, projects, base).html;
  assert(!html.includes("<img src=x"));
  assert(html.includes("&lt;img"));
});

test("old category detail bookmarks reach the renamed projects", () => {
  const old = new URL("projects/xiaohammer-converter.html?lang=tw#main", base);
  const redirect = resolveView(old, base, projects).redirect;
  assert.equal(redirect.href, new URL("projects/chinese-converter.html?lang=tw#main", base).href);
  assert.equal(resolveView(redirect, base, projects).page, "detail");
  const legacyId = new URL("project.html?id=xiaohammer-qrcode&lang=zh", base);
  assert.equal(resolveView(legacyId, base, projects).redirect.pathname, "/catalog/projects/qr-code.html");
});

test("navigation and the language menu share accessible labels and local icons", () => {
  const page = renderPage(resolveView(new URL("index.html", base), base, projects), projects, base).html;
  for (const name of ["world", "search", "home", "tools", "device-gamepad-2", "info-circle"]) {
    assert(page.includes(`class="icon icon-${name}"`));
  }
  assert.match(page, /role="menu"/);
  assert.equal((page.match(/role="menuitemradio"/g) || []).length, 3);
  assert.equal((page.match(/aria-checked="true"/g) || []).length, 1);
});
