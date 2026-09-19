import { createSphereVertices } from './geometry.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');

if (!gl) {
  alert('WebGL2 non disponibile su questo browser. Prova con Chrome aggiornato.');
  throw new Error('WebGL2 non supportato');
}

const ATTRIB_POSITION = 0;
const ATTRIB_NORMAL = 1;

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

function createSphereVAO(sphere) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sphere.position, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(ATTRIB_POSITION);
  gl.vertexAttribPointer(ATTRIB_POSITION, 3, gl.FLOAT, false, 0, 0);

  const normBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sphere.normal, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(ATTRIB_NORMAL);
  gl.vertexAttribPointer(ATTRIB_NORMAL, 3, gl.FLOAT, false, 0, 0);

  const idxBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

  gl.bindVertexArray(null);
  return vao;
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
  const [vertSource, fragSource] = await Promise.all([
    loadShaderSource('shaders/basic.vert.glsl'),
    loadShaderSource('shaders/basic.frag.glsl')
  ]);

  const program = createProgram(vertSource, fragSource);

  const sphere = createSphereVertices();
  const vao = createSphereVAO(sphere);
  const indexCount = sphere.indices.length;

  const uProjectionLoc = gl.getUniformLocation(program, 'uProjectionMatrix');
  const uViewLoc = gl.getUniformLocation(program, 'uViewMatrix');
  const uModelLoc = gl.getUniformLocation(program, 'uModelMatrix');
  const uColorLoc = gl.getUniformLocation(program, 'uColor');

  const camera = new Camera(Camera.ORBITING_TYPE);
  camera.setPosition([0, 0, 5]);
  camera.setElevation(15); // leggermente dall'alto, non perfettamente frontale
  camera.fov = 45;   // gradi
  camera.minZ = 0.1;
  camera.maxZ = 100;
  const controls = new Controls(camera, canvas);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  function render(timeMs) {
    const timeSec = timeMs * 0.001;

    if (resizeCanvasToDisplaySize()) {
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const aspect = canvas.width / canvas.height;
    // camera.fov è in gradi (convenzione di Camera.js): lo convertiamo in
    // radianti per m4.perspective, che li vuole in radianti.
    const projectionMatrix = m4.perspective(camera.fov * Math.PI / 180, aspect, camera.minZ, camera.maxZ);

    // getViewTransform() di Camera.js restituisce già la view matrix (fa
    // l'inversione internamente) — a differenza di m4.lookAt(), qui non
    // serve invertirla di nuovo.
    const viewMatrix = camera.getViewTransform();

    let modelMatrix = m4.identity();
    modelMatrix = m4.yRotate(modelMatrix, timeSec * 0.5);

    gl.useProgram(program);
    gl.uniformMatrix4fv(uProjectionLoc, false, projectionMatrix);
    gl.uniformMatrix4fv(uViewLoc, false, viewMatrix);
    gl.uniformMatrix4fv(uModelLoc, false, modelMatrix);
    gl.uniform3fv(uColorLoc, [0.2, 0.6, 0.9]);

    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main().catch(err => {
  console.error(err);
  alert(`Errore di inizializzazione: ${err.message}`);
});