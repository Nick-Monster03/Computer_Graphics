const W = 300;   
const H = 166;

const KEYBOARD_LINES = [
  ['W / S', 'avanti / indietro'],
  ['A / D', 'vira a sinistra / destra'],
  ['↑ / ↓', 'sali / scendi'],
  ['Mouse', 'trascina: ruota   rotella: zoom'],
];

const TOUCH_LINES = [
  ['Frecce', 'guida il sottomarino'],
  ['Sali / Scendi', 'cambia quota'],
  ['1 dito', 'ruota la camera'],
  ['2 dita', 'zoom'],
];

export function createHud(canvas, isTouchDevice) {
  const ctx = canvas.getContext('2d');

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.scale(dpr, dpr);

  const lines = isTouchDevice ? TOUCH_LINES : KEYBOARD_LINES;

  function drawBar(y, label, text, value01) {
    const x = 10, w = W - 20, h = 7;
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#cfe8f5';
    ctx.textAlign = 'left';
    ctx.fillText(label, x, y);
    ctx.textAlign = 'right';
    ctx.fillText(text, x + w, y);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(x, y + 5, w, h);
    ctx.fillStyle = '#40a0dc';
    ctx.fillRect(x, y + 5, w * Math.min(1, Math.max(0, value01)), h);
  }

  return function drawHud(state) {
    ctx.clearRect(0, 0, W, H);

    // sfondo e bordo del pannello
    ctx.fillStyle = 'rgba(0, 20, 35, 0.62)';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

    // elenco dei comandi a disposizione dell'utente
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('COMANDI', 10, 19);

    let y = 38;
    for (const [keys, action] of lines) {
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(keys, 10, y);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#cfe8f5';
      ctx.fillText(action, 100, y);
      y += 16;
    }

    // linea di separazione
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(10, 96.5);
    ctx.lineTo(W - 10, 96.5);
    ctx.stroke();

    // indicatori
    drawBar(114, 'Velocità', state.speed.toFixed(1) + ' m/s', state.speed / state.maxSpeed);
    drawBar(142, 'Altezza dal fondo', state.height.toFixed(1) + ' m', state.height / state.maxHeight);
  };
}