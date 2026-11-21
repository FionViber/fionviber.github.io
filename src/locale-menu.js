// Delegated events keep the menu usable when the surrounding language changes.
export function initLocaleMenu(root, select) {
  const trigger = () => root.querySelector("#language");
  const menu = () => root.querySelector("#language-menu");
  const items = () => [...menu().querySelectorAll("[data-locale]")];
  let prefix = "";
  let prefixAt = 0;

  function close(restore = false) {
    menu().hidden = true;
    trigger().setAttribute("aria-expanded", "false");
    prefix = "";
    if (restore) trigger().focus({ preventScroll: true });
  }
  function open(position = "selected") {
    menu().hidden = false;
    trigger().setAttribute("aria-expanded", "true");
    const all = items();
    const active = position === "first" ? all[0] : position === "last" ? all.at(-1) :
      menu().querySelector('[aria-checked="true"]');
    active.focus({ preventScroll: true });
  }

  root.addEventListener("click", event => {
    if (event.target.closest("#language")) {
      if (menu().hidden) open(); else close(true);
      return;
    }
    const choice = event.target.closest("#language-menu [data-locale]");
    if (choice) {
      close(true);
      select(choice.dataset.locale);
    }
  });
  document.addEventListener("pointerdown", event => {
    if (!menu().hidden && !event.target.closest(".language-control")) close();
  });
  root.addEventListener("focusout", event => {
    if (!menu().hidden && event.target.closest(".language-control") &&
        !event.relatedTarget?.closest(".language-control")) close();
  });
  root.addEventListener("keydown", event => {
    if (!event.target.closest(".language-control")) return;
    if (event.target === trigger() && ["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      open(event.key === "ArrowDown" ? "first" : "last");
      return;
    }
    if (menu().hidden) return;
    const all = items();
    const index = all.indexOf(document.activeElement);
    switch (event.key) {
      case "Escape":
        event.preventDefault(); close(true); return;
      case "Tab":
        close(true); return;
      case "ArrowDown":
      case "ArrowUp":
      case "Home":
      case "End": {
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? all.length - 1 :
          (index + (event.key === "ArrowDown" ? 1 : -1) + all.length) % all.length;
        all[next].focus(); return;
      }
    }
    if (event.key.length !== 1 || event.key === " " || event.ctrlKey || event.metaKey || event.altKey) return;
    const now = performance.now();
    prefix = (now - prefixAt < 600 ? prefix : "") + event.key.toLocaleLowerCase();
    prefixAt = now;
    const match = all.find(item => item.textContent.trim().toLocaleLowerCase().startsWith(prefix));
    if (match) { event.preventDefault(); match.focus(); }
  });
}
