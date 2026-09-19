import * as THREE from "three";

/**
 * Minimal 3D Verlet solver.
 *
 * The lanyard is a chain of particles; the card is four corner particles kept
 * rigid by edge + diagonal constraints. Because the card is *simulated* rather
 * than animated, it swings, twists and settles on its own — it never stops
 * moving, and grabbing a corner tilts it exactly like a real badge.
 */

export type Particle = {
  pos: THREE.Vector3;
  prev: THREE.Vector3;
  pinned: boolean;
};

export type Constraint = {
  a: number;
  b: number;
  len: number;
  /** 0..1 — how hard the constraint is enforced per iteration. */
  stiff: number;
};

export const CARD_W = 1.62;
export const CARD_H = 2.54;
/** Where the lanyard clip bites the card, measured from card centre. */
export const CLIP_OFFSET = CARD_H / 2 + 0.16;

const ROPE_SEGMENTS = 14;
const ROPE_LEN = 2.55;
const GRAVITY = new THREE.Vector3(0, -14, 0);
const DAMPING = 0.966;
const ITERATIONS = 18;
const MAX_STEP = 1 / 60;

export const ANCHOR = new THREE.Vector3(0, 3.45, 0);

/** Indices 0..ROPE_SEGMENTS are the strap; the last four are the card corners. */
export const ROPE_COUNT = ROPE_SEGMENTS + 1;
export const TL = ROPE_COUNT + 0;
export const TR = ROPE_COUNT + 1;
export const BR = ROPE_COUNT + 2;
export const BL = ROPE_COUNT + 3;
const CLIP = ROPE_COUNT - 1;

export class Lanyard {
  points: Particle[] = [];
  constraints: Constraint[] = [];
  /** Extra impulse applied to every particle — used for the idle breeze. */
  wind = new THREE.Vector3();

  private acc = 0;
  private tmp = new THREE.Vector3();
  private v1 = new THREE.Vector3();
  private v2 = new THREE.Vector3();
  private v3 = new THREE.Vector3();
  private v4 = new THREE.Vector3();
  private v5 = new THREE.Vector3();
  private v6 = new THREE.Vector3();
  private v7 = new THREE.Vector3();
  private v8 = new THREE.Vector3();
  private q = new THREE.Quaternion();

  constructor() {
    const seg = ROPE_LEN / ROPE_SEGMENTS;

    for (let i = 0; i <= ROPE_SEGMENTS; i++) {
      const p = new THREE.Vector3(ANCHOR.x, ANCHOR.y - i * seg, 0);
      this.points.push({ pos: p.clone(), prev: p.clone(), pinned: i === 0 });
      if (i > 0) this.constraints.push({ a: i - 1, b: i, len: seg, stiff: 1 });
    }

    const top = ANCHOR.y - ROPE_LEN - 0.16;
    const cx = CARD_W / 2;
    const corners: [number, number][] = [
      [-cx, top],
      [cx, top],
      [cx, top - CARD_H],
      [-cx, top - CARD_H],
    ];
    for (const [x, y] of corners) {
      const p = new THREE.Vector3(ANCHOR.x + x, y, 0);
      this.points.push({ pos: p.clone(), prev: p.clone(), pinned: false });
    }

    // Rigid quad: four edges + two diagonals.
    const diag = Math.hypot(CARD_W, CARD_H);
    this.constraints.push(
      { a: TL, b: TR, len: CARD_W, stiff: 1 },
      { a: BL, b: BR, len: CARD_W, stiff: 1 },
      { a: TL, b: BL, len: CARD_H, stiff: 1 },
      { a: TR, b: BR, len: CARD_H, stiff: 1 },
      { a: TL, b: BR, len: diag, stiff: 1 },
      { a: TR, b: BL, len: diag, stiff: 1 },
    );

    // Clip → the two top corners. Forms a triangle, so the card hangs level
    // but is still free to swing and spin around the clip.
    const clipLen = Math.hypot(CARD_W / 2, CLIP_OFFSET - CARD_H / 2 + 0.16);
    this.constraints.push(
      { a: CLIP, b: TL, len: clipLen, stiff: 0.9 },
      { a: CLIP, b: TR, len: clipLen, stiff: 0.9 },
    );
  }

  /** Bilinear weights of a point on the card face, used for grab + release. */
  static cornerWeights(u: number, v: number) {
    return [(1 - u) * (1 - v), u * (1 - v), u * v, (1 - u) * v];
  }

  get cardCentre() {
    return this.tmp
      .copy(this.points[TL].pos)
      .add(this.points[TR].pos)
      .add(this.points[BR].pos)
      .add(this.points[BL].pos)
      .multiplyScalar(0.25);
  }

  /** Nudge a point on the card face towards a world target (grab handling). */
  drag(weights: number[], target: THREE.Vector3) {
    const idx = [TL, TR, BR, BL];
    const cur = new THREE.Vector3();
    for (let i = 0; i < 4; i++) {
      cur.addScaledVector(this.points[idx[i]].pos, weights[i]);
    }
    const err = target.clone().sub(cur);
    const norm = weights.reduce((s, w) => s + w * w, 0) || 1;
    for (let i = 0; i < 4; i++) {
      this.points[idx[i]].pos.addScaledVector(err, weights[i] / norm);
    }
  }

