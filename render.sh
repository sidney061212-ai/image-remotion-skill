#!/bin/bash
# render.sh — Render an infogram video from a plan JSON
#
# Usage:
#   ./render.sh <plan.json> [output.mp4]
#
# The plan JSON must follow schemas/infogram-video-plan.schema.json
# Output defaults to ~/Desktop/<plan-name>.mp4

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

PLAN="${1:?Usage: ./render.sh <plan.json> [output.mp4]}"
OUTPUT="${2:-}"

# Read fps from plan for ffmpeg
FPS=$(python3 -c "import json; print(json.load(open('$PLAN'))['fps'])")
PLAN_NAME=$(basename "$PLAN" .json)

if [ -z "$OUTPUT" ]; then
  OUTPUT="$HOME/Desktop/${PLAN_NAME}.mp4"
fi

mkdir -p "$SCRIPT_DIR/outputs"
mkdir -p "$(dirname "$OUTPUT")"

# Copy plan to outputs/current-plan.json so InfogramRoot picks it up
cp "$PLAN" "$SCRIPT_DIR/outputs/current-plan.json"

echo "Rendering: $PLAN → $OUTPUT (${FPS}fps)"

# Render raw
RAW="/tmp/infogram-raw-$$.mp4"
node_modules/.bin/remotion render \
  "$SCRIPT_DIR/src/remotion/index.ts" \
  Infogram \
  "$RAW" \
  --concurrency=2

# Compress with correct fps
ffmpeg -i "$RAW" \
  -c:v libx264 -crf 20 -preset medium \
  -pix_fmt yuv420p -r "$FPS" \
  -movflags +faststart -an \
  -y "$OUTPUT" 2>&1 | tail -3

rm -f "$RAW"

SIZE=$(ls -lh "$OUTPUT" | awk '{print $5}')
echo "Done: $OUTPUT ($SIZE)"
