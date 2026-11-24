import { createTube, rotationMatrix, perspective, orbitDrag, clamp } from './core-geometry.mjs';

const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const vertexSource = `
  precision mediump float;
  attribute vec3 a_position;
  attribute vec3 a_normal;
  uniform mat4 u_model;
  uniform mat4 u_projection;
  uniform float u_distance;
  uniform float u_wrap;
  varying vec3 v_normal;
  varying vec3 v_position;
  varying vec3 v_local;
  varying float v_outer;
  void main() {
    vec3 shaped = a_position;
    if (length(shaped.yz) > 0.9) shaped.yz *= (0.735 + 0.285 * u_wrap) / 1.02;
    vec4 world = u_model * vec4(shaped, 1.0);
    v_position = world.xyz;
    v_local = a_position;
    v_outer = step(0.7, length(a_position.yz)) * (1.0 - step(0.5, abs(a_normal.x)));
    v_normal = mat3(u_model) * a_normal;
    gl_Position = u_projection * vec4(world.xyz + vec3(0.0, 0.0, -u_distance), 1.0);
  }
`;
const fragmentSource = `
  precision mediump float;
  uniform vec3 u_color;
  uniform float u_inner;
  uniform float u_wrap;
  uniform sampler2D u_label;
  varying vec3 v_normal;
  varying vec3 v_position;
  varying vec3 v_local;
  varying float v_outer;
  void main() {
    vec3 n = normalize(v_normal);
    vec3 light = normalize(vec3(-0.7, 1.2, 1.5));
    vec3 view = normalize(vec3(0.0, 0.0, 7.5) - v_position);
    float diffuse = max(dot(n, light), 0.0);
    float softbox = pow(max(dot(n, normalize(light + view)), 0.0), 42.0);
    float edge = pow(1.0 - abs(dot(n, view)), 3.0);
    float interior = 1.0 - step(u_inner + 0.012, length(v_local.yz));
    float grain = sin(v_local.x * 180.0) * 0.012 * u_wrap;
    vec3 color = u_color * (0.34 + diffuse * 0.88 + grain);
    color += vec3(0.65, 0.75, 0.8) * softbox * (0.2 - u_wrap * 0.15);
    color += vec3(0.15, 0.2, 0.25) * edge * 0.22;
    color *= mix(1.0, 0.27, interior);
    vec3 surface = pow(max(color, vec3(0.0)), vec3(0.4545));
    vec2 uv = vec2((v_local.x + 1.9) / 3.8, (atan(v_local.y, v_local.z) + 0.32) / 0.64);
    float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
    float ink = texture2D(u_label, uv).r * inside * v_outer * (1.0 - step(0.001, u_wrap));
    surface = mix(surface, vec3(0.94, 0.96, 0.98) * (0.88 + diffuse * 0.12), ink);
    gl_FragColor = vec4(surface, 1.0);
  }
`;

