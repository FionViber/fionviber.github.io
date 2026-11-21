import { projects } from "@catalog";
import { languages, pageURL, resolveView } from "./model.js";
import { renderPage } from "./render.js";
import { revealPage } from "./motion.js";

const baseURL = new URL("../", import.meta.url);
const app = document.querySelector("#app");
const mobile = matchMedia("(max-width: 620px)");
const preferenceKey = "fionviber.lang";
const preferences = {
  read() {
    try {
      return localStorage.getItem(preferenceKey) || "en";
    } catch {
      return "en";
    }
  },
  write(language) {
    try {
      localStorage.setItem(preferenceKey, language);
    } catch {}
  },
};
let current = resolveView(location.href, baseURL, projects, preferences.read());
let searchOpen = false;
const scrollPositions = new Map();
let currentEntry = history.state?.catalogEntry || crypto.randomUUID();
history.replaceState(
  { ...history.state, catalogEntry: currentEntry },
  "",
  location.href,
);

function syncSearch() {
  const form = app.querySelector("#search-form");
  form.classList.toggle("is-open", mobile.matches && searchOpen);
  const trigger = app.querySelector(".search-toggle");
  trigger.setAttribute("aria-expanded", String(searchOpen));
  trigger.setAttribute("aria-label", searchOpen ? trigger.dataset.closeLabel : trigger.dataset.openLabel);
}

function render(view, { rebuildShell = false, draft } = {}) {
  const output = renderPage(view, projects, baseURL);
  if (rebuildShell) {
    app.innerHTML = output.html;
  } else {
    app.querySelector("#main").innerHTML = output.content;
    for (const link of app.querySelectorAll(".main-nav [data-section]")) {
      if (link.dataset.section === view.page) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
  }
  document.documentElement.lang = languages[view.lang];
  document.title = output.title;
  document.body.dataset.page = view.page;
  document.body.dataset.project = view.id || "";
  app.querySelector("#query").value = draft ?? view.url.searchParams.get("q") ?? "";
  searchOpen = false;
  syncSearch();
}

function rememberScroll() {
  scrollPositions.set(currentEntry, [scrollX, scrollY]);
  history.replaceState(
    {
      ...history.state,
      catalogEntry: currentEntry,
      catalogScroll: [scrollX, scrollY],
    },
    "",
    location.href,
  );
}

function navigate(
  destination,
  {
    replace = false,
    restore,
    focus = "main",
    preserveDraft = false,
    entry,
  } = {},
) {
  let view = resolveView(destination, baseURL, projects, current.lang);
  if (view.redirect)
    view = resolveView(view.redirect, baseURL, projects, view.lang);
  if (!restore && view.url.href === location.href) return;
  const scroll = restore || [0, 0];
  const draft = preserveDraft ? app.querySelector("#query").value : undefined;
  const rebuildShell = view.lang !== current.lang;
  if (!restore) {
    rememberScroll();
    currentEntry = replace ? currentEntry : crypto.randomUUID();
    history[replace ? "replaceState" : "pushState"](
      { catalogEntry: currentEntry, catalogScroll: scroll }, "", view.url
    );
  } else {
    currentEntry = entry || crypto.randomUUID();
  }
  current = view;
  render(view, { rebuildShell, draft });
  scrollTo({ left: scroll[0], top: scroll[1], behavior: "instant" });
  const main = app.querySelector("#main");
  (focus === "language" ? app.querySelector("#language") : main).focus({ preventScroll: true });
  revealPage(main);
}

function toggleSearch(open) {
  searchOpen = open;
  syncSearch();
  app.querySelector(open ? "#query" : ".search-toggle").focus({ preventScroll: true });
}

app.addEventListener("click", (event) => {
  if (event.target.closest(".search-toggle")) {
    toggleSearch(!searchOpen);
    return;
  }
  const anchor = event.target.closest("a[href]");
  if (
    !anchor ||
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    anchor.target === "_blank" ||
    anchor.hasAttribute("download")
  )
    return;
  const url = new URL(anchor.href);
  if (
    url.hash &&
    url.pathname === location.pathname &&
    url.search === location.search
  )
    return;
  if (!resolveView(url, baseURL, projects, current.lang).internal) return;
  event.preventDefault();
  navigate(url);
});

app.addEventListener("submit", (event) => {
  if (event.target.id !== "search-form") return;
  event.preventDefault();
  navigate(
    pageURL("search.html", baseURL, current.lang, {
      q: app.querySelector("#query").value.trim(),
    }),
  );
});

app.addEventListener("change", (event) => {
  if (event.target.id !== "language") return;
  preferences.write(event.target.value);
  const url = new URL(location.href);
  url.searchParams.set("lang", event.target.value);
  navigate(url, {
    replace: true,
    restore: undefined,
    focus: "language",
    preserveDraft: true,
  });
});

app.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    searchOpen &&
    event.target.closest("#search-form, .search-toggle")
  ) {
    event.preventDefault();
    toggleSearch(false);
  }
});

mobile.addEventListener("change", () => {
  searchOpen = mobile.matches && document.activeElement?.id === "query";
  syncSearch();
});
history.scrollRestoration = "manual";
addEventListener("popstate", (event) => {
  scrollPositions.set(currentEntry, [scrollX, scrollY]);
  const entry = event.state?.catalogEntry;
  navigate(location.href, {
    entry,
    restore: scrollPositions.get(entry) || event.state?.catalogScroll || [0, 0],
  });
});
if (current.redirect) {
  history.replaceState(history.state, "", current.redirect);
  current = resolveView(current.redirect, baseURL, projects, current.lang);
}
render(current, { rebuildShell: true });
document.documentElement.dataset.enhanced = "true";
