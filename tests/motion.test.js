import test from "node:test";
import assert from "node:assert/strict";

test("motion applies state immediately when reduced motion is requested", async () => {
  globalThis.matchMedia = () => ({ matches: true });
  let animated = 0,
    updated = 0;
  globalThis.document = {
    querySelector: () => ({
      animate() {
        animated++;
      },
    }),
  };
  const { transition } = await import("../src/motion.js?reduced");
  assert.equal(await transition(() => updated++), true);
  assert.equal(updated, 1);
  assert.equal(animated, 0);
});

test("unsupported native transitions still navigate and animate the content", async () => {
  globalThis.matchMedia = () => ({ matches: false });
  let animated = 0,
    updated = 0;
  globalThis.document = {
    querySelector: () => ({
      animate(frames, options) {
        animated++;
        assert.equal(options.duration, 220);
      },
    }),
  };
  const { transition } = await import("../src/motion.js?fallback");
  assert.equal(await transition(() => updated++), true);
  assert.equal(updated, 1);
  assert.equal(animated, 1);
});

test("rapid successive transitions commit only the latest requested view", async () => {
  globalThis.matchMedia = () => ({ matches: false });
  const committed = [];
  let skipped = 0;
  globalThis.document = {
    startViewTransition(update) {
      const done = Promise.resolve().then(update);
      return {
        updateCallbackDone: done,
        ready: done,
        finished: done,
        skipTransition() {
          skipped++;
        },
      };
    },
  };
  const { transition } = await import("../src/motion.js?rapid");
  const first = transition(() => committed.push("first")),
    second = transition(() => committed.push("second"));
  assert.deepEqual(await Promise.all([first, second]), [false, true]);
  assert.deepEqual(committed, ["second"]);
  assert.equal(skipped, 1);
});
