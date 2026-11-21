import test from "node:test";
import assert from "node:assert/strict";

async function setup(name, reduce = false) {
  const animations = [];
  let onChange;
  const preference = {
    matches: reduce,
    addEventListener(event, callback) { onChange = callback; },
  };
  globalThis.matchMedia = () => preference;
  const { revealPage } = await import(`../src/motion.js?${name}`);
  const main = {
    animate(frames, options) {
      const animation = { frames, options, cancelled: false, cancel() { this.cancelled = true; } };
      animations.push(animation);
      return animation;
    },
  };
  return { main, revealPage, animations, reduce() { preference.matches = true; onChange(); } };
}

test("only incoming content fades and the layout never interpolates", async () => {
  const { main, revealPage, animations } = await setup("main");
  revealPage(main);
  assert.equal(animations.length, 1);
  assert(animations[0].frames.every(frame => Object.keys(frame).every(key => key === "opacity")));
  assert(animations[0].frames[0].opacity > 0);
  assert.equal(animations[0].frames.at(-1).opacity, 1);
});
test("a second navigation immediately replaces the earlier entrance", async () => {
  const { main, revealPage, animations } = await setup("rapid");
  revealPage(main);
  revealPage(main);
  assert(animations[0].cancelled);
  assert(!animations[1].cancelled);
});
test("reduced motion applies on initial render and during playback", async () => {
  const initial = await setup("reduced", true);
  initial.revealPage(initial.main);
  assert.equal(initial.animations.length, 0);
  const live = await setup("change");
  live.revealPage(live.main);
  live.reduce();
  assert(live.animations[0].cancelled);
  live.revealPage(live.main);
  assert.equal(live.animations.length, 1);
});
test("navigation still works without the Web Animations API", async () => {
  const { revealPage } = await setup("unsupported");
  assert.doesNotThrow(() => revealPage({}));
});
