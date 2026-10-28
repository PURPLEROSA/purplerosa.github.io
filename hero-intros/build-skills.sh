#!/usr/bin/env bash
# Packs every skill as a self-contained folder + zip (upload to Claude → Settings → Skills).
# Run from anywhere: bash hero-intros/build-skills.sh
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p downloads
for name in bluebird primal secret arborea runshift; do
  dir="skills/hero-$name"
  cp "$name.html" "$dir/template.html"
  cp hero-intro.js hero-intro.css "$dir/"
  (cd skills && zip -qr -X "../downloads/hero-$name.zip" "hero-$name")
  echo "packed downloads/hero-$name.zip"
done
