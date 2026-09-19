"use client";

/* eslint-disable react-hooks/immutability --
 * `sim` is an imperative physics instance, not render data. Every mutation
 * happens inside the useFrame loop (outside React's render phase), which the
 * compiler's immutability model does not describe. */

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ANCHOR, CARD_H, CARD_W, CLIP_OFFSET, Lanyard, ROPE_COUNT } from "./physics";
import { site } from "@/lib/site";
import {
  makeBackTexture,
  makeFrontTexture,
  makeStrapTexture,
  palettes,
} from "./card-texture";

type Props = {
  theme: "dark" | "light";
  onToggle: () => void;
  onArmed: (armed: boolean) => void;
  onGrab: (grabbing: boolean) => void;
};

/** Card centre must fall below this to arm the light switch. */
const PULL_THRESHOLD = -1.95;
/** How far the badge can be hauled away from the anchor — the webbing gives,
 *  like a real elastic lanyard, then snaps back when released. */
const MAX_PULL = 5.4;
const STRAP_WIDTH = 0.085;

/** Loads the portrait once so the badge can print it onto its canvas texture. */
function usePhoto(src: string) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    let alive = true;
    const el = new window.Image();
    el.crossOrigin = "anonymous";
    el.onload = () => {
      if (alive) setImg(el);
    };
    el.src = src;
    return () => {
      alive = false;
    };
  }, [src]);
  return img;
}

