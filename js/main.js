import { createSphereVertices, createGrid } from './geometry.js';
 
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
 
if (!gl) {
  alert('WebGL2 non disponibile su questo browser. Prova con Chrome aggiornato.');
  throw new Error('WebGL2 non supportato');
}
 
const ATTRIB_POSITION = 0;
const ATTRIB_NORMAL = 1;
const ATTRIB_TEXCOORD = 2;
 
async function loadShaderSource(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Impossibile caricare ${url} (${res.status})`);
  return res.text();
}
 
function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Errore compilazione shader: ${info}`);
  }
  return shader;
}
 
function createProgram(vertSource, fragSource) {
  const vertShader = compileShader(gl.VERTEX_SHADER, vertSource);
  const fragShader = compileShader(gl.FRAGMENT_SHADER, fragSource);
 
  const program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
 
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    throw new Error(`Errore link programma: ${info}`);
  }
  return program;
}

function createVAO(mesh) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
 
  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.position, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(ATTRIB_POSITION);
  gl.vertexAttribPointer(ATTRIB_POSITION, 3, gl.FLOAT, false, 0, 0);
 
  const normBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.normal, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(ATTRIB_NORMAL);
  gl.vertexAttribPointer(ATTRIB_NORMAL, 3, gl.FLOAT, false, 0, 0);
 
  const idxBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
 
  gl.bindVertexArray(null);
  return vao;
}
 

function createFloorVAO(mesh) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
 
  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.position, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(ATTRIB_POSITION);
  gl.vertexAttribPointer(ATTRIB_POSITION, 3, gl.FLOAT, false, 0, 0);
 
  const texBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.texcoord, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(ATTRIB_TEXCOORD);
  gl.vertexAttribPointer(ATTRIB_TEXCOORD, 2, gl.FLOAT, false, 0, 0);
 
  const idxBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
 
  gl.bindVertexArray(null);
  return vao;
}
 

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    const texture = gl.createTexture();
    const image = new Image();
 
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.bindTexture(gl.TEXTURE_2D, null);
      resolve(texture);
    };
    image.onerror = () => reject(new Error(`Impossibile caricare la texture ${url}`));
    image.src = url;
  });
}


async function loadObjMesh(url) {
  window.positions = [];
  window.normals = [];
  window.texcoords = [];
  await LoadMesh(gl, { sourceMesh: url, noUnitize: true});

  const vertexCount = positions.length / 3;
  const IndexArray = vertexCount > 65535 ? Uint32Array : Uint16Array;

  const mesh = {
    position: new Float32Array(positions),
    normal: new Float32Array(normals),
    texcoord: new Float32Array(texcoords),
    indices: IndexArray.from({ length: vertexCount }, (_, i) => i),
  };

  logBounds(url, mesh.position);

  return {
    vao: createVAO(mesh),
    count: mesh.indices.length,
    indexType: IndexArray === Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
  };
}

function logBounds(name, pos) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], pos[i + k]);
      max[k] = Math.max(max[k], pos[i + k]);
    }
  }
  console.log(`${name}: ${pos.length / 3} vertici`,
    'min', min.map(v => v.toFixed(2)), 'max', max.map(v => v.toFixed(2)));
}
 
function degToRad(d) { return d * Math.PI / 180; }
 
let THETA = degToRad(45);
let PHI = degToRad(45);      
let D = 20;                   
 
const MIN_PHI = degToRad(10);
const MAX_PHI = degToRad(80);
const MIN_D = 5;
const MAX_D = 60;
 
const cameraTarget = [0, 0, 0];
const cameraUp = [0, 1, 0];
 
let dragging = false;
let lastX = 0, lastY = 0;
 
canvas.addEventListener('mousedown', (e) => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
});
window.addEventListener('mouseup', () => { dragging = false; });
window.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
 
  THETA -= dx * 0.005;
  PHI -= dy * 0.005;
  PHI = Math.min(MAX_PHI, Math.max(MIN_PHI, PHI));
});
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  D += e.deltaY * 0.01;
  D = Math.min(MAX_D, Math.max(MIN_D, D));
}, { passive: false });
 
