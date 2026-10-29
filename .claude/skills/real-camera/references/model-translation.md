# Model Translation — the same shot, every model

The shot DNA stays the same (rig → move → operator → subject → environment → focus/exposure → texture → guardrails). Only the syntax and emphasis change.

## Seedance 2.5 (`bytedance-seedance-v2.5`) — default
- **Specs:** up to 30s, up to 1080p, aspect ratios 21:9 / 16:9 / 4:3 / 1:1 / 3:4 / 9:16, up to 10 references (image, video and audio).
- **Structure:** `[shot/camera] + [subject] + [action] + [environment/lighting] + [style/texture]`, with camera **first**.
- **Strengths:** physical interaction (pouring, spraying, fabric contact), weather and atmosphere, beat-matching to wired audio.
- **Image-to-video:** describe **motion only** and don't re-describe the image. Add: `maintain exact appearance from reference image, consistent character throughout, no deformation or drift`.
- **Negatives work:** `no morphing, no warping, no extra fingers, no distorted hands, no text, no watermark, no logo distortion, no smooth gimbal float, no CGI look`.
- **Multi-shot in one clip:** this works with timecodes:
  `[0–4s] Shot 1: … [4–7s] Cut to Shot 2: …`. Use it for sequences and montage. For hero shots, generate **one shot per clip** (the guide says one continuous action per clip, and multi-beat narratives drift).
- **Start and end frames:** write the **bridge** ("from closed bottle in her palm to mist hanging in the light"), not a static description.
- **Edit / Extend:** `seedance-v2.5-edit` changes an existing clip ("add handheld breathing motion and film grain"). `seedance-v2.5-extend` continues from the last frame.
- **Audio:** if music is wired as a reference, keep `generate_audio` = true.
- **Reference leak (seen in production):** Seedance 2.5 can cut the wired reference images into the clip as flash frames at the start or end. Wire only the references you need, check the first and last second, and trim them in post (`ffmpeg -ss <in> -to <out>`) instead of re-generating.

## Kling 3.0 Pro / Kling 4.0
- Lead with the camera verb: `Handheld camera, slow push-in, …`.
- It renders handheld and body physics strongly. Keep prompts to 60–100 words.
- Motion Control variants: use a reference video for exact camera paths, for example to copy a real operator's whip-pan.

## Google Veo 3.1
- Responds to real cinematography terms (lens mm, film stock, "Steadicam", "rack focus").
- Native audio: put the sound in the same prompt: `SFX: silk rustle, heels on marble. Ambience: quiet gallery room tone.`
- Dialogue in quotes. Keep it minimal for luxury.

## Runway Gen-4.5 / Aleph 2.0
- Camera instructions in the **first sentence**. Image-to-video is the strongest path.
- Aleph: edit existing footage ("change the camera to a low angle", "add handheld shake").

## Wan 2.6 / MiniMax H3 / LTX 2
- Shorter and more literal. Use one move and one action, and name the lens.
- LTX Audio-to-Video: drive the cut rhythm from the music.

## Universal phrase bank (copy-paste)
- Handheld: `handheld shoulder-rig with subtle breathing rise-and-fall, micro-sway, small reframing corrections`
- Dutch: `Dutch angle, camera rolled 12° off horizon, slowly leveling`
- Low angle: `low angle from knee height, 28mm, looking up, slight wide-angle stretch`
- Live zoom: `live optical zoom snapping in, brief hold, drifting back out, uneven hand-pushed speed, flat zoom perspective`
- Macro: `extreme macro 100mm, razor-thin focal plane drifting across the texture, magnified micro-tremor`
- Whip: `fast whip-pan with heavy horizontal motion blur kept in frame, rolling-shutter skew, overshoot and settle`
- Texture: `shot on Kodak Vision3 500T, fine grain, red halation on highlights, slight gate weave, anamorphic edge softness`
