---
name: image-remotion-skill
description: Compile structured image understanding into a deterministic Remotion MotionPlan and render MP4. This skill is designed for AI-to-AI invocation, not manual editing.
allowed-tools: Read, Grep, Bash, Edit
---

# Image Motion Skill

## What this skill is for

Use this skill when an upstream AI already has:

- an image path
- the image width and height
- the image kind
- detected regions in pixel coordinates
- reading order
- a motion goal

This skill then:

1. validates the request
2. selects a motion recipe
3. compiles a deterministic `MotionPlan`
4. renders MP4 with Remotion

## What this skill is not for

Do not use this skill as:

- a manual editing UI
- a human review panel
- an OCR system
- a vision understanding model
- a free-form script-to-camera generator

The upstream AI must do the image understanding first.

## Preferred input

Always prefer generating an `AiMotionRequest`.

Do **not** ask the upstream AI to write camera keyframes directly unless it is very sure and intentionally bypassing the compiler.

Important rules:

- `visualStructure.regions` coordinates must be **source-image pixel coordinates**
- `readingOrder` must reflect how the image should be watched
- `primaryRegionId` should be provided when there is a final focus area
- `preferredRecipe` is optional and should only be set when the upstream AI is confident

## Recommended goals

- Information graphic: `animate-infographic`
- Storyboard / comic / multi-panel image: `animate-storyboard`
- Screenshot / app capture: `animate-screenshot`
- Poster / product visual: `animate-poster`
- Comparison image: `animate-comparison`
- Dense document or slide screenshot: `animate-document`
- Normal photo: `animate-photo`

## Expected workflow

```text
AI receives or generates image
-> AI analyzes structure
-> AI writes ai-motion-request.json
-> skill compiles motion-plan.json
-> skill renders mp4
```

## Core files

- Request schema: `schemas/ai-motion-request.schema.json`
- MotionPlan schema: `schemas/motion-plan.schema.json`
- Compiler entry: `src/engine/ai-motion-compiler.ts`
- Renderer: `src/remotion/MotionPlanRenderer.tsx`
- Composition: `src/remotion/MotionPlanRoot.tsx`
- CLI: `src/cli.ts`

## Commands

Compile:

```bash
npm run plan:ai -- <ai-motion-request.json> <motion-plan.json>
```

Render:

```bash
npm run render:motion -- <motion-plan.json> <output.mp4>
```

## Legacy note

Older `Storyboard` / `T01-T16` template flows still exist for compatibility, but they are `legacy/experimental`.

Prefer the new mainline based on:

- `AiMotionRequest`
- `MotionPlan`
- recipe compilers
- `MotionPlanRenderer`