export function LanyardScene({ theme, onToggle, onArmed, onGrab }: Props) {
  const { camera, gl, viewport } = useThree();

  // One simulation instance for the lifetime of the scene; every mutation
  // happens inside useFrame, never during render.
  const [sim] = useState(() => new Lanyard());
  const pal = palettes[theme];

  const cardRef = useRef<THREE.Group>(null);
  const crystalRef = useRef<THREE.Mesh>(null);
  const strapRef = useRef<THREE.Mesh>(null);
  const clipRef = useRef<THREE.Group>(null);

  const photo = usePhoto(site.portrait);
  const front = useMemo(() => makeFrontTexture(theme, photo), [theme, photo]);
  const back = useMemo(() => makeBackTexture(theme), [theme]);
  const strapTex = useMemo(() => makeStrapTexture(theme), [theme]);
  useEffect(
    () => () => {
      front.dispose();
      back.dispose();
      strapTex.dispose();
    },
    [front, back, strapTex],
  );

  /* ---------------- strap ribbon geometry ---------------- */
  const strapGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = ROPE_COUNT;
    const pos = new Float32Array(n * 2 * 3);
    const uv = new Float32Array(n * 2 * 2);
    const idx: number[] = [];
    for (let i = 0; i < n; i++) {
      uv[i * 4 + 0] = 0;
      uv[i * 4 + 1] = i / (n - 1);
      uv[i * 4 + 2] = 1;
      uv[i * 4 + 3] = i / (n - 1);
      if (i < n - 1) {
        const a = i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => strapGeo.dispose(), [strapGeo]);

  /* ---------------- drag state ---------------- */
  const drag = useRef({
    active: false,
    weights: [0, 0, 0, 0] as number[],
    depth: 0,
    armed: false,
    pointerId: -1,
    target: new THREE.Vector3(),
  });

  useEffect(() => {
    const el = gl.domElement;
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const plane = new THREE.Plane();
    const hit = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const centre = new THREE.Vector3();
    const local = new THREE.Vector3();

    const toNdc = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        return null;
      ndc.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1,
      );
      return ndc;
    };

    /** Where on the card face (u,v in 0..1) does this pointer land? */
    const faceHit = (e: PointerEvent) => {
      if (!toNdc(e)) return null;
      ray.setFromCamera(ndc, camera);
      sim.basis(right, up, normal);
      centre.copy(sim.cardCentre);
      plane.setFromNormalAndCoplanarPoint(normal, centre);
      if (!ray.ray.intersectPlane(plane, hit)) return null;
      local.subVectors(hit, centre);
      const x = local.dot(right);
      const y = local.dot(up);
      if (Math.abs(x) > CARD_W / 2 || Math.abs(y) > CARD_H / 2) return null;
      return { u: x / CARD_W + 0.5, v: 0.5 - y / CARD_H, point: hit.clone() };
    };

    const onDown = (e: PointerEvent) => {
      const f = faceHit(e);
      if (!f) return;
      e.preventDefault();
      drag.current.active = true;
      drag.current.weights = Lanyard.cornerWeights(f.u, f.v);
      drag.current.depth = f.point.z;
      drag.current.target.copy(f.point);
      drag.current.armed = false;
      document.body.style.cursor = "grabbing";
      drag.current.pointerId = e.pointerId;
      onGrab(true);
    };

    const onMove = (e: PointerEvent) => {
      if (drag.current.active) {
        if (e.cancelable) e.preventDefault();
        if (!toNdc(e)) return;
        ray.setFromCamera(ndc, camera);
        plane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(0, 0, drag.current.depth),
        );
        if (ray.ray.intersectPlane(plane, hit)) {
          drag.current.target
            .copy(hit)
            .sub(ANCHOR)
            .clampLength(0, MAX_PULL)
            .add(ANCHOR);
          const bound = Math.max(0.05, viewport.width / 2 - CARD_W / 2 - 0.05);
          drag.current.target.x = THREE.MathUtils.clamp(
            drag.current.target.x,
            -bound,
            bound,
          );
        }
        return;
      }
      const over = Boolean(faceHit(e));
      document.body.style.cursor = over ? "grab" : "";
    };

    const onUp = () => {
      if (!drag.current.active) return;
      drag.current.pointerId = -1;
      drag.current.active = false;
      sim.dampen(0.32);
      document.body.style.cursor = "";
      onGrab(false);
      if (drag.current.armed) onToggle();
      drag.current.armed = false;
      onArmed(false);
    };

    window.addEventListener("pointerdown", onDown, { passive: false });
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onUp);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
      document.body.style.cursor = "";
    };
  }, [camera, gl, sim, viewport.width, onToggle, onArmed, onGrab]);

  /* ---------------- frame loop ---------------- */
  const tmpRight = useRef(new THREE.Vector3()).current;
  const tmpUp = useRef(new THREE.Vector3()).current;
  const tmpNormal = useRef(new THREE.Vector3()).current;
  const tmpCentre = useRef(new THREE.Vector3()).current;
  const mat4 = useRef(new THREE.Matrix4()).current;
  const scrollVel = useRef(0);
  const lastScroll = useRef(0);

  useEffect(() => {
    lastScroll.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      scrollVel.current += (y - lastScroll.current) * 0.06;
      lastScroll.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Idle breeze — the badge is never perfectly still.
    sim.wind.set(
      Math.sin(t * 0.63) * 0.5 + Math.sin(t * 2.17) * 0.16,
      0,
      Math.cos(t * 0.47) * 0.3 + Math.sin(t * 1.61) * 0.1,
    );
    // Scrolling the page shakes the strap.
    const shake = THREE.MathUtils.clamp(scrollVel.current, -6, 6);
    sim.wind.y -= shake * 0.5;
    sim.wind.x += shake * 0.22;
    scrollVel.current *= 0.88;

    if (drag.current.active) {
      sim.drag(drag.current.weights, drag.current.target);
    }

    sim.step(delta);

    // Re-assert the grab *after* the solver so the badge tracks the cursor
    // exactly; the unsatisfiable strap constraints spread into an even stretch.
    if (drag.current.active) {
      sim.drag(drag.current.weights, drag.current.target);
    }

    // Keep a readable face towards the camera, and keep it turning. Two
    // detuned sines so the roll never repeats on an obvious beat.
    const yaw = Math.sin(t * 0.52) * 0.34 + Math.sin(t * 1.27) * 0.07;
    sim.faceViewer(drag.current.active ? 0.09 : 0.2, yaw);

    // Hard frame guard: the badge may swing, but it may never leave the canvas.
    const halfW = viewport.width / 2;
    const cardLimit = Math.max(0.05, halfW - CARD_W / 2 - 0.05);
    const ropeLimit = Math.max(0.05, halfW - 0.12);
    for (let i = 0; i < sim.points.length; i++) {
      const pt = sim.points[i];
      const lim = i < ROPE_COUNT ? ropeLimit : cardLimit;
      if (pt.pos.x > lim) pt.pos.x = lim;
      else if (pt.pos.x < -lim) pt.pos.x = -lim;
    }

    if (drag.current.active) {
      const armed = sim.cardCentre.y < PULL_THRESHOLD;
      if (armed !== drag.current.armed) {
        drag.current.armed = armed;
        onArmed(armed);
      }
    }

    // Place the card group from the four corner particles.
    sim.basis(tmpRight, tmpUp, tmpNormal);
    tmpCentre.copy(sim.cardCentre);
    if (cardRef.current) {
      mat4.makeBasis(tmpRight, tmpUp, tmpNormal);
      cardRef.current.position.copy(tmpCentre);
      cardRef.current.quaternion.setFromRotationMatrix(mat4);
    }

    // Clip hardware rides the top edge of the card.
    if (clipRef.current) {
      clipRef.current.position
        .copy(tmpCentre)
        .addScaledVector(tmpUp, CARD_H / 2 + 0.02);
      clipRef.current.quaternion.setFromRotationMatrix(mat4);
    }

    if (crystalRef.current) {
      crystalRef.current.rotation.x += delta * 0.8;
      crystalRef.current.rotation.y += delta * 1.15;
    }

    // Rebuild the strap ribbon: always faces the camera, so it reads as webbing.
    const pos = strapGeo.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const view = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    const side = new THREE.Vector3();
    for (let i = 0; i < ROPE_COUNT; i++) {
      const p = sim.points[i].pos;
      const a = sim.points[Math.max(0, i - 1)].pos;
      const b = sim.points[Math.min(ROPE_COUNT - 1, i + 1)].pos;
      tangent.subVectors(b, a).normalize();
      view.subVectors(camera.position, p).normalize();
      side.crossVectors(tangent, view).normalize().multiplyScalar(STRAP_WIDTH);
      arr[i * 6 + 0] = p.x - side.x;
      arr[i * 6 + 1] = p.y - side.y;
      arr[i * 6 + 2] = p.z - side.z;
      arr[i * 6 + 3] = p.x + side.x;
      arr[i * 6 + 4] = p.y + side.y;
      arr[i * 6 + 5] = p.z + side.z;
    }
    pos.needsUpdate = true;
    strapGeo.computeVertexNormals();
    strapGeo.computeBoundingSphere();
  });

  const cardBody = theme === "dark" ? "#0c1013" : "#dde3de";

  return (
    <group>
      <ambientLight intensity={theme === "dark" ? 0.55 : 1.1} />
      <directionalLight position={[3, 6, 6]} intensity={theme === "dark" ? 2.1 : 2.6} />
      <directionalLight position={[-5, 1, -4]} intensity={0.8} color={pal.accent} />
      <pointLight position={[-1.9, -2.6, 2.2]} intensity={2.6} color={pal.accent} distance={6} />
      <pointLight position={[2.6, 2.2, -2]} intensity={2.4} color="#3fa3d1" distance={9} />

      {/* anchor bar the strap hangs from */}
      <mesh position={[ANCHOR.x, ANCHOR.y + 0.12, 0]}>
        <boxGeometry args={[0.9, 0.12, 0.12]} />
        <meshStandardMaterial color={theme === "dark" ? "#1f252b" : "#aeb6b0"} metalness={0.8} roughness={0.35} />
      </mesh>

      {/* printed webbing */}
      <mesh ref={strapRef} geometry={strapGeo}>
        <meshStandardMaterial
          map={strapTex}
          side={THREE.DoubleSide}
          roughness={0.85}
          metalness={0}
        />
      </mesh>

      {/* clip hardware */}
      <group ref={clipRef}>
        <mesh position={[0, CLIP_OFFSET - CARD_H / 2 - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.028, 12, 28]} />
          <meshStandardMaterial color="#9aa1aa" metalness={1} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.3, 0.16, 0.07]} />
          <meshStandardMaterial color="#b4bbc4" metalness={1} roughness={0.22} />
        </mesh>
      </group>

      {/* the badge */}
      <group ref={cardRef}>
        <mesh castShadow>
          <boxGeometry args={[CARD_W, CARD_H, 0.05]} />
          <meshPhysicalMaterial
            color={cardBody}
            roughness={0.42}
            metalness={0.05}
            clearcoat={0.9}
            clearcoatRoughness={0.18}
            reflectivity={0.4}
          />
        </mesh>
        <mesh position={[0, 0, 0.0262]}>
          <planeGeometry args={[CARD_W, CARD_H]} />
          <meshPhysicalMaterial
            map={front}
            roughness={0.36}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.12}
          />
        </mesh>
        <mesh position={[0, 0, -0.0262]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[CARD_W, CARD_H]} />
          <meshPhysicalMaterial
            map={back}
            roughness={0.42}
            metalness={0}
            clearcoat={0.8}
            clearcoatRoughness={0.2}
          />
        </mesh>

        {/* the three.js emblem set into the badge */}
        <mesh ref={crystalRef} position={[CARD_W / 2 - 0.28, -CARD_H / 2 + 0.33, 0.085]}>
          <icosahedronGeometry args={[0.145, 0]} />
          <meshPhysicalMaterial
            color={pal.accent}
            emissive={pal.accent}
            emissiveIntensity={theme === "dark" ? 0.55 : 0.2}
            roughness={0.15}
            metalness={0.65}
            flatShading
          />
        </mesh>
        <mesh position={[CARD_W / 2 - 0.28, -CARD_H / 2 + 0.33, 0.05]}>
          <torusGeometry args={[0.212, 0.011, 8, 40]} />
          <meshStandardMaterial color={pal.accent} metalness={0.9} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}