  /**
   * Keep the badge readable, and keep it moving.
   *
   * Left to itself the quad will settle edge-on, or hang sideways once a drag
   * has spun it, and either way the printed face is lost. This relaxes the four
   * corners towards a target pose each frame:
   *
   *  - `yaw`  turns the card about its own vertical axis, so it is always
   *           rolling gently from front towards back instead of sitting still.
   *  - upright bias only bites past ~20 degrees of in-plane lean, so ordinary
   *           pendulum swing is untouched but a 90-degree hang is corrected.
   *
   * Whichever face is towards the camera stays towards the camera, so a
   * deliberate flip to the back sticks.
   */
  faceViewer(k: number, yaw = 0, uprightK = 0.06) {
    const tl = this.points[TL].pos;
    const tr = this.points[TR].pos;
    const br = this.points[BR].pos;
    const bl = this.points[BL].pos;

    const centre = this.v1
      .set(0, 0, 0)
      .add(tl)
      .add(tr)
      .add(br)
      .add(bl)
      .multiplyScalar(0.25);

    const rawRight = this.v2.subVectors(tr, tl);
    const rawUp = this.v3.subVectors(tl, bl);
    const normal = this.v4.crossVectors(rawRight, rawUp);
    const side = normal.z >= 0 ? 1 : -1;

    // In-plane lean, measured against "upright" for whichever face is showing.
    const lean = Math.atan2(rawRight.y, rawRight.x);
    const rest = side > 0 ? 0 : Math.PI;
    let delta = lean - rest;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;

    // Ignore small leans (that is the swing); pull hard on large ones.
    const a = Math.abs(delta);
    const t = THREE.MathUtils.clamp((a - 0.35) / (1.2 - 0.35), 0, 1);
    const bias = uprightK * (t * t * (3 - 2 * t));
    const angle = rest + delta * (1 - bias);

    const flatRight = this.v5.set(Math.cos(angle), Math.sin(angle), 0);
    const flatNormal = this.v6.set(0, 0, side);
    const up = this.v7.crossVectors(flatNormal, flatRight).normalize();

    // Roll about the card's own vertical axis.
    this.q.setFromAxisAngle(up, yaw);
    const right = flatRight.applyQuaternion(this.q);

    const hw = CARD_W / 2;
    const hh = CARD_H / 2;
    const corners: [number, number, number][] = [
      [TL, -hw, hh],
      [TR, hw, hh],
      [BR, hw, -hh],
      [BL, -hw, -hh],
    ];
    for (const [idx, sx, sy] of corners) {
      this.v8.copy(centre).addScaledVector(right, sx).addScaledVector(up, sy);
      this.points[idx].pos.lerp(this.v8, k);
    }
  }

  /** Scale every particle's velocity — used to soften the snap on release. */
  dampen(k: number) {
    for (const p of this.points) {
      if (p.pinned) continue;
      p.prev.lerpVectors(p.pos, p.prev, k);
    }
  }

  step(dt: number) {
    this.acc += Math.min(dt, 0.08);
    let guard = 0;
    while (this.acc >= MAX_STEP && guard++ < 4) {
      this.integrate(MAX_STEP);
      this.acc -= MAX_STEP;
    }
  }

  private integrate(dt: number) {
    const g = this.tmp;
    for (const p of this.points) {
      if (p.pinned) {
        p.pos.copy(ANCHOR);
        p.prev.copy(ANCHOR);
        continue;
      }
      g.copy(p.pos);
      p.pos.x += (p.pos.x - p.prev.x) * DAMPING + (GRAVITY.x + this.wind.x) * dt * dt;
      p.pos.y += (p.pos.y - p.prev.y) * DAMPING + (GRAVITY.y + this.wind.y) * dt * dt;
      p.pos.z += (p.pos.z - p.prev.z) * DAMPING + (GRAVITY.z + this.wind.z) * dt * dt;
      p.prev.copy(g);
    }

    const d = new THREE.Vector3();
    for (let k = 0; k < ITERATIONS; k++) {
      for (const c of this.constraints) {
        const a = this.points[c.a];
        const b = this.points[c.b];
        d.subVectors(b.pos, a.pos);
        const dist = d.length() || 1e-6;
        const diff = ((dist - c.len) / dist) * c.stiff * 0.5;
        if (!a.pinned) a.pos.addScaledVector(d, diff);
        if (!b.pinned) b.pos.addScaledVector(d, -diff);
      }
      // Keep the card in front of the page, never behind the camera plane.
      for (const p of this.points) {
        if (p.pos.z > 1.4) p.pos.z = 1.4;
        if (p.pos.z < -1.4) p.pos.z = -1.4;
      }
    }
  }

  /** Orthonormal basis of the card face, derived from the corner particles. */
  basis(right: THREE.Vector3, up: THREE.Vector3, normal: THREE.Vector3) {
    right.subVectors(this.points[TR].pos, this.points[TL].pos).normalize();
    up.subVectors(this.points[TL].pos, this.points[BL].pos).normalize();
    normal.crossVectors(right, up).normalize();
    up.crossVectors(normal, right).normalize();
  }
}
