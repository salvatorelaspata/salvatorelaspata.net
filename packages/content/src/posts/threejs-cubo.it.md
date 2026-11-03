---
title: "Three.js per sviluppatori SAP: un cubo alla volta"
description: "Scena, camera, renderer e render loop spiegati a chi arriva da UI5 e Fiori: un cubo che ruota, si adatta allo schermo e si ferma con prefers-reduced-motion."
pubDate: 2026-05-12
tags: ["Frontend"]
lang: it
translationKey: threejs-cubo
urlSlug: threejs-cubo
cover:
  icon: blocks
relatedProject: cubo-pazzesco
draft: true
---

Chi arriva da UI5 è abituato a dichiarare. Scrivi una XML view, metti una `sap.m.Table`, colleghi un modello, e il framework decide quando e come aggiornare il DOM. Poi apri Three.js e trovi un `<canvas>` nero. Nessun controllo, nessun binding, nessun layout. Se vuoi vedere qualcosa, lo disegni tu. A ogni refresh dello schermo, se si muove.

Il salto non è difficile, ma cambia il modello mentale. Qui sotto c'è la mappa che mi sarebbe servita all'inizio: i concetti base di Three.js accanto a quelli che uno sviluppatore SAP conosce già, con un cubo come unico protagonista.

## Da dove arrivo

Il mio primo incontro con Three.js è nato da un'idea molto locale. Sono di Caltagirone, città della ceramica, e volevo un configuratore di teste di moro in 2D, sovrapponendo le foto dei vari componenti. Poi ho conosciuto Three.js, e il progetto ha cambiato dimensione. È diventato [Config Reality](/projects/config-reality-project), in React e Three.js.

Intorno sono arrivati altri pezzi. [Config Reality Dashboard Web](/projects/config-reality-dashboard) (Next.js, Tailwind CSS, Supabase) e [Config Reality Process](/projects/config-reality-process) (Node.js, Supabase, Apple RealityKit) hanno lo stesso obiettivo: passare dalle immagini ai modelli 3D. Poi [viewer-3d-lit](/projects/viewer-3d-lit), un viewer per oggetti 3D pubblicato su npm e scritto con Lit, TypeScript e Three.js, con il suo [viewer-3d-lit-loader](/projects/viewer-3d-lit-loader).

