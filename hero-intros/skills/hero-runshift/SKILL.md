---
name: hero-runshift
description: RUNSHIFT hero intro: a vibrant gaming/sports hero with a running character (seen from behind) whose video is driven by scroll. A glass nav drops in, a heavy italic headline slams in letter by letter, and the world and slides change as you scroll (track → desert, Endless Worlds → Hero Gear). Use it for games, sport, energy drinks, Gen-Z apps, events or anything that needs forward energy. Triggers include "פתיח ראנשיפט", "Runshift hero", "hero גיימינג צבעוני", "דמות רצה עם גלילה", "metaverse hero", "scroll changes slides".
---

# RUNSHIFT · Forward motion, world shift
**DNA:** the character never stops running, and *you* control the world. Scroll is the treadmill: each scroll stage swaps the scene and the slide. The colors are saturated and the type is heavy and italic. Total energy.

> Template: `template.html` · engine `hero-intro.js` + `hero-intro.css` · demo: `purplerosa.github.io/hero-intros/runshift.html`

---

## 1. Visual system
| Token | Value | Role |
|---|---|---|
| `--rs-sky` | `#2ab3d6` | sky |
| `--rs-violet` | `#6b3fd1` | character / UI |
| `--rs-magenta` | `#e2336b` | world 1 (track) |
| `--rs-orange` | `#ff8a2a` | world 2 (desert) |
| `--rs-sun` | `#ffd34d` | vanishing-point light |
| glass | `rgba(255,255,255,.18)` + blur 14 | nav and buttons |

**Typography:** Archivo 900 *Italic* uppercase for headlines (6.4vw, line-height .88) plus a soft shadow. Inter 400–600 for the UI.

## 2. Anatomy
```
┌ ◆Runshift ── [(Home) Worlds Exploration Characters Journey Connect] ── (Enter) ☰ ┐
│ ENDLESS                                                                          │
│ WORLDS        ←— slide 1 (left) · slide 2 "HERO GEAR" (right)                    │
│ [Explore Worlds]        ( runner, from behind )                                  │
│                                                                    ╭3.2M╮        │
│                          ◯ ◉ ◯ ◯   ← character selector            ╰────╯        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## 3. Motion timeline
**Automatic intro 0 → 1.75s.** The fastest of the five, to match the genre.

| ms | Element | Motion | Duration | Easing |
|---|---|---|---|---|
| 150 | glass nav | `drop` | 900 | **back** (bounces as it lands) |
| 550 + i×35 | "ENDLESS WORLDS" | `letters` + `slide-l`: each letter from 60px to the right | 700 | expo-out |
| 1150 | supporting copy | `fade-up` | 900 | expo-out |
| 1350 | "Explore Worlds" | `scale` | 600 | back |
| 1500 | character selector | `fade-up` | 900 | expo-out |
| 1600 | 3.2M counter + dashed ring (spins at 12s/turn) | `scale` | 700 | expo-out |

**On scroll (300vh):**
- video: the runner keeps running; the world changes (in the original: stadium → desert)
- stand-in: `hue-rotate(38deg × p)` changes the world from magenta to orange
- `data-scroll-range="0,0.45"`: slide 1 "ENDLESS WORLDS" (left)
- `data-scroll-range="0.45,1"`: slide 2 "HERO GEAR" + "View Gear" (right)
- slide changes: opacity + translateY 24px, 0.7–0.9s

**The rule:** the slide's text sits *on the opposite side* from where the character is heading. The character runs to the center, so the text alternates left/right between slides.

## 4. Producing the video
**Still for the style (Midjourney / Nano Banana):**
```
Stylized 3D animated character seen from behind, sprinting down a vibrant pink-red running
track in a stadium, lavender hoodie, teal cargo pants, pink sneakers, dramatic speed lines,
saturated sky blue with puffy clouds, Fortnite / Spider-Verse painterly style, low camera
following behind, 16:9
```
**Video (8–10s, a single take with a world transition):**
```
Camera follows a stylized animated runner from behind at low height. He sprints along a
pink stadium track; mid-shot the environment seamlessly morphs into an orange desert road
with purple mesas and cacti, same runner, same camera, continuous motion, speed lines,
vibrant saturated colors, no cuts.
```
If the model doesn't manage the transition: generate two clips (track, desert) with a shared last/first frame and join them with `ffmpeg -f concat`.

**Encoding (scrub):**
```bash
ffmpeg -i run.mp4 -vf "scale=1920:-2,fps=30" -c:v libx264 -crf 23 -preset slow \
  -x264-params keyint=1:scenecut=0 -pix_fmt yuv420p -movflags +faststart -an hero-scrub.mp4
```
The world change should happen at **45%** of the clip, the same point where the slides swap (`0.45`).

## 5. Embedding
1. Copy the CSS, the JS and `<section data-hero data-scroll="300">`.
2. Video in `src`. Delete `.rs-world`/`.rs-portal` once there's a real video (they hide automatically through `.has-video`).
3. More slides: add a `.rs-slide` with `data-scroll-range` and split the ranges evenly (3 slides = 0–0.33, 0.33–0.66, 0.66–1). Raise `data-scroll` to 120vh per slide.
4. The character selector can switch videos: on click, `video.src = …` (the engine will scrub the new clip).

## 6. Prompt for adaptation
```
Use the hero-runshift skill. Brand: <game/brand>. Character: <description>.
Worlds by scroll: <world 1> → <world 2> (→ <world 3>). Slides: "<title 1>", "<title 2>".
Palette: swap --rs-* to <hex>. Keep Archivo Black Italic, the bouncing nav,
the 1.75s intro and slide swaps synced to the world change in the video.
```

## 7. Checklist
- [ ] The character never stops (continuous motion even with no scroll, from the video or a loop)
- [ ] Slide swaps = the world change in the video (the same p)
- [ ] Text alternates sides between slides
- [ ] Heavy italic font, saturated colors, glass for the UI only
- [ ] Intro ≤ 1.8s; it's an energetic genre
