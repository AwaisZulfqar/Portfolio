# Hafiz Awais Zulfqar — portfolio

Portfolio for a Full Stack AI Engineer. Dark by default; **drag the 3D employee badge down
and let go to flip the site into light mode** (drag it down again to go back).

The badge is a real simulation — a Verlet-integrated lanyard with a rigid four-point
card body — so it swings, twists and settles on its own and never sits still.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

## Make it yours

Everything personal lives in **`src/lib/site.ts`** — name, role, employee ID,
stats, stack, projects, experience, education, socials. The 3D badge reads from the
same file, so changing the name there re-prints it on the card and on the lanyard
webbing. The portrait is `public/portrait.jpg`: it is drawn onto the badge's canvas
texture *and* used in the About section, so replacing that one file updates both.

Colours are CSS custom properties in **`src/app/globals.css`** (`:root` for dark,
`[data-theme="light"]` for light) — `--accent` is jade, `--sky` the cool secondary.
The badge's own palette mirrors them in `src/components/lanyard/card-texture.ts`.

## Background

`src/components/ui/ridges.tsx` draws the mountain backdrop: four ridge silhouettes
generated from a seeded PRNG (identical on server and client) and smoothed with
Catmull-Rom curves — low tension keeps the summits pointed. Each layer drifts at its
own rate on scroll and sways slowly forever. Tune a layer in the `SPECS` array
(`peaks`, `high`/`low`, `tension`, `opacity`, `travel`); `--ridge-strength` dials the
whole backdrop down in light mode.

## How the badge works

| File | Job |
| --- | --- |
| `lanyard/physics.ts` | Verlet solver. 15 strap particles + 4 card corners, held rigid by edge and diagonal constraints. Pull hard and the strap stretches, then snaps back. |
| `lanyard/card-texture.ts` | Draws the front, back and printed webbing on 2D canvases, per theme. No image assets. |
| `lanyard/scene.tsx` | The r3f scene: places the card from its corner particles, rebuilds the strap ribbon each frame, handles grab/drag, arms the light switch. |
| `lanyard/lanyard.tsx` | Fixed right-hand column + hint pill. Canvas is `pointer-events: none`; the scene raycasts the window itself, so nothing underneath ever becomes unclickable. |

Pull the card below the threshold and release → `ThemeProvider.toggle()`, plus a
short WebAudio pull-cord click.

Hidden below 1024px and under `prefers-reduced-motion`; the header toggle always works.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 / react-three-fiber ·
Motion · Lenis
