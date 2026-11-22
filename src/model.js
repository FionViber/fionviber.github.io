export const languages = { en: "en-GB", zh: "zh-CN", tw: "zh-TW" };
const pages = {
  "": "home",
  index: "home",
  tools: "tool",
  games: "game",
  about: "about",
  search: "search",
  404: "missing",
};

export const renamedProjects = {
  "xiaohammer-converter": "chinese-converter",
  "xiaohammer-qrcode": "qr-code",
  "webpp": "particlespace",
};

export const languageIndex = (language) => ({ en: 0, zh: 1, tw: 2 })[language];
export const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );

export function pageURL(path, base, language, query = {}) {
  const url = new URL(path, base);
  url.searchParams.set("lang", language);
  for (const [key, value] of Object.entries(query))
    if (value) url.searchParams.set(key, value);
  return url;
}

export function resolveView(input, base, projects, preferredLanguage = "en") {
  const url = new URL(input, base);
  const root = new URL(base);
  const queryLanguage = url.searchParams.get("lang");
  const lang = Object.hasOwn(languages, queryLanguage)
    ? queryLanguage
    : Object.hasOwn(languages, preferredLanguage)
      ? preferredLanguage
      : "en";
  const view = {
    url,
    lang,
    page: "missing",
    id: null,
    internal: false,
    redirect: null,
  };
  if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname))
    return view;
  let path;
  try {
    path = decodeURIComponent(url.pathname.slice(root.pathname.length))
      .replace(/\/$/, "")
      .replace(/\.html$/, "");
  } catch {
    return view;
  }
  if (Object.hasOwn(pages, path))
    return { ...view, page: pages[path], internal: true };
  const project = path.match(/^projects\/([a-z0-9-]+)$/);
  if (project && Object.hasOwn(renamedProjects, project[1])) {
    const redirect = new URL(url);
    redirect.pathname = new URL("projects/" + renamedProjects[project[1]] + ".html", root).pathname;
    return { ...view, internal: true, redirect };
  }
  if (project)
    return {
      ...view,
      page: projects.some((p) => p.id === project[1]) ? "detail" : "missing",
      id: project[1],
      internal: true,
    };
  if (path === "project") {
    const requested = url.searchParams.get("id");
    const id = Object.hasOwn(renamedProjects, requested) ? renamedProjects[requested] : requested;
    return {
      ...view,
      internal: true,
      redirect: projects.some((p) => p.id === id)
        ? pageURL(`projects/${id}.html`, root, lang)
        : null,
    };
  }
  return view;
}

export function searchProjects(projects, query) {
  const terms = query
    .trim()
    .slice(0, 120)
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  return terms.length
    ? projects.filter((project) =>
        terms.every((term) =>
          [project.id, ...project.names, ...project.descriptions]
            .join(" ")
            .toLocaleLowerCase()
            .includes(term),
        ),
      )
    : [];
}
