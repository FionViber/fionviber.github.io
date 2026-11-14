import { projects } from "@catalog";
import { languages, pageURL, resolveView } from "./model.js";
import { renderPage } from "./render.js";
import { transition } from "./motion.js";

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
  const trigger = form.querySelector(".search-submit");
  if (mobile.matches) trigger.setAttribute("aria-expanded", String(searchOpen));
  else trigger.removeAttribute("aria-expanded");
}

function render(view, draft) {
  const output = renderPage(view, projects, baseURL);
  app.innerHTML = output.html;
  document.documentElement.lang = languages[view.lang];
  document.title = output.title;
  document.body.dataset.page = view.page;
  document.body.dataset.project = view.id || "";
  searchOpen = false;
  if (draft !== undefined) app.querySelector("#query").value = draft;
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

async function navigate(
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
  const applied = await transition(() => {
    if (!restore) {
      rememberScroll();
      currentEntry = replace ? currentEntry : crypto.randomUUID();
      history[replace ? "replaceState" : "pushState"](
        { catalogEntry: currentEntry, catalogScroll: scroll },
        "",
        view.url,
      );
    } else {
      currentEntry = entry || crypto.randomUUID();
    }
    current = view;
    render(current, draft);
    scrollTo({ left: scroll[0], top: scroll[1], behavior: "instant" });
  });
  if (applied)
    app
      .querySelector(focus === "language" ? "#language" : "#main")
      ?.focus({ preventScroll: true });
}

async function toggleSearch(open) {
  const applied = await transition(() => {
    searchOpen = open;
    syncSearch();
  });
  if (applied)
    app
      .querySelector(open ? "#query" : ".search-submit")
      .focus({ preventScroll: true });
}

app.addEventListener("click", (event) => {
  if (event.target.closest(".search-close")) {
    toggleSearch(false);
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
  if (mobile.matches && !searchOpen) {
    toggleSearch(true);
    return;
  }
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
    event.target.closest("#search-form")
  ) {
    event.preventDefault();
    toggleSearch(false);
  }
});

mobile.addEventListener("change", () => {
  if (mobile.matches && document.activeElement?.id === "query")
    searchOpen = true;
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
render(current);
document.documentElement.dataset.enhanced = "true";
