---
name: image-remotion-skill
description: Render AI-facing image videos with Remotion templates. Prefer coarse image categorization over precise structure markup. Advanced MotionPlan mode remains available when structure is known.
allowed-tools: Read, Grep, Bash, Edit
---

# Image Remotion Skill

## What this skill is for

Use this skill when an upstream AI has one or more images and wants to turn them into a short Remotion video.

The recommended mode is template-first:

- AI provides image paths
- AI provides rough image category
- AI optionally provides effect style
- AI optionally provides title / subtitle / captions
- skill selects a Remotion template and renders MP4

## Recommended input

Always prefer generating a `TemplateRenderRequest` unless the upstream AI truly has reliable region annotations.

Recommended categories:

- `infographic`
- `landscape`
- `portrait`
- `product`
- `screenshot`
- `poster`
- `storyboard`
- `collage`
- `multi-image`
- `unknown`

Important rules:

- AI does **not** need to provide `regions`
- AI does **not** need to provide `readingOrder`
- AI should focus on coarse classification, not precise camera planning
- `effectStyle` is optional
- `width` / `height` are helpful but not mandatory in template mode

## Advanced mode

Use `AiMotionRequest` only when the upstream AI already knows:

- `visualStructure.regions`
- `readingOrder`
- `primaryRegionId`

This is the advanced MotionPlan path, not the default recommendation.

## What this skill is not for

Do not use this skill as:

- a manual editing UI
- a human review panel
- an OCR system
- a full vision understanding model
- a free-form script-to-camera generator

## Expected workflows

Recommended:

```text
AI receives or generates image(s)
-> AI classifies image category
-> AI writes template-render-request.json
-> skill selects template
-> skill renders mp4
```

Advanced:

```text
AI receives or generates image
-> AI annotates structure
-> AI writes ai-motion-request.json
-> skill compiles motion-plan.json
-> skill renders mp4
```

## Core files

Template-first path:

- Request schema: `schemas/template-render-request.schema.json`
- Plan schema: `schemas/template-render-plan.schema.json`
- Selector: `src/engine/template-selector.ts`
- Plan builder: `src/engine/template-plan-builder.ts`
- Templates: `src/templates/`
- Composition: `src/remotion/TemplateRoot.tsx`

Advanced MotionPlan path:

- Request schema: `schemas/ai-motion-request.schema.json`
- MotionPlan schema: `schemas/motion-plan.schema.json`
- Compiler entry: `src/engine/ai-motion-compiler.ts`
- Renderer: `src/remotion/MotionPlanRenderer.tsx`
- Composition: `src/remotion/MotionPlanRoot.tsx`

## Commands

Template-first:

```bash
npm run template:plan -- <template-render-request.json> <template-plan.json>
npm run template:render -- <template-render-request.json> <output.mp4>
```

Advanced MotionPlan:

```bash
npm run plan:ai -- <ai-motion-request.json> <motion-plan.json>
npm run render:motion -- <motion-plan.json> <output.mp4>
```

## Legacy note

Older `Storyboard` / `T01-T16` flows still exist for compatibility, but they are `legacy/experimental`.
