---
title: "Three.js for SAP developers: one cube at a time"
description: "Scene, camera, renderer and render loop explained for UI5 and Fiori developers: a cube that spins, fits the screen and stops with prefers-reduced-motion."
pubDate: 2026-05-12
tags: ["Frontend"]
lang: en
translationKey: threejs-cubo
urlSlug: threejs-cube
cover:
  icon: blocks
relatedProject: cubo-pazzesco
draft: true
---

If you come from UI5, you're used to declaring things. You write an XML view, drop in a `sap.m.Table`, bind a model, and the framework decides when and how to update the DOM. Then you open Three.js and find a black `<canvas>`. No controls, no binding, no layout. If you want to see something, you draw it yourself. On every screen refresh, if it moves.

The jump isn't hard, but it changes your mental model. Below is the map I would have liked to have at the start: the Three.js basics next to concepts an SAP developer already knows, with a single cube as the only character.

## Where I'm coming from

My first encounter with Three.js came from a very local idea. I'm from Caltagirone, the city of ceramics, and I wanted a configurator for *teste di moro*, the Moorish-head ceramics: in 2D, overlaying photos of the different components. Then I discovered Three.js, and the project gained a dimension. It became [Config Reality](/en/projects/config-reality-project), built with React and Three.js.

Other pieces followed. [Config Reality Dashboard Web](/en/projects/config-reality-dashboard) (Next.js, Tailwind CSS, Supabase) and [Config Reality Process](/en/projects/config-reality-process) (Node.js, Supabase, Apple RealityKit) share the same goal: going from images to 3D models. Then [viewer-3d-lit](/en/projects/viewer-3d-lit), a 3D object viewer published on npm and written with Lit, TypeScript and Three.js, together with its [viewer-3d-lit-loader](/en/projects/viewer-3d-lit-loader).

In between, lighter experiments. [Reinventing Minecraft Soil Generator](/en/projects/reinventing-minecraft-soil-generator) started from a Henrik Kniberg video: I had to try Minecraft terrain generation hands-on. [Cubo Pazzesco](/en/projects/cubo-pazzesco), Italian for "crazy cube", is a prototype in JavaScript and Three.js. [[DA COMPLETARE: cosa fa Cubo Pazzesco e perché l'ho costruito]]

[[DA COMPLETARE: se e dove viewer o configuratori 3D sono entrati in progetti SAP/Fiori reali (contesto, senza dati riservati)]]

## A map for UI5 developers

| In UI5 and Fiori | In Three.js | What changes |
| --- | --- | --- |
| Control tree, with aggregations | Scene graph: every `Object3D` has `children` and is added with `add()` | A child's position is relative to its parent |
| The control renderer writes HTML through the `RenderManager` | `WebGLRenderer` draws pixels onto a `<canvas>` | There's no DOM to inspect, just an image |
| Re-rendering when a control is invalidated | Render loop: you redraw every frame, or only when something changes | You decide "when" |
| `onAfterRendering`: the DOM exists | The canvas is in the page: you can create the renderer | Either way, the DOM comes first |
| `onExit` and `destroy()` | `dispose()` on geometries, materials, textures and the renderer | GPU memory isn't freed on its own |
| `sap.ui.core.ResizeHandler` | `ResizeObserver`, `camera.aspect`, `updateProjectionMatrix()` | You update the camera by hand |

The analogy only goes so far. The real difference is in the third row: UI5 redraws when something changes, Three.js redraws when you tell it to.

## The pieces of a scene

The official manual, on the [Creating a scene](https://threejs.org/manual/#en/creating-a-scene) page, starts from three things: scene, camera and renderer. Then it adds objects.

### Scene and camera

The scene is the container: everything you want to see goes in with `scene.add()`. The camera decides where you're looking from. The most common one is `PerspectiveCamera`, with four parameters: the vertical field of view in degrees, the width-to-height aspect ratio, and the `near` and `far` planes. Anything closer than `near` or farther than `far` isn't drawn.

Get the aspect ratio wrong and the cube turns into a squashed box. The manual compares it to watching old movies on a widescreen TV.

### Renderer

`WebGLRenderer` takes scene and camera and produces an image on a `<canvas>`. It can create the canvas itself, but I prefer handing it one that's already in the HTML. That way the markup, and its text alternative, stay under my control.

### Mesh: geometry plus material

A `Mesh` combines a geometry, the shape (`BoxGeometry` for the cube), with a material, the look. The manual starts with `MeshBasicMaterial`, which ignores lights. I use `MeshStandardMaterial`, a physically based material: more realistic, but without lights it stays black.

### Lights

Two are enough. An `AmbientLight` illuminates every object equally. A `DirectionalLight` behaves like the sun: parallel rays, with the direction going from its position towards its target.

## The complete code

I'm using Three.js r187, the `three@0.187.0` npm package, loaded from a CDN through an import map, as in the "Import from a CDN" option of the [Installation](https://threejs.org/manual/#en/installation) page. For a real project the manual recommends npm and a build tool such as Vite. For an example you can copy and paste, the import map is handier. One rule from the manual worth keeping: every dependency from the same version and the same CDN.

```html title="index.html"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>One cube at a time</title>
    <style>
      html, body { height: 100%; margin: 0; }
      #scene { display: block; width: 100%; height: 100%; }
    </style>
    <script type="importmap">
      {
        "imports": {
          "three": "https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js",
          "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.187.0/examples/jsm/"
        }
      }
    </script>
  </head>
  <body>
    <canvas id="scene" role="img" aria-label="A teal 3D cube on a black background">
      A teal 3D cube on a black background.
    </canvas>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

```js title="main.js"
import * as THREE from 'three';

const canvas = document.querySelector('#scene');

// Renderer: draws onto the <canvas> already in the page
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

// Scene and camera: 50° field of view, aspect recomputed on resize
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.z = 3;

// Mesh = geometry (the shape) + material (the look)
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x0f766e });
const cube = new THREE.Mesh(geometry, material);
cube.rotation.set(0.4, 0.6, 0); // tilted: it looks like a cube even when still
scene.add(cube);

// Lights: without lights a MeshStandardMaterial stays black
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(2, 3, 4);
scene.add(light);

// Resize: from the canvas CSS size to drawing buffer and camera
function resize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}
new ResizeObserver(resize).observe(canvas);
resize();