Nel mezzo, esperimenti più leggeri. [Reinventing Minecraft Soil Generator](/projects/reinventing-minecraft-soil-generator) nasce da un video di Henrik Kniberg: dovevo provare con mano la generazione del terreno di Minecraft. [Cubo Pazzesco](/projects/cubo-pazzesco) è un prototipo in JavaScript e Three.js. [[DA COMPLETARE: cosa fa Cubo Pazzesco e perché l'ho costruito]]

[[DA COMPLETARE: se e dove viewer o configuratori 3D sono entrati in progetti SAP/Fiori reali (contesto, senza dati riservati)]]

## La mappa per chi viene da UI5

| In UI5 e Fiori | In Three.js | Cosa cambia |
| --- | --- | --- |
| Albero dei controlli, con le aggregazioni | Scene graph: ogni `Object3D` ha dei `children` e si aggiunge con `add()` | La posizione di un figlio è relativa al padre |
| Il renderer del controllo scrive HTML con il `RenderManager` | `WebGLRenderer` disegna pixel su un `<canvas>` | Non c'è DOM da ispezionare, c'è un'immagine |
| Re-rendering quando un controllo viene invalidato | Render loop: ridisegni a ogni frame, o solo quando cambia qualcosa | Il "quando" lo decidi tu |
| `onAfterRendering`: il DOM esiste | Il canvas è nella pagina: puoi creare il renderer | In entrambi i casi, prima serve il DOM |
| `onExit` e `destroy()` | `dispose()` su geometrie, materiali, texture e renderer | La memoria della GPU non si libera da sola |
| `sap.ui.core.ResizeHandler` | `ResizeObserver`, `camera.aspect`, `updateProjectionMatrix()` | La camera va aggiornata a mano |

L'analogia regge fino a un certo punto. La differenza vera sta nella terza riga: UI5 ridisegna quando qualcosa cambia, Three.js ridisegna quando glielo chiedi.

## I pezzi di una scena

Il manuale ufficiale, nella pagina [Creating a scene](https://threejs.org/manual/#en/creating-a-scene), parte da tre elementi: scena, camera e renderer. Poi aggiunge gli oggetti.

### Scena e camera

La scena è il contenitore: tutto quello che vuoi vedere ci entra con `scene.add()`. La camera decide da dove guardi. La più usata è `PerspectiveCamera`, con quattro parametri: il campo visivo verticale in gradi, il rapporto tra larghezza e altezza, e i piani `near` e `far`. Quello che sta più vicino di `near` o più lontano di `far` non viene disegnato.

Sbagli il rapporto e il cubo diventa un parallelepipedo schiacciato. Il manuale lo paragona ai film vecchi guardati su una TV widescreen.

### Renderer

`WebGLRenderer` prende scena e camera e produce un'immagine su un `<canvas>`. Può crearlo da solo, ma preferisco passargliene uno già presente nell'HTML. Così il markup, e la sua alternativa testuale, restano sotto il mio controllo.

### Mesh: geometria più materiale

Una `Mesh` unisce una geometria, cioè la forma (`BoxGeometry` per il cubo), e un materiale, cioè l'aspetto. Il manuale parte da `MeshBasicMaterial`, che ignora le luci. Io uso `MeshStandardMaterial`, un materiale fisicamente basato: più realistico, ma senza luci resta nero.

### Luci

Ne bastano due. Una `AmbientLight` illumina tutti gli oggetti allo stesso modo. Una `DirectionalLight` si comporta come il sole: raggi paralleli, con la direzione che va dalla sua posizione verso il suo target.

## Il codice completo

Uso Three.js r187, cioè il pacchetto npm `three@0.187.0`, caricato da CDN con una import map, come nell'opzione "Import from a CDN" della pagina [Installation](https://threejs.org/manual/#en/installation). Per un progetto vero il manuale consiglia npm e un build tool come Vite. Per un esempio da copiare e incollare, la import map è più comoda. Una regola dal manuale da non ignorare: tutte le dipendenze dalla stessa versione e dalla stessa CDN.

```html title="index.html"
<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Un cubo alla volta</title>
    <style>
      html, body { height: 100%; margin: 0; }
      #scena { display: block; width: 100%; height: 100%; }
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
    <canvas id="scena" role="img" aria-label="Un cubo verde petrolio in 3D su sfondo nero">
      Un cubo verde petrolio in 3D su sfondo nero.
    </canvas>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

```js title="main.js"
import * as THREE from 'three';

const canvas = document.querySelector('#scena');

// Renderer: disegna sul <canvas> che esiste già nella pagina
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

// Scena e camera: campo visivo di 50°, aspect ricalcolato al resize
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.z = 3;

// Mesh = geometria (la forma) + materiale (l'aspetto)
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x0f766e });
const cube = new THREE.Mesh(geometry, material);
cube.rotation.set(0.4, 0.6, 0); // inclinato: anche da fermo sembra un cubo
scene.add(cube);

// Luci: senza luci un MeshStandardMaterial resta nero
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(2, 3, 4);
scene.add(light);

// Resize: dalle dimensioni CSS del canvas a drawing buffer e camera
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

// Render loop: la rotazione dipende dal tempo, non dal numero di frame
let lastTime = null;
function animate(time) {
  const delta = lastTime === null ? 0 : (time - lastTime) / 1000;
  lastTime = time;
  cube.rotation.x += delta * 0.4;
  cube.rotation.y += delta * 0.7;
  renderer.render(scene, camera);
}

// prefers-reduced-motion: niente rotazione, un solo frame fermo
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

Per provarlo servono i due file nella stessa cartella e un server locale. Aprire l'HTML con un doppio clic non basta: il manuale avverte che, per motivi di sicurezza, alcune funzioni non vanno quando la pagina è aperta così. La sua proposta è questa:

```bash title="terminale"
$ npx serve .
```

## Il render loop

`renderer.setAnimationLoop(animate)` chiama `animate` a ogni refresh dello schermo. Sotto c'è `requestAnimationFrame`, che si mette in pausa quando cambi scheda: niente batteria sprecata per un cubo che nessuno guarda. La documentazione di `WebGLRenderer` consiglia di definire sempre il loop con questo metodo, non con `requestAnimationFrame` a mano. Per fermarlo basta passare `null`.

La rotazione dipende dal tempo trascorso tra un frame e l'altro, non dal numero di frame: su uno schermo a 120 Hz il cubo gira alla stessa velocità che a 60. Quando il loop si ferma, `lastTime` torna a `null`, così alla ripartenza non ci sono scatti.

Qui il parallelo con UI5 si rompe del tutto. In UI5 non scrivi mai un loop: cambi una proprietà e il framework ridisegna. In Three.js, per un configuratore che resta fermo finché l'utente non tocca qualcosa, il loop continuo è uno spreco. Il manuale ha una pagina apposta, [Rendering on demand](https://threejs.org/manual/#en/rendering-on-demand): si disegna una volta all'avvio e poi solo quando cambia qualcosa. È il modello di UI5, rifatto a mano.

## Resize e devicePixelRatio

Il canvas prende la sua dimensione dal CSS. A ogni cambio, un `ResizeObserver` chiama `resize()`, che fa tre cose. Aggiorna il drawing buffer con `setSize(width, height, false)`, aggiorna `camera.aspect` e chiama `updateProjectionMatrix()`. Il `false` dice a Three.js di non toccare lo stile del canvas, perché le dimensioni le decide il CSS. E `updateProjectionMatrix()` non è facoltativo: la documentazione chiede di chiamarlo dopo ogni modifica alle proprietà della camera.

Poi c'è `devicePixelRatio`. Su uno schermo ad alta densità un pixel CSS corrisponde a più pixel fisici. `renderer.setPixelRatio()` dice a Three.js di moltiplicare per quel valore le dimensioni passate a `setSize`. Io lo limito a 2. È una scelta mia, non una regola: il manuale ricorda che con un rapporto 3 i pixel da calcolare sono 9 volte tanti, e una GPU da telefono se ne accorge.

> **Nota.** La pagina [Responsive Design](https://threejs.org/manual/#en/responsive) del manuale sconsiglia proprio `setPixelRatio`. Propone di calcolare tu la dimensione del drawing buffer, moltiplicando le misure CSS per `devicePixelRatio`, e di passarla a `setSize(width, height, false)`. Il motivo: post-processing, screenshot e picking sulla GPU hanno bisogno della dimensione reale del buffer, e con `setPixelRatio` non è quella che hai chiesto. Per un cubo va bene così. Per un configuratore che esporta immagini, meglio la strada del manuale.

## Accessibilità: movimento e testo alternativo

Un'animazione infinita non è neutra. I sistemi operativi hanno un'opzione per ridurre il movimento, e il browser la espone con la media query `prefers-reduced-motion`. In JavaScript la leggo con `matchMedia` e ascolto l'evento `change`: se l'utente cambia impostazione a pagina aperta, il cubo si ferma o riparte senza ricaricare. Da fermo, `setAnimationLoop(null)` e un solo frame disegnato. La scena resta visibile, inclinata quanto basta per sembrare un cubo e non un quadrato.

Per uno screen reader, invece, il canvas è un'immagine senza nome. [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas) è chiaro: il contenuto di un `<canvas>` non viene esposto alle tecnologie assistive come l'HTML semantico. Gli do `role="img"` e un `aria-label`, e metto un testo di fallback tra i tag, che il browser mostra se JavaScript è disattivato o il canvas non è supportato. La descrizione non parla di rotazione: con il movimento ridotto il cubo è fermo, e una descrizione che mente è peggio di nessuna.

Su queste scelte ho scritto di più in [Un portfolio accessibile](/blog/portfolio-accessibile).

> **Da provare.** Apri l'esempio e attiva l'opzione per ridurre il movimento nelle impostazioni di accessibilità del sistema operativo. Il cubo si ferma senza ricaricare la pagina. Disattivala e riparte da dove si era fermato.

## Cosa ho imparato

- Il render loop è una scelta, non un obbligo. Per un viewer che resta fermo, il rendering on demand è più vicino al modo di pensare di UI5 e consuma meno.
- La memoria della GPU non ha un garbage collector. Il manuale, in [How to dispose of objects](https://threejs.org/manual/#en/how-to-dispose-of-objects), lo dice senza giri di parole: geometrie, materiali e texture vanno liberati con `dispose()`. È il `destroy()` di `onExit`, solo che se te lo dimentichi nessuno te lo segnala.
- Il canvas è un'immagine. Tutto quello che conta per chi usa la pagina, nome, descrizione, comandi alternativi, sta fuori dal canvas, in HTML.
- Partire da un cubo non è banale. Separa i problemi della scena da quelli dei modelli veri, che hanno i loro loader e un'altra lista di sorprese.

Il cubo di questo articolo è il fratello tranquillo di [Cubo Pazzesco](/projects/cubo-pazzesco). Da qui, il passo successivo è una camera che si muove con il mouse: `OrbitControls` è un addon, e il prefisso `three/addons/` nella import map serve proprio a importarlo.
