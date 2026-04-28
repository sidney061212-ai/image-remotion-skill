---
name: image-remotion-skill
description: Turn a single infographic image + script/voiceover into a smooth camera-motion video using Remotion.
allowed-tools: Read, Grep, Bash, Edit
---

# Infogram Video Skill

## What it does

Input: one infographic image + a script (voiceover text, oral script, or shot list).
Output: a rendered MP4 video with smooth camera motion over the image.

The AI generates a `video-plan.json` following the schema, then Remotion renders it.

## Quick start

1. User provides an image and a script/voiceover.
2. AI analyzes the image layout and identifies regions of interest.
3. AI parses the script into timed segments.
4. AI generates `video-plan.json` mapping segments → keyframes.
5. Copy image to `public/` directory.
6. Run `./render.sh outputs/<name>/video-plan.json ~/Desktop/<name>.mp4`

## Video plan schema

See `schemas/infogram-video-plan.schema.json` for the full schema.

Core fields:
- `image`: path relative to `public/` directory
- `imageWidth`, `imageHeight`: source image dimensions (use `sips -g pixelWidth -g pixelHeight`)
- `outputWidth`, `outputHeight`: video resolution (user choice, default 2560×1440)
- `fps`: frame rate (user choice, default 90)
- `durationSeconds`: must match script/voiceover length
- `keyframes`: array of `{ time, cx, cy, scale }` points

## Camera motion rules — CRITICAL

These rules are non-negotiable. Every generated plan must follow them.

### 1. Movement types

There are exactly 3 movement types:

| Type | Duration | When to use |
|------|----------|-------------|
| Push-in | 1.5–2.5s | Opening zoom from full view to first region |
| Pan/slide | 1–2s | Moving between adjacent regions (same row/column) |
| Whip-pan | 0.3s | Moving between distant regions (different row AND column) |

### 2. Static holds are mandatory

After every movement, the camera MUST hold still for 1.5–4s.
The hold duration matches the voiceover segment for that region.
Never move the camera continuously just to fill time.

### 3. No extra zoom after arrival

When the camera arrives at a region, keep the scale constant.
Do NOT add slow zoom-in or zoom-out during holds.
Exception: the opening push-in and the final conclusion push are allowed to change scale.

### 4. Whip-pan rules

Use whip-pan (0.3s transition) when moving between regions that are far apart:
- Different row AND different column on the image
- Distance > 0.4 in normalized coordinates

The Remotion component automatically detects high velocity and applies motion blur.
Do NOT use pull-back-and-re-push. It causes motion sickness.

### 5. Scale guidelines

| View | Scale value | Use case |
|------|-------------|----------|
| Full image | 1.0 | Opening, ending pullback |
| Region overview | 1.8–2.2 | Showing a section with context |
| Close-up | 2.4–2.8 | Reading specific data/text |
| Max close-up | 3.0–3.2 | Emphasizing one key number (rare) |

After arriving at a region, do not change scale. Pick the right scale for the destination and hold it.

### 6. Ending pattern

The ending always follows this sequence:
1. Whip-pan or pull back to full image (scale 1.0), hold 1–2s
2. Push into conclusion/summary region, hold until end

### 7. Keyframe density

- Movement keyframes come in pairs: [start position] → [end position]
- Hold keyframes: duplicate the end position at a later time
- Typical pattern: `move(1.5s) → hold(3s) → whip(0.3s) → hold(3s) → move(2s) → hold(2s) → ...`

## How to analyze an image

When the user provides an infographic, identify:

1. **Layout grid**: how many rows × columns of content blocks
2. **Reading order**: which block should be shown first, second, etc.
3. **Region coordinates**: for each block, estimate (cx, cy) in normalized 0–1 coordinates
   - cx=0 is left edge, cx=1 is right edge
   - cy=0 is top edge, cy=1 is bottom edge
4. **Importance**: which blocks deserve close-up (scale 2.4+) vs overview (scale 2.0)

## How to parse a script

Split the script/voiceover into segments. Each segment maps to one image region.

For each segment, determine:
- **Duration**: based on word count (~3 Chinese characters per second for voiceover)
- **Target region**: which image block this segment describes
- **Movement type**: push-in, pan, or whip-pan to reach the target

## Keyframe generation algorithm

```
1. Start: keyframe at t=0, cx=0.5, cy=0.5, scale=1.0 (full image)
2. Hold full image for 2-3s
3. For each script segment:
   a. Calculate movement duration based on distance:
      - Adjacent region: 1-2s pan
      - Distant region: 0.3s whip-pan
      - First region from full view: 1.5-2.5s push-in
   b. Add movement keyframe pair: [current position at t] → [target position at t + move_duration]
   c. Add hold keyframe: [target position at t + move_duration + hold_duration]
4. End: pull back to full image or push to conclusion
5. Final hold until durationSeconds
```

## Example plan

```json
{
  "image": "showcase/example.png",
  "imageWidth": 1672,
  "imageHeight": 941,
  "outputWidth": 2560,
  "outputHeight": 1440,
  "fps": 90,
  "durationSeconds": 60,
  "keyframes": [
    { "time": 0,    "cx": 0.50, "cy": 0.50, "scale": 1.0,  "label": "全图" },
    { "time": 3,    "cx": 0.50, "cy": 0.50, "scale": 1.0,  "label": "停留" },
    { "time": 5,    "cx": 0.20, "cy": 0.18, "scale": 2.8,  "label": "推近左上区域" },
    { "time": 7,    "cx": 0.20, "cy": 0.18, "scale": 2.8,  "label": "停留" },
    { "time": 9,    "cx": 0.45, "cy": 0.18, "scale": 2.8,  "label": "横扫到右侧" },
    { "time": 12,   "cx": 0.45, "cy": 0.18, "scale": 2.8,  "label": "停留" },
    { "time": 12.3, "cx": 0.30, "cy": 0.55, "scale": 2.4,  "label": "甩镜到第二行" },
    { "time": 15,   "cx": 0.30, "cy": 0.55, "scale": 2.4,  "label": "停留" }
  ]
}
```

## Render command

```bash
./render.sh outputs/<project>/video-plan.json ~/Desktop/<project>.mp4
```

Or manually:
```bash
cp outputs/<project>/video-plan.json outputs/current-plan.json
npx remotion render src/remotion/index.ts Infogram /tmp/raw.mp4 --concurrency=2
ffmpeg -i /tmp/raw.mp4 -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -r <fps> -movflags +faststart -an -y ~/Desktop/output.mp4
```

## User-configurable parameters

| Parameter | Default | Notes |
|-----------|---------|-------|
| outputWidth × outputHeight | 2560×1440 | 2K. Use 1920×1080 for 1080p |
| fps | 90 | 60 or 90 for smooth motion. 30 will look choppy on pans |
| durationSeconds | matches script | Must equal voiceover/script length |
| whipPanThreshold | 8 | Lower = more sensitive blur trigger |
| whipPanBlurMax | 40 | Max blur pixels during whip-pan |

## File structure

```
public/<project>/image.png          ← source image
outputs/<project>/video-plan.json   ← generated plan
outputs/current-plan.json           ← symlink/copy for Remotion
src/remotion/InfogramVideo.tsx      ← renderer component
src/remotion/InfogramRoot.tsx       ← Remotion composition
src/remotion/index.ts               ← entry point
render.sh                           ← one-command render
```
