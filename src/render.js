import { icon } from "./icons.js";
import { messages } from "./messages.js";
import { escapeHTML, pageURL, languageIndex, searchProjects } from "./model.js";

export function renderPage(view, projects, baseURL) {
  const P = projects,
    page = view.page,
    lang = view.lang,
    ix = languageIndex(lang),
    params = view.url.searchParams;
  const t = (key) => messages[lang][key];
  const esc = escapeHTML;
  const link = (path, query = {}) =>
    esc(pageURL(path, baseURL, lang, query).href);
  const name = (p) => p.names[ix],
    desc = (p) => p.descriptions[ix],
    cat = (p) => t(p.category === "tool" ? "tools" : "games");
  const arrow = icon("external-link");
  const cardHeading = page === "detail" ? "h3" : "h2";
  const card = (p) =>
    `<article class="project-card">${page === "search" ? `<p class="eyebrow">${cat(p)}</p>` : ""}<${cardHeading}>${esc(name(p))}</${cardHeading}><p>${esc(desc(p))}</p><div class="card-actions"><a class="card-button card-details" href="${link("projects/" + p.id + ".html")}">${t("read")}<span class="sr-only"> — ${esc(name(p))}</span></a><a class="card-button card-open" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${t("open")}<span class="sr-only"> — ${esc(name(p))}</span></a></div></article>`;
  const searchIcon = icon("search");
  const navigationIcons = { home: "home", tools: "tools", games: "device-gamepad-2", about: "info-circle" };
  const navItem = (key, path) => {
    const section = { tools: "tool", games: "game" }[key] || key;
    const current = page === section ? ' aria-current="page"' : "";
    return `<a href="${link(path)}" data-section="${section}"${current}>${icon(navigationIcons[key])}<span>${t(key)}</span></a>`;
  };
  const localeNames = { en: "English", zh: "简体中文", tw: "繁體中文" };
  const localeTags = { en: "en-GB", zh: "zh-Hans", tw: "zh-Hant" };
  const choices = Object.entries(localeNames).map(([value, name]) =>
    `<button type="button" role="menuitemradio" tabindex="-1" lang="${localeTags[value]}" aria-checked="${value === lang}" data-locale="${value}"><span>${name}</span>${value === lang ? icon("check") : ""}</button>`
  ).join("");
  const language = `<div class="language-control"><button id="language" type="button" aria-label="${t("language")} · ${localeNames[lang]}" aria-haspopup="menu" aria-controls="language-menu" aria-expanded="false">${icon("world")}<span lang="${localeTags[lang]}">${localeNames[lang]}</span>${icon("chevron-down")}</button><div id="language-menu" role="menu" aria-label="${t("language")}" hidden>${choices}</div></div>`;
  const header = `<a class="skip-link" href="#main">${t("skip")}</a><header class="masthead"><div class="wrap mast-inner"><div class="brand-group"><a class="brand" href="${link("index.html")}"><span class="brand-name">FionViber</span></a><p class="tagline">${t("tag")}</p></div><button class="search-toggle" type="button" aria-controls="search-form" aria-expanded="false" aria-label="${t("search")}" data-open-label="${t("search")}" data-close-label="${t("close")}">${searchIcon}${icon("x")}</button><form class="search-form" id="search-form" role="search" action="${link("search.html")}" method="get"><input type="hidden" name="lang" value="${lang}"><label class="sr-only" for="query">${t("searchLabel")}</label><input id="query" name="q" type="search" maxlength="120" placeholder="${t("searchLabel")}" value="${esc(params.get("q") || "")}"><button class="search-submit" type="submit" aria-label="${t("search")}">${searchIcon}</button></form>${language}</div><nav class="main-nav" aria-label="${t("navigation")}"><div class="wrap nav-inner">${navItem("home", "index.html")}${navItem("tools", "tools.html")}${navItem("games", "games.html")}${navItem("about", "about.html")}</div></nav></header>`;
  const footer = `<footer><div class="wrap footer-main"><a class="footer-brand" href="${link("index.html")}">FionViber</a><a href="https://github.com/FionViber" target="_blank" rel="noopener noreferrer">${t("github")} ${arrow}</a><span>© 2026 FionViber</span></div></footer>`;
  const sectionHeading = (key) => `<header class="page-heading section-heading"><h1>${t(key)}</h1></header>`;
  let content = "",
    title = "FionViber";
  if (page === "home") {
    content = `${sectionHeading("home")}<section class="prose"><h2>${t("intro")}</h2><p>${t("introText")}</p><p>${t("introGuide")}</p></section>`;
  } else if (page === "tool" || page === "game") {
    const key = page === "tool" ? "tools" : "games";
    title = t(key);
    content = `${sectionHeading(key)}<div class="project-grid">${P.filter(
      (p) => p.category === page,
    )
      .map(card)
      .join("")}</div>`;
  } else if (page === "detail") {
    const p = P.find((p) => p.id === view.id);
    if (p) {
      title = name(p);
      const others = P.filter(
        (a) => a.category === p.category && a.id !== p.id,
      ).slice(0, 3);
      content = `<nav class="breadcrumbs" aria-label="${t("breadcrumb")}"><a href="${link("index.html")}">${t("home")}</a><span aria-hidden="true">/</span><a href="${link(p.category === "tool" ? "tools.html" : "games.html")}">${cat(p)}</a></nav><article class="detail"><header><p class="eyebrow">${cat(p)}</p><h1>${esc(name(p))}</h1><p class="detail-lead">${esc(desc(p))}</p><div class="action-row"><a class="button" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${t("open")} ${arrow}</a><a class="text-link" href="${esc(p.repo)}" target="_blank" rel="noopener noreferrer">${t("source")} ${arrow}</a></div></header><div class="detail-layout"><div class="detail-copy"><h2>${t("start")}</h2><p>${esc(p.tips[ix])}</p><h2>${t("storageTitle")}</h2><p>${t("storage")}</p>${(p.links || []).map((item) => `<p><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.labels[ix])} ${arrow}</a></p>`).join("")}</div><dl class="facts"><div><dt>${t("category")}</dt><dd>${cat(p)}</dd></div><div><dt>${t("access")}</dt><dd>${t(p.protected ? "protected" : "public")}</dd></div><div><dt>${t("platform")}</dt><dd>${t("browser")}</dd></div></dl></div></article><section class="project-section"><h2>${t("related")}</h2><div class="project-grid related-grid">${others.map(card).join("")}</div></section>`;
    }
  } else if (page === "search") {
    title = t("results");
    const query = (params.get("q") || "").trim().slice(0, 120);
    const matches = searchProjects(P, query);
    content = `<header class="page-heading"><h1>${query ? t("results") : t("prompt")}</h1>${query ? `<p>${t("for")} “${esc(query)}” · ${matches.length} ${lang === "en" && matches.length === 1 ? "project" : t("projects")}</p><a class="text-link" href="${link("search.html")}">${t("clear")}</a>` : `<p>${t("try")}</p>`}</header>${query && matches.length ? `<div class="project-grid">${matches.map(card).join("")}</div>` : query ? `<section class="empty"><h2>${t("none")}</h2><p>${t("try")}</p><a href="${link("index.html")}">${icon("arrow-left")} ${t("back")}</a></section>` : ""}`;
  } else if (page === "about") {
    title = t("about");
    content = `${sectionHeading("about")}<article class="prose"><h2>${t("aboutTitle")}</h2><p>${t("aboutText")}</p><h2>${t("start")}</h2><p>${t("aboutUse")}</p><h2>${t("source")}</h2><p>${t("aboutSource")}</p><a class="button" href="https://github.com/FionViber" target="_blank" rel="noopener noreferrer">${t("github")} ${arrow}</a></article>`;
  }
  if (!content) {
    title = t("notFound");
    content = `<section class="empty"><h1>${title}</h1><p>${t("notFoundText")}</p><a class="button" href="${link("index.html")}">${t("back")}</a></section>`;
  }

  return {
    content,
    html:
      header +
      `<main class="wrap" id="main" tabindex="-1">${content}</main>` +
      footer,
    title: title === "FionViber" ? title : title + " · FionViber",
  };
}
