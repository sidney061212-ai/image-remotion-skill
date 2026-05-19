# image-remotion-skill

`image-remotion-skill` is an **AI-facing Remotion Template Skill**. The recommended path is intentionally simple: an upstream AI sends a coarse image category, image assets, duration, aspect ratio, optional style, and optional text; this skill selects a Remotion template and renders an MP4.

```text
Recommended:
TemplateRenderRequest -> validate -> selectTemplate -> buildTemplateRenderPlan -> TemplateVideo -> MP4

Advanced:
AiMotionRequest -> validate -> selectMotionRecipe -> buildMotionPlan -> MotionPlanRenderer -> MP4
```

## What This Skill Does

- AI gives image category, assets, duration, aspect ratio, and optional style/text.
- The skill chooses a Remotion template.
- The selected template uses preset animation to create a polished video.
- Single-image and multi-image inputs are both supported.
- The default request type is `TemplateRenderRequest`.

## What This Skill Does Not Do

- It does not OCR images.
- It does not deeply understand image contents.
- It does not require region annotations.
- It does not require reading-order planning.
- It does not act as a manual video editor.
- It does not require human keyframe editing.
- It does not call an external AI service.

## Recommended AI Usage

1. Classify the image category: `infographic`, `landscape`, `portrait`, `screenshot`, `product`, `poster`, `storyboard`, `multi-image`, or `unknown`.
2. Choose an optional `effectStyle`: for example `clean-zoom`, `cinematic-depth`, `photo-wall`, `card-stack`, or `grid-shuffle`.
3. Create a `TemplateRenderRequest` with assets, duration, aspect ratio, and optional title/subtitle/captions.
4. Run `npm run template:plan` or `npm run template:render`.

## Template Categories

- `infographic` -> `InfographicZoomTemplate`
- `landscape` -> `CinematicDepthTemplate`
- `portrait` -> `PortraitFocusTemplate`
- `product` -> `ProductHeroTemplate`
- `screenshot` -> `ScreenshotScanTemplate`
- `poster` -> `PosterImpactTemplate`
- `storyboard` -> `StoryboardGridTemplate`
- `document` -> `DocumentFocusTemplate`
- `multi-image` / `collage` -> `PhotoWallTemplate`, `CardStackTemplate`, or `GridShuffleTemplate`
- `unknown` -> `SafeKenBurnsTemplate`

## CLI Usage

Install and verify:

```bash
npm install
npm run typecheck
npm run build
npm run test
```

Compile a template plan:

```bash
npm run template:plan -- examples/template-request-infographic.json outputs/template-plan.json
```

Render from a template request:

```bash
npm run template:render -- examples/template-request-infographic.json outputs/template-video.mp4
```

Useful multi-image plan example:

```bash
npm run template:plan -- examples/template-request-multi-image.json outputs/template-multi-plan.json
```

## Schemas

Default template mode:

- `schemas/template-render-request.schema.json`
- `schemas/template-render-plan.schema.json`

Advanced motion mode:

- `schemas/ai-motion-request.schema.json`
- `schemas/motion-plan.schema.json`

## Examples

Template examples:

- `examples/template-request-infographic.json`
- `examples/template-request-landscape.json`
- `examples/template-request-portrait.json`
- `examples/template-request-screenshot.json`
- `examples/template-request-product.json`
- `examples/template-request-poster.json`
- `examples/template-request-storyboard.json`
- `examples/template-request-multi-image.json`
- `examples/template-request-card-stack.json`
- `examples/template-request-grid-shuffle.json`
- `examples/template-request-unknown.json`

## Advanced Mode

`AiMotionRequest` / `MotionPlan` is still available, but it is now an advanced mode for callers that can reliably provide source-image structure and explicit camera intent. It is not the default entry point.

Commands:

```bash
npm run plan:ai -- examples/ai-request-infographic.json outputs/infographic-plan.json
npm run render:motion -- outputs/infographic-plan.json outputs/infographic.mp4
```

## Legacy Mode

The older `Storyboard` / `T01-T16` pipeline is kept for compatibility and experimentation. It is not the recommended main path for new AI integrations.

Recommended priority:

1. `TemplateRenderRequest`
2. `AiMotionRequest` / `MotionPlan`
3. Legacy `Storyboard` / `T01-T16`

## License

MIT
