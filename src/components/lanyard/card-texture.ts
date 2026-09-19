import * as THREE from "three";
import { site } from "@/lib/site";

type Palette = {
  card: string;
  cardEdge: string;
  ink: string;
  sub: string;
  faint: string;
  accent: string;
  accentInk: string;
  panel: string;
};

export const palettes: Record<"dark" | "light", Palette> = {
  dark: {
    card: "#0f1316",
    cardEdge: "#1c222a",
    ink: "#eff3f4",
    sub: "#96a0a8",
    faint: "#28303a",
    accent: "#14c08a",
    accentInk: "#04120d",
    panel: "#171d23",
  },
  light: {
    card: "#ffffff",
    cardEdge: "#0c0e11",
    ink: "#0c0e11",
    sub: "#5c666a",
    faint: "#d5dbd6",
    accent: "#0e8f67",
    accentInk: "#f4fffa",
    panel: "#eaefeb",
  },
};

const W = 648;
const H = 1016;

function rounded(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function mono(c: CanvasRenderingContext2D, size: number, weight = 500) {
  c.font = `${weight} ${size}px ui-monospace, "SF Mono", Menlo, monospace`;
}
function sans(c: CanvasRenderingContext2D, size: number, weight = 600) {
  c.font = `${weight} ${size}px "Helvetica Neue", Inter, Arial, sans-serif`;
}

/** Front of the badge: photo panel, name block, ID row, barcode. */
export function makeFrontTexture(
  theme: "dark" | "light",
  photo?: HTMLImageElement | null,
) {
  const p = palettes[theme];
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const c = cv.getContext("2d")!;

  c.fillStyle = p.card;
  c.fillRect(0, 0, W, H);

  // hairline grid print
  c.strokeStyle = p.faint;
  c.lineWidth = 1;
  c.globalAlpha = 0.55;
  for (let x = 40; x < W; x += 36) {
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x, H);
    c.stroke();
  }
  c.globalAlpha = 1;

  // top accent band
  c.fillStyle = p.accent;
  c.fillRect(0, 0, W, 14);

  // punch hole
  c.fillStyle = p.panel;
  rounded(c, W / 2 - 62, 44, 124, 26, 13);
  c.fill();
  c.strokeStyle = p.faint;
  c.stroke();

  // header
  mono(c, 20, 600);
  c.fillStyle = p.sub;
  c.letterSpacing = "5px";
  c.fillText("ENGINEERING", 46, 124);
  c.textAlign = "right";
  c.fillStyle = p.accent;
  c.fillText("ACCESS · ALL", W - 46, 124);
  c.textAlign = "left";
  c.letterSpacing = "0px";

  c.strokeStyle = p.faint;
  c.beginPath();
  c.moveTo(46, 148);
  c.lineTo(W - 46, 148);
  c.stroke();

  // portrait panel
  const px = 46;
  const py = 176;
  const pw = W - 92;
  const ph = 372;
  c.fillStyle = p.panel;
  rounded(c, px, py, pw, ph, 10);
  c.fill();
  c.strokeStyle = p.faint;
  c.stroke();

  // portrait — the real photo when it has loaded, monogram until then
  c.save();
  c.beginPath();
  rounded(c, px, py, pw, ph, 10);
  c.clip();

  if (photo?.complete && photo.naturalWidth > 0) {
    const target = pw / ph;
    const sw = photo.naturalWidth * 0.84;
    const sh = sw / target;
    const sx = (photo.naturalWidth - sw) / 2;
    const sy = photo.naturalHeight * 0.04;

    // The source shot is low-key; lift it so the face reads at badge size.
    c.filter = "brightness(1.42) contrast(1.08) saturate(0.92)";
    c.drawImage(photo, sx, sy, sw, sh, px, py, pw, ph);
    c.filter = "none";

    // Extra lift for browsers that ignore ctx.filter.
    c.globalCompositeOperation = "lighten";
    c.globalAlpha = 0.1;
    c.fillStyle = "#ffffff";
    c.fillRect(px, py, pw, ph);

    // a breath of accent so the portrait belongs to the badge
    c.globalCompositeOperation = "overlay";
    c.globalAlpha = theme === "dark" ? 0.1 : 0.07;
    c.fillStyle = p.accent;
    c.fillRect(px, py, pw, ph);
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = 1;
  } else {
    const g = c.createLinearGradient(px, py, px + pw, py + ph);
    g.addColorStop(0, p.accent);
    g.addColorStop(1, theme === "dark" ? "#123542" : "#c2ccc7");
    c.globalAlpha = theme === "dark" ? 0.22 : 0.3;
    c.fillStyle = g;
    c.fillRect(px, py, pw, ph);
    c.globalAlpha = 1;
    sans(c, 210, 700);
    c.fillStyle = p.ink;
    c.textAlign = "center";
    c.fillText(site.initials, px + pw / 2, py + ph / 2 + 74);
    c.textAlign = "left";
  }
  // corner ticks
  c.strokeStyle = p.accent;
  c.lineWidth = 3;
  const t = 26;
  const marks: [number, number, number, number][] = [
    [px + 14, py + 14, 1, 1],
    [px + pw - 14, py + 14, -1, 1],
    [px + 14, py + ph - 14, 1, -1],
    [px + pw - 14, py + ph - 14, -1, -1],
  ];
  for (const [mx, my, sx, sy] of marks) {
    c.beginPath();
    c.moveTo(mx + sx * t, my);
    c.lineTo(mx, my);
    c.lineTo(mx, my + sy * t);
    c.stroke();
  }
  c.restore();
  c.lineWidth = 1;

  // name + role
  sans(c, 56, 700);
  c.fillStyle = p.ink;
  c.fillText(site.shortName.toUpperCase(), 46, 622);
  mono(c, 24, 500);
  c.fillStyle = p.accent;
  c.letterSpacing = "3px";
  c.fillText(site.role.toUpperCase(), 46, 660);
  c.letterSpacing = "0px";

  c.strokeStyle = p.faint;
  c.beginPath();
  c.moveTo(46, 692);
  c.lineTo(W - 46, 692);
  c.stroke();

  // data rows
  const rows: [string, string][] = [
    ["ID", site.employeeId],
    ["SINCE", site.since],
    ["BASE", site.cardLocation.toUpperCase()],
  ];
  let ry = 716;
  for (const [k, v] of rows) {
    mono(c, 18, 500);
    c.fillStyle = p.sub;
    c.letterSpacing = "3px";
    c.fillText(k, 46, ry);
    c.letterSpacing = "0px";
    mono(c, 24, 600);
    c.fillStyle = p.ink;
    c.textAlign = "right";
    c.fillText(v, W - 46, ry);
    c.textAlign = "left";
    ry += 38;
  }

  // emblem well (the 3D crystal sits here)
  c.fillStyle = p.panel;
  c.beginPath();
  c.arc(W - 112, H - 132, 54, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = p.faint;
  c.stroke();
  c.strokeStyle = p.accent;
  c.globalAlpha = 0.6;
  c.beginPath();
  c.arc(W - 112, H - 132, 66, 0, Math.PI * 2);
  c.stroke();
  c.globalAlpha = 1;

  // barcode
  let bx = 46;
  const rnd = mulberry(20240417);
  while (bx < W - 290) {
    const bw = 2 + Math.floor(rnd() * 6);
    c.fillStyle = rnd() > 0.28 ? p.ink : p.card;
    c.fillRect(bx, H - 176, bw, 56);
    bx += bw + 2;
  }
  mono(c, 17, 500);
  c.fillStyle = p.sub;
  c.letterSpacing = "4px";
  c.fillText(site.employeeId.replace(/-/g, " "), 46, H - 94);
  c.letterSpacing = "0px";

  // bottom band
  c.fillStyle = p.accent;
  c.fillRect(0, H - 56, W, 56);
  mono(c, 20, 700);
  c.fillStyle = p.accentInk;
  c.letterSpacing = "4px";
  c.fillText("PULL DOWN TO SWITCH LIGHTS", 46, H - 20);
  c.letterSpacing = "0px";

  // printed rim — keeps the badge reading as a hard object on any background
  c.strokeStyle = p.cardEdge;
  c.globalAlpha = theme === "dark" ? 0.9 : 0.16;
  c.lineWidth = 6;
  c.strokeRect(3, 3, W - 6, H - 6);
  c.globalAlpha = 1;
  c.lineWidth = 1;

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Back of the badge: terms, signature strip, magnetic stripe, QR block. */
export function makeBackTexture(theme: "dark" | "light") {
  const p = palettes[theme];
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const c = cv.getContext("2d")!;

  c.fillStyle = p.card;
  c.fillRect(0, 0, W, H);

  // magnetic stripe
  c.fillStyle = theme === "dark" ? "#05060700" : "#1b1c1e";
  c.fillStyle = theme === "dark" ? "#05060a" : "#1b1c1e";
  c.fillRect(0, 96, W, 104);

  c.fillStyle = p.panel;
  rounded(c, W / 2 - 62, 44, 124, 26, 13);
  c.fill();
  c.strokeStyle = p.faint;
  c.stroke();

  mono(c, 20, 600);
  c.fillStyle = p.sub;
  c.letterSpacing = "5px";
  c.fillText("BUILDS AI INTO PRODUCTS", 46, 262);
  c.letterSpacing = "0px";

  // signature strip
  c.fillStyle = p.panel;
  rounded(c, 46, 292, W - 92, 96, 8);
  c.fill();
  c.strokeStyle = p.faint;
  c.stroke();
  c.strokeStyle = p.ink;
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(86, 362);
  c.bezierCurveTo(150, 300, 190, 386, 246, 330);
  c.bezierCurveTo(292, 288, 320, 372, 388, 336);
  c.stroke();
  c.lineWidth = 1;

  mono(c, 18, 500);
  c.fillStyle = p.sub;
  c.fillText("AUTHORISED SIGNATURE", 46, 414);

  // stack chips
  const chips = ["TYPESCRIPT", "NODE.JS", "NEXT.JS", "POSTGRES", "PGVECTOR", "GPT-4", "AWS"];
  let cx = 46;
  let cy = 470;
  mono(c, 20, 600);
  for (const chip of chips) {
    const w = c.measureText(chip).width + 34;
    if (cx + w > W - 46) {
      cx = 46;
      cy += 54;
    }
    c.fillStyle = p.panel;
    rounded(c, cx, cy, w, 42, 21);
    c.fill();
    c.strokeStyle = p.faint;
    c.stroke();
    c.fillStyle = p.ink;
    c.fillText(chip, cx + 17, cy + 28);
    cx += w + 12;
  }

  // pseudo-QR
  const qx = W - 210;
  const qy = H - 300;
  c.fillStyle = p.ink;
  const rnd = mulberry(77113);
  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      if (rnd() > 0.48) c.fillRect(qx + i * 12, qy + j * 12, 12, 12);
    }
  }
  c.strokeStyle = p.faint;
  c.strokeRect(qx - 10, qy - 10, 176, 176);

  mono(c, 19, 500);
  c.fillStyle = p.sub;
  c.fillText("IF FOUND, RETURN TO", 46, H - 268);
  sans(c, 30, 700);
  c.fillStyle = p.ink;
  c.fillText(site.email, 46, H - 226);
  mono(c, 19, 500);
  c.fillStyle = p.sub;
  c.fillText(site.location.toUpperCase(), 46, H - 186);

  c.fillStyle = p.accent;
  c.fillRect(0, H - 56, W, 56);
  mono(c, 20, 700);
  c.fillStyle = p.accentInk;
  c.letterSpacing = "4px";
  c.fillText("DRAG ME · I SWING", 46, H - 20);
  c.letterSpacing = "0px";

  // printed rim — keeps the badge reading as a hard object on any background
  c.strokeStyle = p.cardEdge;
  c.globalAlpha = theme === "dark" ? 0.9 : 0.16;
  c.lineWidth = 6;
  c.strokeRect(3, 3, W - 6, H - 6);
  c.globalAlpha = 1;
  c.lineWidth = 1;

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Printed lanyard webbing — repeated name, like real conference straps. */
export function makeStrapTexture(theme: "dark" | "light") {
  const p = palettes[theme];
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 64;
  const c = cv.getContext("2d")!;

  c.fillStyle = p.accent;
  c.fillRect(0, 0, 512, 64);
  c.fillStyle = theme === "dark" ? "#0b0d10" : "#fff7f3";
  c.globalAlpha = 0.16;
  for (let i = 0; i < 512; i += 16) c.fillRect(i, 0, 8, 64);
  c.globalAlpha = 1;

  c.fillStyle = p.accentInk;
  c.font = `700 26px ui-monospace, Menlo, monospace`;
  c.textBaseline = "middle";
  c.letterSpacing = "4px";
  c.fillText(`${site.name.toUpperCase()} · ${site.role.toUpperCase()} ·`, 14, 34);
  c.letterSpacing = "0px";

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(5, 1);
  tex.anisotropy = 8;
  return tex;
}

/** Deterministic PRNG so the barcode/QR never flicker between renders. */
function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