function getCameraPosition() {
  return [
    D * Math.sin(PHI) * Math.cos(THETA),
    D * Math.cos(PHI),
    D * Math.sin(PHI) * Math.sin(THETA)
  ];
}

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

//FISICA DEL SOTTOMARINO
let px, pz;         // posizione
let vx, vz;         // velocita' attuale (unita' per passo)
let mozzoElica;     // angolo dell'elica (gradi)

let accMax, attrito, raggioElica;
const BOUND = 20;   // limite dell'area di movimento

function SubInit() {
  px = pz = 0;
  vx = vz = 0;
  mozzoElica = 0;

  accMax = 0.0011;  

  // attrito: percentuale di velocita' che viene mantenuta a ogni passo
  // 1 = no attrito
  // <<1 = attrito grande
  attrito = 0.995;  

  // Nota: vel max = accMax*attrito / (1-attrito)  (~0.12 unita'/passo = ~7 unita'/s)

  raggioElica = 0.5; // "raggio" usato nella formula del mozzo: piu' piccolo = elica piu' veloce
}

// SubDoStep: (a delta-t costante)

function SubDoStep() {
  let forwardInput = 0, rightInput = 0;
  if (keys['w']) forwardInput += 1;
  if (keys['s']) forwardInput -= 1;
  if (keys['d']) rightInput += 1;
  if (keys['a']) rightInput -= 1;

  const forward = [-Math.cos(THETA), 0, -Math.sin(THETA)];
  const right = [Math.sin(THETA), 0, -Math.cos(THETA)];

  // accelerazione
  vx += (forward[0] * forwardInput + right[0] * rightInput) * accMax;
  vz += (forward[2] * forwardInput + right[2] * rightInput) * accMax;

  // attriti (semplificando): l'acqua frena il sottomarino
  vx *= attrito;
  vz *= attrito;

  // rotazione elica: con l'attrito la velocita' cala piano pianoe quindi anche l'elica rallenta piano piano
  const v = Math.hypot(vx, vz);
  const da = (180.0 * v) / (Math.PI * raggioElica); 
  mozzoElica += da;

  // posizione = posizione + velocita * delta t (ma e' delta t costante)
  px += vx;
  pz += vz;

  // bordi dell'area: se tocca il bordo si ferma su quell'asse
  if (px > BOUND) { px = BOUND; vx = 0; }
  if (px < -BOUND) { px = -BOUND; vx = 0; }
  if (pz > BOUND) { pz = BOUND; vz = 0; }
  if (pz < -BOUND) { pz = -BOUND; vz = 0; }
}
 
function resizeCanvasToDisplaySize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.round(canvas.clientWidth * dpr);
  const height = Math.round(canvas.clientHeight * dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}
 
