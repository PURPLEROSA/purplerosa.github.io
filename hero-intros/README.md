# Hero Intros · 5 Skills + one engine

Five cinematic website intros, decoded from a carousel of viral hero prompts and turned into reusable skills.

| Skill | DNA | Mode | Intro |
|---|---|---|---|
| [`hero-bluebird`](skills/hero-bluebird/SKILL.md) | Subject flies in and lands, UI arrives with it | autoplay | 5.8s |
| [`hero-primal`](skills/hero-primal/SKILL.md) | Giant serif letters spelled out behind the subject | scrub | 2.45s |
| [`hero-secret`](skills/hero-secret/SKILL.md) | A word rising from behind the landscape, camera push-in | scrub | 2.2s |
| [`hero-arborea`](skills/hero-arborea/SKILL.md) | Grid lines → letters → a floating living object | scrub | 2.3s |
| [`hero-runshift`](skills/hero-runshift/SKILL.md) | A runner who never stops, scroll swaps worlds and slides | scrub | 1.75s |

**Live gallery:** `https://purplerosa.github.io/hero-intros/`

## Structure
```
hero-intros/
├── index.html          live gallery
├── hero-intro.js       engine (vanilla, ~4KB)
├── hero-intro.css      base layer
├── bluebird.html …     5 templates (source of truth)
├── skills/hero-*/      SKILL.md + template.html + engine (generated)
├── downloads/*.zip     packages for upload to Claude
└── build-skills.sh     rebuilds skills/ and downloads/ after a template change
```

## Workflow
1. Edit the template (`primal.html`, for example).
2. `bash hero-intros/build-skills.sh`, which refreshes `template.html` in the skill and the ZIP.
3. Upload the ZIP to Claude → Settings → Capabilities → Skills, or drop the folder into `.claude/skills/` in your project.

## Embedding in an existing site
Copy `hero-intro.css`, `hero-intro.js` and the `<section data-hero>` block from the template, set the video's `src`, and you're done. Each SKILL.md has the full timeline, the video-production prompts, the encoding command and an adaptation prompt for a new brand.

**Test without editing the code:** `primal.html?video=https://your-cdn/clip.mp4`
