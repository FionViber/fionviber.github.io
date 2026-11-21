// Tabler Icons v3.52.0 (MIT). See assets/tabler-license.txt.
const shapes = {
  "home": "<path d=\"M5 12l-2 0l9 -9l9 9l-2 0\" />\n  <path d=\"M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7\" />\n  <path d=\"M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6\" />",
  "tools": "<path d=\"M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4\" />\n  <path d=\"M14.5 5.5l4 4\" />\n  <path d=\"M12 8l-5 -5l-4 4l5 5\" />\n  <path d=\"M7 8l-1.5 1.5\" />\n  <path d=\"M16 12l5 5l-4 4l-5 -5\" />\n  <path d=\"M16 17l-1.5 1.5\" />",
  "device-gamepad-2": "<path d=\"M12 5h3.5a5 5 0 0 1 0 10h-5.5l-4.015 4.227a2.3 2.3 0 0 1 -3.923 -2.035l1.634 -8.173a5 5 0 0 1 4.904 -4.019h3.4\" />\n  <path d=\"M14 15l4.07 4.284a2.3 2.3 0 0 0 3.925 -2.023l-1.6 -8.232\" />\n  <path d=\"M8 9v2\" />\n  <path d=\"M7 10h2\" />\n  <path d=\"M14 10h2\" />",
  "info-circle": "<path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0\" />\n  <path d=\"M12 9h.01\" />\n  <path d=\"M11 12h1v4h1\" />",
  "world": "<path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0\" />\n  <path d=\"M3.6 9h16.8\" />\n  <path d=\"M3.6 15h16.8\" />\n  <path d=\"M11.5 3a17 17 0 0 0 0 18\" />\n  <path d=\"M12.5 3a17 17 0 0 1 0 18\" />",
  "search": "<path d=\"M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\" />\n  <path d=\"M21 21l-6 -6\" />",
  "chevron-down": "<path d=\"M6 9l6 6l6 -6\" />",
  "external-link": "<path d=\"M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6\" />\n  <path d=\"M11 13l9 -9\" />\n  <path d=\"M15 4h5v5\" />",
  "file-text": "<path d=\"M14 3v4a1 1 0 0 0 1 1h4\" />\n  <path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2\" />\n  <path d=\"M9 9l1 0\" />\n  <path d=\"M9 13l6 0\" />\n  <path d=\"M9 17l6 0\" />",
  "x": "<path d=\"M18 6l-12 12\" />\n  <path d=\"M6 6l12 12\" />",
  "arrow-left": "<path d=\"M5 12l14 0\" />\n  <path d=\"M5 12l6 6\" />\n  <path d=\"M5 12l6 -6\" />",
  "check": "<path d=\"M5 12l5 5l10 -10\" />"
};

export function icon(name) {
  return `<svg class="icon icon-${name}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${shapes[name]}</svg>`;
}
