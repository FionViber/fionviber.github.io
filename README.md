# FionViber

A multilingual directory of browser tools and games.

- [GitHub edition](https://fionviber.github.io/)
- [Cloudflare edition](https://fionviber.pages.dev/)

Both editions use the same source. Their project launch URLs are selected during the build.

## Structure

| File | Responsibility |
| --- | --- |
| `data/projects.json` | Project names, descriptions, guides and source links |
| `data/platforms.json` | Hosting addresses and Cloudflare launch URLs |
| `src/messages.js` | English, Simplified Chinese and Traditional Chinese interface text |
| `src/model.js` | Routes, language selection, search and URL construction |
| `src/render.js` | Shared page and component templates |
| `src/app.js` | Navigation, history, focus, preferences and search controls |
| `src/motion.js` | View Transition orchestration and reduced-motion fallback |
| `styles.css` | Design tokens, components, motion and responsive layout |
| `build.mjs` | Static HTML and hashed production assets for both hosts |

## Build and test

Use Node.js 22 or later:

```sh
npm install
npm test
npm run build
```

The output folders are `dist/github` and `dist/cloudflare`. Each contains complete static pages and local assets. No application server is needed.

For the existing GitHub Pages root deployment, run `npm run sync:github` after building and commit the generated files. Upload `dist/cloudflare` to the Cloudflare Pages project `fionviber`.

Edit the source files above rather than the generated HTML or minified assets. Hashed filenames prevent old browser caches from mixing releases.

When adding a project, provide all three translations in `data/projects.json` and its Cloudflare URL in `data/platforms.json`. The build rejects incomplete records instead of silently linking a Cloudflare page back to GitHub Pages.

## Navigation and motion

Internal navigation uses one route and rendering pipeline, including search, language changes and browser Back/Forward. Every route also has a physical HTML page for direct visits and refreshes. External project links keep their normal new-tab behaviour.

The motion layer uses the browser's View Transition API when available and a short Web Animations entrance otherwise. It respects `prefers-reduced-motion`, permits interaction during transitions, and cancels obsolete updates during rapid navigation. There are no animation libraries or continuous animation loops.
