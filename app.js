// Photobooth Filters - minimal but functional implementation
// 20 effects, face-lock using TF face-landmarks-detection, draggable effect centers, capture + metadata

const video = document.getElementById('video');
const output = document.getElementById('output');
const overlay = document.getElementById('overlay');
const effectsListEl = document.getElementById('effectsList');
const tpl = document.getElementById('effectItemTpl');
const faceLockCheckbox = document.getElementById('faceLock');
const captureBtn = document.getElementById('captureBtn');
const downloadMetaBtn = document.getElementById('downloadMetaBtn');
const presetsEl = document.getElementById('presets');
const togglePresetsBtn = document.getElementById('togglePresets');

let ctx, w=640, h=480;
output.width = w; output.height = h; ctx = output.getContext('2d');

const off = document.createElement('canvas'); off.width = w; off.height = h; const offCtx = off.getContext('2d');

let model = null;
let face = null;
let running = true;

// Effects definitions: name, default params, apply(imageData, params, meta)
const effects = [
  {id:'stretch', name:'Stretch', params:{x:0.5,y:0.5,amount:0.5}, apply:twistStretch(true)},
  {id:'squeeze', name:'Squeeze', params:{x:0.5,y:0.5,amount:0.5}, apply:twistStretch(false)},
  {id:'twirl', name:'Twirl', params:{x:0.5,y:0.5,radius:120,angle:1.5}, apply:twirl},
  {id:'bulge', name:'Bulge', params:{x:0.5,y:0.5,radius:120,strength:0.7}, apply:bulge},
  {id:'pinch', name:'Pinch', params:{x:0.5,y:0.5,radius:100,strength:0.6}, apply:pinch},
  {id:'kaleido', name:'Kaleidoscope', params:{slices:6}, apply:kaleidoscope},
  {id:'mirror', name:'Mirror', params:{axis:'x'}, apply:mirror},
  {id:'pixelate', name:'Pixelate', params:{size:10}, apply:pixelate},
  {id:'posterize', name:'Posterize', params:{levels:6}, apply:posterize},
  {id:'grayscale', name:'Grayscale', params:{}, apply:grayscale},
  {id:'sepia', name:'Sepia', params:{}, apply:sepia},
  {id:'invert', name:'Invert', params:{}, apply:invert},
  {id:'rgbsplit', name:'RGB Split', params:{amount:
