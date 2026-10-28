---
name: hero-primal
description: PRIMAL hero intro: giant serif letters spelled out one at a time (P-R-I-M-A-L) behind the subject, with a round Explore button and scroll-driven video that brings the subject closer. Use it for a luxury, jewelry, fashion, perfume or premium product brand. Triggers include "פתיח פרימל", "Primal hero", "אותיות ענק שנכתבות אחת-אחת", "hero יוקרה עם חיה/אובייקט מאחורי טקסט", "letters behind subject".
---

# PRIMAL · Spell the name, then step through it
**DNA:** the brand name is the set. Huge serif letters are written one at a time, and the subject stands *between* them: in front of the letters but behind the UI. Scrolling brings it toward the camera while the letters spread apart and fade.

> Template: `template.html` · engine `hero-intro.js` + `hero-intro.css` · demo: `purplerosa.github.io/hero-intros/primal.html`

---

## 1. Visual system
| Token | Value | Role |
|---|---|---|
| `--pr-bg-1` / `--pr-bg-2` | `#e9eef4` / `#c5d0dd` | porcelain radial background |
| `--pr-navy` | `#1b2c4f` | text and the gradient top of the letters |
| `--pr-steel` | `#8c9bb0` | gradient bottom of the letters |
| `--pr-cobalt` | `#2c4f9b` | cobalt porcelain accent |

**Typography:** Bodoni Moda 400 for the letters (19vw, high contrast, with a vertical gradient through `background-clip:text`). Inter 500/600 for the UI, small (11–13px), with wide tracking on buttons.

## 2. The layer sandwich (most important)
```
z0  plate video (background + subject, scrubbed by scroll)
z1  the giant letters  ← behind the subject
z2  subject cut-out (WebM with alpha, scrubbed in sync)  ← optional
z4  UI: top bar · Explore · tagline · thumbnails
```
**Three ways to get "letters behind the subject":**
1. **Alpha cut-out (best):** a second clip containing only the subject, with transparency (`yuva420p` WebM), scrubbed at the same time.
2. **Blend (fast):** the letters go *over* the video with `mix-blend-mode:multiply`. On a light subject they nearly disappear, which fakes the depth (the template does this automatically through `.has-video`).
3. **Static cut-out:** if the subject barely moves, a single transparent PNG of the subject over the letters.

## 3. Motion timeline
**Automatic intro 0 → 2.45s**, then scroll takes over.

| ms | Element | Motion | Duration | Easing |
|---|---|---|---|---|
| 0 → 2400 | subject | rises 8% with blur 10 → 0, opacity 0 → 1 | 2400 | expo-out |
| 250 + i×190 | letters P·R·I·M·A·L | `letters` + `letter-blur`: blur 12px, y 40% → 0 | 1000 each | expo-out |
| 1500 | Explore | `scale` + pulsing ring (2.6s loop) | 800 | back |
| 1800 | top bar | `drop` | 800 | expo-out |
| 2100 | tagline "Unleash your inner beast." | `fade-up` | 900 | expo-out |
| 2200 | thumbnails | `slide-l` | 900 | expo-out |
| 2300 | dot controls | `fade` | 900 | — |

**On scroll (`--p` 0 → 1, length 260vh):**
- video: `currentTime = p × duration` (with 0.12 inertia)
- letters: `letter-spacing: +0.25em×p`, `scale: 1+0.25p`, `opacity: 1−1.4p`
- subject: `scale .85 → 1.75`, rises 6vh
- `data-scroll-range="0.55,1"`: a "The Porcelain Collection" panel comes in

**Why 190ms between letters?** It's slow enough to be read as *spelling* (the viewer reads P… R… I…), and fast enough that the word finishes inside 1.5s.

## 4. Producing the video
**Plate (image-to-video, camera locked, 5–6s):**
```
A majestic white snow leopard with cobalt-blue Chinese porcelain floral patterns instead
of spots, walking slowly straight toward camera on a seamless pale blue-grey studio floor,
soft high-key light, subtle floor reflection, luxury jewelry campaign, photoreal,
locked camera, centered subject, 16:9
```
**Cut-out:** run the result through background removal (Runway / CapCut / Adobe) → export ProRes 4444 with alpha →
```bash
ffmpeg -i cat_alpha.mov -c:v libvpx-vp9 -pix_fmt yuva420p -crf 32 -b:v 0 -g 1 -an cat-alpha.webm
```
**Plate for scrubbing (important! every frame is a keyframe):**
```bash
ffmpeg -i plate.mp4 -vf "scale=1920:-2,fps=30" -c:v libx264 -crf 22 -preset slow \
  -x264-params keyint=1:scenecut=0 -pix_fmt yuv420p -movflags +faststart -an hero-scrub.mp4
```
Without `keyint=1`, scrubbing stutters. Keep the clip at ≤ 6s, which comes out around 6–12MB. Make a 1080px mobile version with `-crf 26`.

## 5. Embedding
1. Copy the CSS, the JS and `<section data-hero data-scroll="260">`.
2. `src` on the plate. The engine loads it as a Blob, so seeking is instant.
3. Swap the word inside `.pr-word`. The engine splits it into letters by itself. For 4–8 letters keep stagger at 190; for longer words drop it to 120.
4. Optional: add `<video class="pr-cutout">` at z2 and sync it in the `tick` loop.

## 6. Prompt for adaptation
```
Use the hero-primal skill. Brand: <name>, field: <jewelry/perfume/fashion>.
Giant word: <WORD>. Subject: <animal/object> in a <material> finish.
Palette: swap --pr-navy/--pr-steel/--pr-cobalt to <hex>. Keep the 190ms letter
stagger, the 2.45s intro and the scroll behavior.
```

## 7. Checklist
- [ ] The letters are behind the subject (sandwich, blend or cut-out)
- [ ] Spelling is readable: stagger 150–220ms
- [ ] The Explore button is in the center bottom third, under the subject
- [ ] The letters fade out before the second panel comes in (p ≈ 0.55)
- [ ] The plate is encoded with `keyint=1`
