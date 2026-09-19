import { useSyncExternalStore } from "react";

/**
 * Is this browser rasterising WebGL on the CPU?
 *
 * Machines without a usable GPU — CI runners, Lighthouse/PageSpeed, VMs, some
 * locked-down corporate builds — fall back to SwiftShader or llvmpipe. Every
 * frame of an animating canvas then lands on the main thread as a long task,
 * and resolution, MSAA and frame-rate caps all fail to bring it under control.
 * Detect it once so callers can leave the canvas out entirely; anything with
 * real hardware is untouched.
 */
const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i;

let cached: boolean | null = null;

export function isSoftwareRenderer(): boolean {
  if (cached !== null) return cached;
  if (typeof document === "undefined") return false;

  cached = false;
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ||
      canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) {
      // No WebGL at all — treat it as the cheap path either way.
      cached = true;
      return cached;
    }
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = ext
      ? (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string)
      : (gl.getParameter(gl.RENDERER) as string);
    cached = SOFTWARE.test(String(renderer || ""));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    // Renderer info is masked on some browsers; assume hardware and keep the
    // full-quality path rather than degrading everyone.
    cached = false;
  }
  return cached;
}

const noop = () => () => {};

/** SSR-safe read of {@link isSoftwareRenderer} — `false` on the server. */
export function useSoftwareRenderer() {
  return useSyncExternalStore(noop, isSoftwareRenderer, () => false);
}
