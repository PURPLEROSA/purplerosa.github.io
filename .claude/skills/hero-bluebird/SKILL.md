---
name: hero-bluebird
description: BLUEBIRD hero intro: an autoplay fly-in video where the subject flies in and lands in close-up, then the UI settles over it (a ghost serif word, glass cards, a pill nav) on a light pale-blue look. Use it for a premium, airy, trustworthy tech or SaaS hero, especially cybersecurity, fintech or AI. Triggers include "פתיח בלובירד", "Bluebird hero", "hero שציפור/אובייקט עף פנימה", "fly-in hero", "פתיח בהיר עם כרטיסי זכוכית".
---

# BLUEBIRD · Fly in, land, reveal
**DNA:** the video *is* the intro. Nothing gets scrolled. The subject flies into frame and lands in close-up, and only after it settles does the UI land with it. The feeling is calm, airy and high-tech, with plenty of light.

> Template: `template.html`, the engine in `hero-intro.js` + `hero-intro.css`. Live demo: `purplerosa.github.io/hero-intros/bluebird.html`

---

## 1. Visual system
| Token | Value | Role |
|---|---|---|
| `--bb-sky-1` | `#dbe8f3` | top of the gradient |
| `--bb-sky-2` | `#a9c6de` | middle |
| `--bb-sky-3` | `#6f9cc2` | bottom |
| `--bb-accent` | `#1f5eff` | primary CTA |
| `--bb-glass` | `rgba(255,255,255,.22)` + `backdrop-filter:blur(18px)` | cards and nav |
| glow | `radial-gradient` in white, blur 40px, behind the subject | "studio light" |

**Typography:** Inter 300 for the headline (thin, large, tracking −0.03em) · Instrument Serif for the ghost word (21vw, white at 28% opacity).

## 2. Anatomy of the frame (1920×1080)
```
┌ logo ───── [home·about·services·industries·threat intel·contact] ── (Resources) ┐
│                 B L U E B I R D   ← ghost serif, behind the subject              │
│                          ( subject in close-up )                                 │
│ Innovation                                                    ◉◉◉◉ Active +323  │
│ & security                                  ┌glass┐ ┌white┐ ┌ 42% ┐            │
│ [Our Solutions ›] [Contact us]               └─────┘ └─────┘ └─────┘            │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## 3. Motion timeline (the heart of the skill)
Total length **5.8 seconds**, with no scrolling. The UI comes in during the last third, while the subject is settling.

| ms | Element | Motion (`data-in`) | Duration | Easing |
|---|---|---|---|---|
| 0 → 5800 | video / subject | flies in from top-left, scale 0.1 → 1 | 5800 | expo-out `cubic-bezier(.16,1,.3,1)` |
| 3500 | ghost word | `blur`: blur 18px → 0, scale 1.06 → 1 | 1800 | expo-out |
| 3900 | nav | `drop`: from −120% | 900 | expo-out |
| 4300 | headline | `words` + `rise`: word by word from under a mask | 1000, stagger 120 | expo-out |
| 4700 | supporting copy | `fade-up` 28px | 900 | expo-out |
| 4900 | CTAs | `scale` 0.55 → 1 | 700 | back (overshoot) |
| 5000 / 5150 / 5300 | 3 cards | `fade-up`, staggered by 150ms | 900 | expo-out |
| 5500 | avatars | `fade` | 900 | — |

**Rule of thumb:** the UI starts at 60% of the video's length. Never before the subject is "landed", or the frame turns to noise.

## 4. Producing the video
**Workflow:** a still of the final frame (close-up) → image-to-video with an *end frame*.

**Still (Midjourney / Nano Banana / Flux):**
```
Ultra-detailed close-up portrait of a mountain bluebird perched, three-quarter profile,
vivid cobalt and ultramarine feathers with a soft peach chest, pale powder-blue seamless
studio background with a large soft white glow behind the head, airy high-key lighting,
shallow depth of field, premium tech brand aesthetic, 16:9, photoreal --ar 16:9
```
**Video (Kling 2.x / Veo 3 / Higgsfield), with the still as END FRAME:**
```
A bluebird flies in from the top-left of frame toward camera, wings beating, then lands
and settles into a close-up three-quarter portrait (end frame). Pale blue seamless studio,
soft white glow. Camera locked, no cuts. Smooth deceleration as it lands. 5-6 seconds.
```
**Encoding for the web (autoplay):**
```bash
ffmpeg -i bird.mp4 -vf "scale=1920:-2" -c:v libx264 -crf 23 -preset slow \
  -pix_fmt yuv420p -movflags +faststart -an bird.mp4
```
Also export a poster (`-frames:v 1` from the last frame) for slow connections.

## 5. Embedding in a website
1. Copy `hero-intro.css`, `hero-intro.js` and the `<section data-hero>` block from the template.
2. Set the video's `src` (keep `muted playsinline`, which iOS requires for autoplay).
3. Swap the copy. **Don't touch `data-at`** unless the video length changes. If it does, scale every value proportionally (new length ÷ 5800).
4. Re-skin through the `:root` tokens only.
5. Test with no file at all: `bluebird.html?video=https://…/clip.mp4`

**Over the video:** the ghost word gets `mix-blend-mode:overlay`, so it melts into the image (the CSS does this automatically through `.has-video`).

## 6. Prompt for Claude / Cursor (adapting to a new brand)
```
Use the hero-bluebird skill. Build a hero for <brand> (<field>).
Subject flying in: <eagle / drone / butterfly / paper plane>. Ghost word: <BRAND>.
Palette: keep it high-key; swap --bb-accent to <hex>. Headline: "<2-3 words>".
Keep the motion timeline exactly as in the skill (5.8s, UI from 3.5s).
```

## 7. Checklist
- [ ] The UI comes in only after the subject lands (≥ 60% of the video)
- [ ] Ghost word ≤ 30% opacity, sits behind the subject
- [ ] `prefers-reduced-motion` shows the final state right away (the engine does this)
- [ ] Mobile: the nav collapses and the cards scroll sideways (included in the template)
- [ ] The video is ≤ 4MB, with a poster image