function startScene(figure) {
  const canvas = figure.querySelector('canvas');
  const stage = figure.querySelector('.core-stage');
  const controls = figure.querySelector('.scene-controls');
  const pauseButton = figure.querySelector('[data-core-pause]');
  const viewButtons = [...figure.querySelectorAll('[data-core-view]')];
  const rotateButtons = [...figure.querySelectorAll('[data-core-rotate]')];
  const hint = figure.querySelector('.scene-help');
  const status = figure.querySelector('[data-core-status]');
  const chapters = figure.closest('.core-story')?.querySelector('.core-chapters');
  // Retain the last frame: this renderer sleeps between interactions instead of running continuously.
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power', premultipliedAlpha: false, preserveDrawingBuffer: true });
  if (!gl) {
    figure.dataset.sceneStatus = 'webgl-unavailable';
    return;
  }

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const detail = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error('Product illustration shader unavailable: ' + detail);
    }
    return shader;
  }

  const program = gl.createProgram();
  const vertex = compile(gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Product illustration unavailable: ' + gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const position = gl.getAttribLocation(program, 'a_position');
  const normal = gl.getAttribLocation(program, 'a_normal');
  const uniform = Object.fromEntries(['model', 'projection', 'distance', 'color', 'inner', 'wrap', 'label'].map(name => [name, gl.getUniformLocation(program, 'u_' + name)]));

  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 1024;
  labelCanvas.height = 128;
  const label = labelCanvas.getContext('2d');
  if (!label) throw new Error('Product label unavailable');
  label.fillStyle = '#000';
  label.fillRect(0, 0, 1024, 128);
  label.fillStyle = '#fff';
  label.font = '600 66px Arial, sans-serif';
  label.textAlign = 'center';
  label.textBaseline = 'middle';
  label.fillText('SHREE KESHAR PLASTIC', 512, 64, 940);
  const labelTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, labelTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, labelCanvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(uniform.label, 0);

  function mesh(options) {
    const data = createTube(options);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return { buffer, count: data.length / 6 };
  }
  const core = mesh({});
  const wrap = mesh({ length: 3.3, outer: 1.02, inner: .73 });
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);
  let frame = 0, lost = false, paused = false, endView = false, frozenProgress = 0;
  let currentX = 0, currentY = .62, currentZ = .45;
  let manual = null, drag = null;
  let width = 1, height = 1;

  function onScreen() {
    const bounds = figure.getBoundingClientRect();
    return bounds.bottom > -100 && bounds.top < innerHeight + 100;
  }

  function drawMesh(item, color, inner, isWrap) {
    gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(normal);
    gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, 24, 12);
    gl.uniform3fv(uniform.color, color);
    gl.uniform1f(uniform.inner, inner);
    gl.uniform1f(uniform.wrap, isWrap);
    gl.drawArrays(gl.TRIANGLES, 0, item.count);
  }

  function progress() {
    if (motionPreference.matches) return 0;
    if (paused) return frozenProgress;
    if (chapters) {
      const bounds = chapters.getBoundingClientRect();
      return clamp((innerHeight * .55 - bounds.top) / Math.max(1, bounds.height - innerHeight * .4));
    }
    return clamp(-figure.getBoundingClientRect().top / Math.max(1, innerHeight));
  }

  function render() {
    frame = 0;
    if (!onScreen() || document.hidden || lost) return;
    const p = progress();
    const stopped = motionPreference.matches || paused;
    const targetX = manual?.x ?? 0;
    const targetY = manual?.y ?? .62 + p * .68;
    const targetZ = manual?.z ?? .45 - p * .32;
    const blend = stopped || manual ? 1 : .16;
    currentX += (targetX - currentX) * blend;
    currentY += (targetY - currentY) * blend;
    currentZ += (targetZ - currentZ) * blend;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(uniform.model, false, rotationMatrix(currentY, currentZ, currentX));
    gl.uniformMatrix4fv(uniform.projection, false, perspective(width / height));
    gl.uniform1f(uniform.distance, 7.2 + Math.max(0, 1 - width / height) * 2.5);
    drawMesh(core, [.035, .05, .065], .56, 0);
    const wrapAmount = Math.min(clamp((p - .28) / .2), clamp((.88 - p) / .18));
    if (chapters && wrapAmount > 0 && !manual && !endView) drawMesh(wrap, [.54, .59, .61], .73, wrapAmount);
    figure.dataset.rendered = 'true';
    if (Math.abs(currentX - targetX) + Math.abs(currentY - targetY) + Math.abs(currentZ - targetZ) > .001) schedule();
  }

  function schedule() {
    if (!frame && !lost && !document.hidden && onScreen()) frame = requestAnimationFrame(render);
  }

  function resize() {
    width = stage.clientWidth;
    height = stage.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.75);
    const nextWidth = Math.max(1, Math.round(width * dpr));
    const nextHeight = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== nextWidth || canvas.height !== nextHeight) delete figure.dataset.rendered;
    if (canvas.width !== nextWidth) canvas.width = nextWidth;
    if (canvas.height !== nextHeight) canvas.height = nextHeight;
    schedule();
  }

  controls.hidden = false;
  hint.hidden = false;
  canvas.removeAttribute('aria-hidden');
  canvas.tabIndex = 0;
  pauseButton.hidden = motionPreference.matches;

  function announce() {
    const degrees = value => Math.round((value * 180 / Math.PI % 360 + 360) % 360);
    status.textContent = `Core view: ${degrees(manual?.y ?? currentY)} degrees around, ${degrees(manual?.x ?? currentX)} degrees tilt.`;
  }

  function takeControl() {
    manual ??= { x: currentX, y: currentY, z: currentZ };
    endView = false;
    viewButtons.forEach(button => button.setAttribute('aria-pressed', 'false'));
  }

  function rotate(direction) {
    takeControl();
    const step = Math.PI / 6;
    if (direction === 'left') manual.y -= step;
    if (direction === 'right') manual.y += step;
    if (direction === 'up') manual.x -= step;
    if (direction === 'down') manual.x += step;
    announce();
    schedule();
  }

  rotateButtons.forEach(button => button.addEventListener('click', () => rotate(button.dataset.coreRotate)));
  viewButtons.forEach(button => button.addEventListener('click', () => {
    endView = button.dataset.coreView === 'end';
    manual = endView ? { x: 0, y: Math.PI / 2, z: 0 } : { x: 0, y: .62, z: .45 };
    viewButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    announce();
    schedule();
  }));
  pauseButton.addEventListener('click', () => {
    if (!paused) frozenProgress = progress();
    paused = !paused;
    if (!paused) {
      manual = null;
      endView = false;
      viewButtons.forEach(item => item.setAttribute('aria-pressed', String(item.dataset.coreView === 'perspective')));
    }
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.textContent = paused ? 'Resume motion' : 'Pause motion';
    schedule();
  });
  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || lost) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, touch: event.pointerType === 'touch' };
    canvas.setPointerCapture(event.pointerId);
    canvas.focus({ preventScroll: true });
    canvas.dataset.dragging = 'true';
  });
  canvas.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!dx && !dy) return;
    takeControl();
    // Touch keeps vertical page scrolling; tilt buttons provide the second axis.
    manual = orbitDrag(manual, dx, drag.touch ? 0 : dy, width, height);
    drag.x = event.clientX;
    drag.y = event.clientY;
    schedule();
  }, { passive: true });
  function finishDrag(event) {
    if (!drag || drag.id !== event.pointerId) return;
    drag = null;
    delete canvas.dataset.dragging;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    announce();
  }
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(type, finishDrag);
  canvas.addEventListener('keydown', event => {
    const direction = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }[event.key];
    if (direction) { event.preventDefault(); rotate(direction); }
    else if (event.key === 'Home') { event.preventDefault(); viewButtons.find(button => button.dataset.coreView === 'perspective').click(); }
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('pageshow', schedule);
  addEventListener('pagehide', () => { cancelAnimationFrame(frame); frame = 0; });
  document.addEventListener('visibilitychange', schedule);
  motionPreference.addEventListener('change', () => { pauseButton.hidden = motionPreference.matches; schedule(); });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    delete figure.dataset.rendered;
    controls.hidden = true;
    hint.hidden = true;
    canvas.tabIndex = -1;
    canvas.setAttribute('aria-hidden', 'true');
    drag = null;
    delete canvas.dataset.dragging;
  });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
  else addEventListener('resize', resize, { passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) schedule();
  }, { rootMargin: '100px' }).observe(figure);
  resize();
}

document.querySelectorAll('[data-core-scene]').forEach(figure => {
  try { startScene(figure); }
  catch (error) {
    delete figure.dataset.rendered;
    figure.querySelector('.scene-controls').hidden = true;
    figure.dataset.sceneStatus = 'fallback';
    console.warn('Core illustration: using static fallback.', error.message);
  }
});
