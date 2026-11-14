// One motion boundary for navigation, language and local UI changes.
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let sequence = 0;
let activeTransition;

export async function transition(update) {
  const request = ++sequence;
  activeTransition?.skipTransition();
  let applied = false;
  const apply = () => {
    if (request !== sequence) return;
    update();
    applied = true;
  };
  if (!reducedMotion.matches && document.startViewTransition) {
    activeTransition = document.startViewTransition(apply);
    const current = activeTransition;
    current.finished
      .catch(() => {})
      .finally(() => {
        if (activeTransition === current) activeTransition = undefined;
      });
    await current.updateCallbackDone;
    await current.ready.catch(() => {});
  } else {
    apply();
    if (!reducedMotion.matches) {
      document.querySelector("#main")?.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 220, easing: "cubic-bezier(.2,.7,.2,1)" },
      );
    }
  }
  return applied && request === sequence;
}
