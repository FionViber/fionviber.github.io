const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let entrance;

export function revealPage(main) {
  entrance?.cancel();
  entrance = undefined;
  if (reducedMotion.matches || !main.animate) return;
  entrance = main.animate(
    [{ opacity: 0.65 }, { opacity: 1 }],
    { duration: 150, easing: "ease-out" },
  );
}

reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) entrance?.cancel();
});
