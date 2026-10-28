# "DELIVERED" — spec film, 30s, 16:9 (Seedance 2.5)

**Concept:** In an endless field of pink cosmos, a crew of iridescent animals runs a tiny, perfect "office" of cream retro tech. Everyone is working toward one delivery: the scent, for her.
**Lead:** Shelly in "Disco Couture": a floor-length, body-skimming gown of tiny hand-set mirror tiles (a disco ball as fabric), long sleeves, an open back and a short fishtail train. Wet-look hair slicked back, glass skin, silver inner-corner liner.
**Product:** a faceted blush-pink glass bottle with a silver cap and a liquid-chrome bow, carrying no text.
**Look:** Kodak Ektachrome E100, cobalt sky, hard late-afternoon sun, real flares, pollen, fine grain. Shot like a 35mm fashion editorial: handheld, with wind.
**Camera curve:** 2 → 3 → 2 → 4 → 3 → 2 → 1 → 2 → 1

## References to wire
- @image1: the Disco Couture hero frame and the close-up (her identity and look)
- @image2: the hero bottle
- @image3: the master plate (field and chair)
- @image4–7: chameleon, pelican with envelope, pelican with headphones, giraffe

## PROMPT (single 30s generation)
```
A 30-second luxury fragrance film in nine shots, shot like a 35mm fashion editorial on Kodak Ektachrome E100: an endless field of pink and white cosmos under a saturated cobalt sky, hard late-afternoon sun, real lens flares, pollen drifting, wind moving the flowers in every shot. Cream retro computer objects, liquid-chrome vines and small mirrored disco balls grow among the flowers. The perfume bottle is identical in every shot: faceted blush-pink glass, a silver cap, a liquid-chrome bow, no text. Maintain the woman's exact appearance from the reference image; consistent character throughout, no drift.

[0–3s] Shot 1: Low handheld camera at flower height with subtle breathing motion. A cream CRT monitor half-buried in cosmos flickers on; its curved screen reflects the sky. The focus searches through foreground petals, then lands on the glowing screen.

[3–6s] Cut to Shot 2: 85mm lens, handheld. The iridescent pastel chameleon on the curved mouse cable clicks the mouse with one foot; its skin ripples from pink to silver. The operator is a half-beat late and reframes.

[6–9s] Cut to Shot 3: Telephoto 200mm across the field, heat shimmer. The white pelican with iridescent wings takes the cream envelope in its beak and turns; out-of-focus cosmos drift through the foreground.

[9–12s] Cut to Shot 4: Fast whip-pan with heavy horizontal motion blur kept in frame, settling with an overshoot on the giraffe, which lowers its head into frame, curious, its lashes catching the sun. A live zoom snaps in to its eye and drifts back out.

[12–16s] Cut to Shot 5: Steadicam at knee height gliding backward, with a gentle float and a tiny bump. The woman walks slowly through the cosmos toward camera in a floor-length, body-skimming mirror-tile gown, her wet-look hair slicked back; the short fishtail train drags through the flowers and petals lift behind it. The mirror tiles throw hundreds of moving light spots across the flowers, and the sun flares behind her shoulder.

[16–19s] Cut to Shot 6: Handheld, Dutch angle rolled 10 degrees, slowly levelling. The pelican lands beside her with a heavy wingbeat and offers the envelope; she takes it. Feathers and petals scatter in the air.

[19–23s] Cut to Shot 7: Low-angle locked-off shot from the ground on a 28mm lens, only faint breathing motion. She sits back in the cream bouclé armchair with the chrome swirl arm, centred in the field, and opens the envelope. The chameleon, pelicans and giraffe gather around her. Hard backlight, rim light on the silver lamé, one anamorphic flare. Poster frame.

[23–27s] Cut to Shot 8: Extreme macro on a 100mm lens with magnified micro-tremor. The pink bottle slides out of the envelope into her hand; she presses the atomiser and a fine mist catches the sunlight. Pink caustics dance across her fingers; the thin focal plane drifts from the chrome bow to the mist.

[27–30s] Cut to Shot 9: Locked-off with only faint breathing, 75mm lens. The bottle stands alone on a glossy cobalt plinth among the cosmos, a disco ball glinting beside it, the wind moving the flowers. Clean negative space on the right.

Sound: wind through flowers, a CRT hum and click, a mouse click, a heavy pelican wingbeat, tulle rustling, paper tearing softly, the hiss of the atomiser, then quiet wind.

Negative: no text, no letters, no logo, no watermark, no morphing, no warping, no face drift, no extra limbs, no distorted hands, no bottle shape changes, no CGI look, no plastic skin, no smooth gimbal float, no oversaturated cartoon look.
```

## Production notes
- Run a test of shot 5 alone (5s) first. It is the hardest one: identity, tulle physics and Steadicam together.
- If any shot drifts in the 30s run, re-generate it as a single shot and assemble the film in a composition node.
- Music (ElevenLabs Music v2.5): `Breezy French pop-orchestral, pizzicato strings, harp glissandi, soft analog synth arpeggio, light hand-claps, 112 BPM, playful and luxurious, a lift at 0:12 and a swell at 0:19, ends on a single chime.` Wire it into Seedance as reference audio.
- The logo and "Spec ad" label go in post, on shot 9.