async function main() {
  const [vertSource, fragSource, floorVertSource, floorFragSource, sandTexture] = await Promise.all([
    loadShaderSource('shaders/basic.vert.glsl'),
    loadShaderSource('shaders/basic.frag.glsl'),
    loadShaderSource('shaders/seafloor.vert.glsl'),
    loadShaderSource('shaders/seafloor.frag.glsl'),
    loadTexture('js/resources/images/color.jpg')
  ]);
 
  const program = createProgram(vertSource, fragSource);
  const floorProgram = createProgram(floorVertSource, floorFragSource);
 
 
  const sub = await loadObjMesh('models/sottomarino_bozza.obj');
  const prop = await loadObjMesh('models/elica.obj');

  const floor = createGrid(50, 50, 10);
  const floorVAO = createFloorVAO(floor);
  const floorIndexCount = floor.indices.length;
  const floorModelMatrix = m4.translate(m4.identity(), 0, -2, 0);
 
  const floorUProjectionLoc = gl.getUniformLocation(floorProgram, 'uProjectionMatrix');
  const floorUViewLoc = gl.getUniformLocation(floorProgram, 'uViewMatrix');
  const floorUModelLoc = gl.getUniformLocation(floorProgram, 'uModelMatrix');
  const floorUTextureLoc = gl.getUniformLocation(floorProgram, 'uSandTexture');
  const floorUFogColorLoc = gl.getUniformLocation(floorProgram, 'uFogColor');
  const floorUFogDensityLoc = gl.getUniformLocation(floorProgram, 'uFogDensity');
 
  const uProjectionLoc = gl.getUniformLocation(program, 'uProjectionMatrix');
  const uViewLoc = gl.getUniformLocation(program, 'uViewMatrix');
  const uModelLoc = gl.getUniformLocation(program, 'uModelMatrix');
  const uColorLoc = gl.getUniformLocation(program, 'uColor');
 
  gl.clearColor(0.0, 0.15, 0.25, 1.0);
  gl.enable(gl.DEPTH_TEST);

  SubInit();

  // metodo basato sul tempo della fisica (come update() del prof)
  let lastTime = 0;
  let accumulator = 0;
  const deltaTimeFisica = 1/60; // 60 aggiornamenti al secondo
 
  function render(timeMs) {
    const currentTime = timeMs * 0.001;
    let frameTime = lastTime ? currentTime - lastTime : 0;
    lastTime = currentTime;
    frameTime = Math.min(frameTime, 0.25);

    accumulator += frameTime;

    // Esegui la fisica a passi fissi
    while (accumulator >= deltaTimeFisica) {
      SubDoStep();
      accumulator -= deltaTimeFisica;
    }
 
    if (resizeCanvasToDisplaySize()) {
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
    const aspect = canvas.width / canvas.height;
    const projectionMatrix = m4.perspective(degToRad(45), aspect, 0.1, 100);
 
    const cameraMatrix = m4.lookAt(getCameraPosition(), cameraTarget, cameraUp);
    const viewMatrix = m4.inverse(cameraMatrix);
 
    let modelMatrix = m4.identity();
    modelMatrix = m4.translate(modelMatrix, px, 0, pz);
 
    gl.useProgram(program);
    gl.uniformMatrix4fv(uProjectionLoc, false, projectionMatrix);
    gl.uniformMatrix4fv(uViewLoc, false, viewMatrix);
 
    // scafo
    gl.uniformMatrix4fv(uModelLoc, false, modelMatrix);
    gl.uniform3fv(uColorLoc, [0.2, 0.6, 0.9]);
    gl.bindVertexArray(sub.vao);
    gl.drawElements(gl.TRIANGLES, sub.count, sub.indexType, 0);

    // elica: matrice dello scafo + rotazione
    const propModelMatrix = m4.zRotate(modelMatrix, degToRad(mozzoElica));
    gl.uniformMatrix4fv(uModelLoc, false, propModelMatrix);
    gl.uniform3fv(uColorLoc, [0.7, 0.55, 0.3]); 
    gl.bindVertexArray(prop.vao);
    gl.drawElements(gl.TRIANGLES, prop.count, prop.indexType, 0);
    gl.bindVertexArray(null);
 
    gl.useProgram(floorProgram);
    gl.uniformMatrix4fv(floorUProjectionLoc, false, projectionMatrix);
    gl.uniformMatrix4fv(floorUViewLoc, false, viewMatrix);
    gl.uniformMatrix4fv(floorUModelLoc, false, floorModelMatrix);
 
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sandTexture);
    gl.uniform1i(floorUTextureLoc, 0);
    gl.uniform3fv(floorUFogColorLoc, [0.0, 0.15, 0.25]);
    gl.uniform1f(floorUFogDensityLoc, 0.03);
 
    gl.bindVertexArray(floorVAO);
    gl.drawElements(gl.TRIANGLES, floorIndexCount, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
 
    requestAnimationFrame(render);
  }
 
  requestAnimationFrame(render);
}
 
main().catch(err => {
  console.error(err);
  alert(`Errore di inizializzazione: ${err.message}`);
});