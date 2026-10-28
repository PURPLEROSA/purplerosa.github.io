---
name: hero-arborea
description: ARBOREA hero intro: thin grid lines draw themselves from top to bottom, the headline is written in letter by letter with blur, and a living object (moss-covered branch, plant, sculpture) floats on a warm grey-green background with scroll-driven video. Use it for sustainability, wellness, nature, architecture, interior design or a calm boutique brand. Triggers include "פתיח ארבוריאה", "Arborea hero", "קווי גריד שנמתחים", "find your inner green", "hero טבע רגוע", "grid lines draw-in hero".
---

# ARBOREA · Calm architecture, living object
**DNA:** a precise architectural grid meets an organic object. First the *structure* is drawn (vertical lines), then the *words* (letter by letter), and finally the *life*: an object that floats and breathes. Everything is slow, soft and quiet.

> Template: `template.html` · engine `hero-intro.js` + `hero-intro.css` · demo: `purplerosa.github.io/hero-intros/arborea.html`

---

## 1. Visual system
| Token | Value | Role |
|---|---|---|
| `--ar-bg` | **`#454640`** | warm grey-green base (from the original brief) |
| `--ar-bg-2` | `#3a3b36` | radial edges |
| `--ar-line` | `rgba(255,255,255,.07)` | grid lines, almost invisible |
| `--ar-text` | `#f1f1ec` | text |
| moss | `#5f7d2e` / `#9bb34a` | the object's accent only |

**Typography:** Plus Jakarta Sans 400 for the headline (4.2vw, tracking −0.03em). The second line ("inner green") is at 60% opacity. UI at 12px.

## 2. Layers
```
z0  the object video (scrub)  ← UNDER everything, including the grid lines
z2  5 vertical grid lines (space-evenly)
z4  nav · headline · copy · "Our Products" pill · glass cards
```
The lines over the video are what give the "architectural" feel. Never put them behind it.

## 3. Motion timeline
**Automatic intro 0 → 2.3s.**

| ms | Element | Motion | Duration | Easing |
|---|---|---|---|---|
| 0 / 80 / 160 / 240 / 320 | 5 grid lines | `line`: scaleY 0 → 1 from the top | 900 | inout `cubic-bezier(.65,0,.35,1)` |
| 0 → 2200 | object | rises 14%, blur 14 → 0 | 2200 | expo-out |
| 500 | nav | `fade` | 900 | — |
| 600 + i×45 | "Find your" | `letters` + `letter-blur` | 700 | expo-out |
| 1050 + i×45 | "inner green" | same, starting where line 1 is ~70% done | 700 | expo-out |
| 1400 | supporting copy | `fade-up` | 900 | expo-out |
| 1700 | "Our Products" pill (glass, over the object) | `scale` | 800 | back |
| 1900 / 2050 | glass cards | `slide-l` | 900 | expo-out |

**Constant motion:** the object bobs (±2.2vh, 6s, ease-in-out, alternate). That's the sense of "breathing".

**On scroll (220vh):** the video scrubs (the object turns or the camera orbits around it). Stand-in: `rotate −6° → 8°`, `scale 1 → 1.35`. `data-scroll-range="0.5,1"` brings in a second statement.

**Why 45ms between letters?** It's fast enough to feel like *typing*, without dragging. The two lines overlap, so the reading feels continuous.

## 4. Producing the video
**Plate (slow orbit, 6s):**
```
A floating sculptural tree branch covered in lush green moss and tiny ferns, levitating
above a seamless warm grey-green studio floor (#454640), soft diffused top light, gentle
shadow below, slow 30-degree camera orbit around the object, calm, premium sustainable
brand, photoreal macro detail, 16:9, locked exposure
```
**Encoding (scrub):**
```bash
ffmpeg -i moss.mp4 -vf "scale=1920:-2,fps=30" -c:v libx264 -crf 22 -preset slow \
  -x264-params keyint=1:scenecut=0 -pix_fmt yuv420p -movflags +faststart -an hero-scrub.mp4
```
**Tip:** generate the background *exactly* in `#454640` (put it in the prompt and color-correct afterwards). If the video's edges don't match the page, add `-webkit-mask: radial-gradient(...)` to the video so the edges fade out.

## 5. Embedding
1. Copy the CSS, the JS and `<section data-hero data-scroll="220">`.
2. Video in `src`. The lines and UI stay on top.
3. Headline: two lines, each its own `<span data-in="letters">`. Line 2 starts at (line 1 start + 450ms).
4. Number of lines: 5 on desktop; on mobile you can hide 2 with `nth-child`.

## 6. Prompt for adaptation
```
Use the hero-arborea skill. Brand: <name>. Living object: <plant/stone/vase/sculpture>.
Base color: <hex> instead of #454640 (keep it muted and warm). Headline in two lines:
"<line 1>" / "<line 2>". CTA pill: "<text>".
Keep the grid draw-in → letters → object order and the 2.3s timeline.
```

## 7. Checklist
- [ ] Order: structure → words → life (never the other way round)
- [ ] Grid lines at ≤ 8% opacity, over the video
- [ ] Muted, warm background; the only saturated color lives in the object
- [ ] The glass pill sits *over* the object; it's the frame's anchor
- [ ] Constant bob of no more than 2–3vh
