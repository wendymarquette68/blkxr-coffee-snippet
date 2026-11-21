/* BLKXR coffee snippet. Creator SDK 4.0.29 / Unity 6000.3.21f1. */
(() => {
  'use strict';
  const key = '__BLKXR_COFFEE_V1__';
  if (window[key]) return;
  const scriptUrl = document.currentScript && document.currentScript.src;
  if (!scriptUrl) throw new Error('Load the coffee snippet through its hosted script URL.');
  const base = new URL('.', scriptUrl);
  const selector = 'bs-snippet[name="blkxr-coffee-maker"]';
  const instances = new Map();
  let scene;
  async function addLoaded(root, component) {
    let timer, onLoaded;
    const loaded = new Promise((resolve, reject) => {
      onLoaded = () => resolve();
      component.On('loaded', onLoaded);
      timer = setTimeout(() => reject(new Error('Coffee component load timed out.')), 60000);
    });
    try {
      // AddComponent only links to Unity; wait for native loading as well.
      await Promise.all([root.AddComponent(component), loaded]);
    } finally {
      clearTimeout(timer);
      component.Off('loaded', onLoaded);
    }
  }
  function vector(value, fallback, scale = false) {
    if (!value) return new BS.Vector3(...fallback);
    let numbers = value.trim().split(/\s+/).map(Number);
    if (scale && numbers.length === 1) numbers = [numbers[0], numbers[0], numbers[0]];
    if (numbers.length !== 3 || !numbers.every(Number.isFinite) ||
        (scale && !numbers.every(n => n > 0 && n <= 100))) {
      throw new Error('Invalid coffee snippet transform: ' + value);
    }
    return new BS.Vector3(...numbers);
  }
  function assetUrl(el, attribute, relative) {
    const url = new URL(el.getAttribute(attribute) || relative, base);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Coffee assets require a web URL.');
    return url.href;
  }
  async function wireCup(root, state) {
    let cup, button, grip;
    for (let attempt = 0; attempt < 40 && !state.cancelled; attempt++) {
      root.Traverse(obj => {
        if (obj.name === 'PickupCup') cup = obj;
        if (obj.name === 'BrewButton') button = obj;
        if (obj.name === 'Cup handle grip') grip = obj;
      });
      if (cup && button && grip) break;
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    if (state.cancelled) return;
    if (!cup || !button || !grip) throw new Error('Coffee cup controls did not register.');
    let held = false, position, rotation, enabled;
    let writes = Promise.resolve();
    function update() {
      if (state.cancelled) return;
      const near = position && Math.hypot(position.x + .078867, position.y + .1253, position.z - .05258) < .022;
      const upright = rotation && Math.abs((rotation.x + rotation.w) * Math.SQRT1_2) > .985;
      const next = !!(near && upright && !held);
      if (next === enabled) return;
      enabled = next;
      // Serialize rapid grab/drop/reset changes; never re-enable from stale pose alone.
      writes = writes.then(() => state.cancelled ? undefined : button.SetActive(next))
        .catch(error => console.error('[BLKXR coffee cup]', error));
    }
    const grab = () => { held = true; update(); };
    const drop = () => { held = false; update(); };
    for (const obj of [cup, grip]) { obj.On('grab', grab); obj.On('drop', drop); }
    state.cleanup = () => {
      for (const obj of [cup, grip]) { obj.Off('grab', grab); obj.Off('drop', drop); }
    };
    update();
    await cup.WatchTransform([BS.PN.localPosition, BS.PN.localRotation], transform => {
      if (transform.localPosition) position = transform.localPosition;
      if (transform.localRotation) rotation = transform.localRotation;
      update();
    });
  }
  async function add(el) {
    if (instances.has(el)) return;
    const state = { root: null, cancelled: false };
    instances.set(el, state);
    el.dataset.coffeeStatus = 'loading';
    try {
      const edition = el.getAttribute('edition') || 'black-gold';
      if (!['black-gold', 'selectable'].includes(edition)) throw new Error('Unknown coffee edition: ' + edition);
      const pose = {
        localPosition: vector(el.getAttribute('position'), [0, 0, 0]),
        localEulerAngles: vector(el.getAttribute('rotation'), [0, 0, 0]),
        localScale: vector(el.getAttribute('scale'), [1, 1, 1], true)
      };
      await scene.WaitForUnityLoaded();
      if (state.cancelled) return;
      const root = state.root = new BS.GameObject('BLKXR Coffee ' + (el.getAttribute('instance') || edition));
      root.meta.el = el;
      await root.Async();
      if (state.cancelled) return;
      await root.SetTransform(pose);
      await addLoaded(root, new BS.AssetBundle({
        windowsUrl: assetUrl(el, 'windows-url', 'windows/blkxr-coffee-maker.bundle'),
        androidUrl: assetUrl(el, 'android-url', 'android/blkxr-coffee-maker.bundle'),
        osxUrl: '', linuxUrl: '', iosUrl: '', vosUrl: '',
        isScene: false, legacyShaderFix: false
      }));
      if (state.cancelled) return;
      await addLoaded(root, new BS.KitItem({
        path: edition === 'selectable' ? 'blkxr-selectable.prefab' : 'blkxr-black-gold.prefab',
        resetTransform: false
      }));
      if (!state.cancelled) {
        const bounds = await root.GetBounds(false);
        if (!bounds || !bounds.size || !(bounds.size.y > 0)) {
          throw new Error('Coffee bundle finished loading but its prefab is missing.');
        }
        await wireCup(root, state);
        if (state.cancelled) return;
        el.gameObject = root;
        el.dataset.coffeeStatus = 'ready';
      }
    } catch (error) {
      if (!state.cancelled) {
        el.dataset.coffeeStatus = 'error';
        console.error('[BLKXR coffee]', error);
      }
      if (state.root) await state.root.Destroy();
      state.cleanup?.();
      state.root = null;
    } finally {
      if (state.cancelled && state.root) {
        await state.root.Destroy();
        state.root = null;
      }
    }
  }
  function scan() {
    for (const el of document.querySelectorAll(selector)) void add(el);
    for (const [el, state] of instances) {
      if (el.isConnected) continue;
      state.cancelled = true;
      state.cleanup?.();
      instances.delete(el);
      if (state.root && el.dataset.coffeeStatus === 'ready') {
        void state.root.Destroy();
        state.root = null;
      }
      delete el.gameObject;
    }
  }
  window[key] = { instances };
  window.addEventListener('bs-loaded', () => {
    if (scene) return;
    scene = BS.Scene.GetInstance();
    scan();
    new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  });
})();
