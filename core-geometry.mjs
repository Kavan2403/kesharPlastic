// Original parametric hollow-tube geometry. Units are illustrative, not product dimensions.
export function createTube({ length = 4.6, outer = .72, inner = .56, segments = 96 } = {}) {
  if (!(length > 0 && outer > inner && inner > 0 && Number.isInteger(segments) && segments >= 3)) throw new RangeError('Invalid tube geometry');
  const vertices = [];
  const vertex = (position, normal) => vertices.push(...position, ...normal);
  const quad = (positions, normals) => [0, 1, 2, 0, 2, 3].forEach(i => vertex(positions[i], normals[i]));
  const point = (x, r, a) => [x, r * Math.cos(a), r * Math.sin(a)];
  const normal = (a, sign = 1) => [0, sign * Math.cos(a), sign * Math.sin(a)];
  const x = length / 2;
  for (let i = 0; i < segments; i++) {
    const a = i / segments * Math.PI * 2;
    const b = (i + 1) / segments * Math.PI * 2;
    for (const [r, sign] of [[outer, 1], [inner, -1]]) {
      quad([point(-x, r, a), point(x, r, a), point(x, r, b), point(-x, r, b)], [normal(a, sign), normal(a, sign), normal(b, sign), normal(b, sign)]);
    }
    for (const side of [-1, 1]) {
      const n = [side, 0, 0];
      quad([point(side * x, outer, a), point(side * x, outer, b), point(side * x, inner, b), point(side * x, inner, a)], [n, n, n, n]);
    }
  }
  return new Float32Array(vertices);
}

export function rotationMatrix(y, z, x = 0) {
  const c = Math.cos(y), s = Math.sin(y), a = Math.cos(z), b = Math.sin(z);
  const d = Math.cos(x), e = Math.sin(x);
  return new Float32Array([a * c, b * c, -s, 0,
    -b * d + a * s * e, a * d + b * s * e, c * e, 0,
    b * e + a * s * d, -a * e + b * s * d, c * d, 0, 0, 0, 0, 1]);
}

// Angles deliberately remain unbounded so repeated drags never hit a rotation stop.
export function orbitDrag(pose, dx, dy, width, height) {
  return { ...pose, y: pose.y + dx / Math.max(1, width) * Math.PI * 2,
    x: pose.x + dy / Math.max(1, height) * Math.PI * 2 };
}

export function perspective(aspect, fov = .66, near = .1, far = 40) {
  const f = 1 / Math.tan(fov / 2);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, 2 * far * near / (near - far), 0]);
}

export const clamp = value => Math.max(0, Math.min(1, value));