// Render loop: rotation depends on elapsed time, not on frame count
let lastTime = null;
function animate(time) {
  const delta = lastTime === null ? 0 : (time - lastTime) / 1000;
  lastTime = time;
  cube.rotation.x += delta * 0.4;
  cube.rotation.y += delta * 0.7;
  renderer.render(scene, camera);
}

// prefers-reduced-motion: no rotation, a single still frame
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function applyMotionPreference() {
  if (reducedMotion.matches) {
    renderer.setAnimationLoop(null);
    lastTime = null;
    renderer.render(scene, camera);
  } else {
    renderer.setAnimationLoop(animate);
  }
}
reducedMotion.addEventListener('change', applyMotionPreference);
applyMotionPreference();
```

To try it you need both files in the same folder and a local server. Double-clicking the HTML file isn't enough: the manual warns that, for security reasons, some features don't work when the page is opened that way. Its suggestion is this:

```bash title="terminal"
$ npx serve .
```

## The render loop

`renderer.setAnimationLoop(animate)` calls `animate` on every screen refresh. Underneath it uses `requestAnimationFrame`, which pauses when you switch tabs: no battery wasted on a cube nobody is looking at. The `WebGLRenderer` documentation recommends always defining the loop with this method rather than calling `requestAnimationFrame` yourself. To stop it, pass `null`.

The rotation depends on the time elapsed between frames, not on the number of frames: on a 120 Hz screen the cube spins at the same speed as on a 60 Hz one. When the loop stops, `lastTime` goes back to `null`, so there's no jump when it restarts.

This is where the UI5 analogy breaks down completely. In UI5 you never write a loop: you change a property and the framework redraws. In Three.js, for a configurator that sits still until the user touches something, a continuous loop is waste. The manual has a page just for this, [Rendering on demand](https://threejs.org/manual/#en/rendering-on-demand): draw once at startup, then only when something changes. It's the UI5 model, rebuilt by hand.

## Resize and devicePixelRatio

The canvas gets its size from CSS. Whenever that changes, a `ResizeObserver` calls `resize()`, which does three things. It updates the drawing buffer with `setSize(width, height, false)`, updates `camera.aspect` and calls `updateProjectionMatrix()`. The `false` tells Three.js to leave the canvas style alone, because CSS decides the size. And `updateProjectionMatrix()` isn't optional: the documentation says to call it after any change to the camera's properties.

Then there's `devicePixelRatio`. On a high-density screen, one CSS pixel maps to several physical pixels. `renderer.setPixelRatio()` tells Three.js to multiply the sizes passed to `setSize` by that value. I cap it at 2. That's my choice, not a rule: the manual points out that a ratio of 3 means 9 times as many pixels to compute, and a phone GPU will notice.

> **Note.** The manual's [Responsive Design](https://threejs.org/manual/#en/responsive) page actually advises against `setPixelRatio`. It suggests computing the drawing buffer size yourself, multiplying the CSS size by `devicePixelRatio`, and passing it to `setSize(width, height, false)`. The reason: post-processing, screenshots and GPU picking need the real buffer size, and with `setPixelRatio` that isn't the size you asked for. For a cube, this is fine. For a configurator that exports images, follow the manual.

## Accessibility: motion and text alternative

An endless animation isn't neutral. Operating systems offer a setting to reduce motion, and the browser exposes it through the `prefers-reduced-motion` media query. In JavaScript I read it with `matchMedia` and listen for the `change` event: if the user flips the setting while the page is open, the cube stops or restarts without a reload. When stopped, it's `setAnimationLoop(null)` and a single rendered frame. The scene stays visible, tilted just enough to look like a cube rather than a square.

For a screen reader, on the other hand, the canvas is an image with no name. [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas) is clear: canvas content isn't exposed to assistive technologies the way semantic HTML is. I give it `role="img"` and an `aria-label`, and put fallback text between the tags, which the browser shows when JavaScript is disabled or canvas isn't supported. The description doesn't mention rotation: with reduced motion the cube is still, and a description that lies is worse than none.

I've written more about these choices in [An accessible portfolio](/en/blog/accessible-portfolio).

> **Try it.** Open the example and turn on the reduce motion setting in your operating system's accessibility settings. The cube stops without reloading the page. Turn it off and it picks up where it left off.

## What I learned

- The render loop is a choice, not an obligation. For a viewer that sits still, rendering on demand is closer to the UI5 way of thinking and uses less power.
- GPU memory has no garbage collector. The manual says so bluntly in [How to dispose of objects](https://threejs.org/manual/#en/how-to-dispose-of-objects): geometries, materials and textures have to be released with `dispose()`. It's the `destroy()` in `onExit`, except nobody reminds you when you forget it.
- The canvas is an image. Everything that matters to the person using the page, name, description, alternative controls, lives outside the canvas, in HTML.
- Starting from a cube isn't trivial. It separates scene problems from the problems of real models, which come with their own loaders and their own list of surprises.

The cube in this article is the calm sibling of [Cubo Pazzesco](/en/projects/cubo-pazzesco). The natural next step is a camera you move with the mouse: `OrbitControls` is an addon, and the `three/addons/` prefix in the import map is there precisely to import it.
