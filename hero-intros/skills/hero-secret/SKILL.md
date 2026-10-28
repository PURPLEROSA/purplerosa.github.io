---
name: hero-secret
description: SECRET hero intro: a giant word rises letter by letter from behind the foreground landscape, in a dark cinematic atmosphere (red torii, mist), with scroll-driven video that pushes the camera through the gate into a second chapter. Use it for culture, travel, a hotel, a spa, gaming, wellness, or any brand built around atmosphere and mystery. Triggers include "פתיח סיקרט", "Secret hero", "מילה ענקית שעולה מאחורי הנוף", "פתיח קיוטו/יפני כהה", "word rising from landscape".
---

# SECRET · The word rises out of the land
**DNA:** the giant word comes up *out of the ground*, from behind the hills in the foreground, as if it were part of the landscape. The palette is near-black, with a single color (red) burning at the center. Scroll is a camera move: you go through the gate, the word sinks away, and a new chapter opens.

> Template: `template.html` · engine `hero-intro.js` + `hero-intro.css` · demo: `purplerosa.github.io/hero-intros/secret.html`

---

## 1. Visual system
| Token | Value | Role |
|---|---|---|
| `--sc-night` | `#071317` | base |
| `--sc-teal` | `#123038` | sky / fog |
| `--sc-red` | `#e3262b` | the only color: sun / gate |
| red glow | `box-shadow:0 0 120px 30px rgba(255,40,40,.55)` | light source |
| `--sc-paper` | `#eef1ef` | text |

**Typography:** Outfit 300 for the giant word (27vw, line-height .8, tracking −0.04em, white → grey-green gradient). Outfit 300 uppercase for headlines. Inter 9–12px for captions. A **thin, wide** font, not a heavy one: the mystery lives in that lightness.

## 2. Layer sandwich
```
z0  plate video (gate, sun, mist)          ← scrubbed by scroll
z1  .sc-shade: dark gradient, rises with scroll (readability for chapter 2)
z2  the giant word "Secret"
z3  foreground hills  ← in FRONT of the word. That's the trick
z5  UI: nav · title · thumbnail · 01–04 columns · kanji column
```
The hills are **a transparent PNG** cut from the plate's first frame (or the plate's last frame). Because the word rises from *behind* them, you get depth without any 3D.

## 3. Motion timeline
**Automatic intro 0 → 2.2s.**

| ms | Element | Motion | Duration | Easing |
|---|---|---|---|---|
| 100 + i×90 | letters S·e·c·r·e·t | `letters` + `rise`: from under the mask, y 110% → 0 | 1100 | expo-out |
| 900 | nav | `drop` | 800 | expo-out |
| 1200 | title "EXPLORING ANCIENT PATHWAYS…" | `words` + `rise`, stagger 70 | 900 | expo-out |
| 1500 | small copy | `fade-up` | 900 | expo-out |
| 1500–1800 | columns 01·02·03·04 | `fade-up`, stagger 100 | 900 | expo-out |
| 1900 | video thumbnail | `scale` | 700 | back |
| 2000 | kanji column | `fade` | 900 | — |

**On scroll (280vh):**
- `.sc-scene` / the video: push-in `scale 1 → 2.1` around the gate (transform-origin 50% 62%)
- the word: `translateY(45vh × p)`, `opacity 1−2.2p`, so it *sinks back* into the ground
- `.sc-shade`: dark gradient from the left, `opacity = 1.6p − .5`
- `data-scroll-range="0,0.38"`: chapter 1 (title, columns, thumbnail)
- `data-scroll-range="0.45,1"`: chapter 2: "UNVEILING MYSTICAL TEMPLES…" + paragraph + 3 "EXPLORING" cards

## 4. Producing the video
**Plate, a slow dolly-in (6s):**
```
Cinematic night scene in ancient Kyoto: a large vermilion torii gate in a dark stone
courtyard, behind it a huge glowing red circular paper lantern-sun with lattice pattern,
teal-black fog, red maple trees, stone lanterns glowing, wet reflective ground, moss-covered
hills in the foreground. Slow steady dolly-in toward and through the gate. Moody, low-key,
single red light source, anamorphic, photoreal, 16:9
```
**Foreground PNG:** take frame 1 → background removal / mask only the hills → export a transparent PNG at 1920px.

**Scrub encoding:**
```bash
ffmpeg -i kyoto.mp4 -vf "scale=1920:-2,fps=30" -c:v libx264 -crf 22 -preset slow \
  -x264-params keyint=1:scenecut=0 -pix_fmt yuv420p -movflags +faststart -an hero-scrub.mp4
```
Note: because the camera moves forward, the static PNG hills need to scale along with it. The template already does this: `.sc-hills{transform:scale(calc(1 + var(--p)*.6));transform-origin:50% 100%}`. Match the factor to how fast your camera moves.

## 5. Embedding
1. Copy the CSS, the JS and `<section data-hero data-scroll="280">`.
2. Video in `src`; replace `.sc-hills` with `<img class="sc-hills" src="hills.png">`. Once you have a real video, remove the CSS stand-in.
3. The word: anything 5–7 letters long works best in Outfit 300. Long words: drop to 22vw.
4. The chapter ranges (`data-scroll-range`) can be changed; leave a 0.05–0.1 gap between chapters so you never get two texts on screen at once.

## 6. Prompt for adaptation
```
Use the hero-secret skill. Brand: <name>. Place: <Kyoto/the desert/a fjord/a city at night>.
One burning color: <hex> instead of red. Giant word: <Word>.
Chapter 1: "<title>". Chapter 2: "<title>" + 3 cards.
Keep the sandwich (word behind the foreground) and the 2.2s timeline.
```

## 7. Checklist
- [ ] Only one saturated color in the frame
- [ ] The word comes out from *behind* the foreground (hills/rocks/water) and sinks back into it on scroll
- [ ] A thin font (200–300) for the word
- [ ] Shade layer for readability in chapter 2
- [ ] Gap between chapters, never two texts at once
