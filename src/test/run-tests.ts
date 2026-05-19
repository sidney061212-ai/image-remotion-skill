import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildMotionPlanFromAiRequest} from '../engine/ai-motion-compiler';
import {selectMotionRecipe} from '../engine/ai-recipe-selector';
import {buildTemplateRenderPlan} from '../engine/template-plan-compiler';
import {validateTemplateRenderRequest} from '../engine/template-request-validator';
import {selectTemplate} from '../engine/template-selector';
import type {AiMotionRequest, TemplateRenderRequest} from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

const loadExample = async <T>(relativePath: string): Promise<T> => {
  const content = await readFile(path.join(projectRoot, relativePath), 'utf8');
  return JSON.parse(content) as T;
};

const createBaseRequest = (): AiMotionRequest => ({
  version: '1.0',
  task: {
    goal: 'animate-infographic',
    durationSeconds: 8,
    aspectRatio: '16:9',
  },
  asset: {
    id: 'base-asset',
    path: 'examples/demo-infographic.svg',
    width: 1080,
    height: 1920,
    kind: 'infographic',
  },
  visualStructure: {
    layout: 'mixed',
    regions: [
      {
        id: 'r1',
        role: 'title',
        x: 100,
        y: 100,
        w: 400,
        h: 180,
      },
      {
        id: 'r2',
        role: 'detail',
        x: 100,
        y: 400,
        w: 400,
        h: 240,
      },
    ],
    readingOrder: ['r1', 'r2'],
    primaryRegionId: 'r2',
  },
});

const getThrownError = (callback: () => void): Error => {
  try {
    callback();
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }

  throw new Error('Expected function to throw, but it completed successfully.');
};

const createTemplateRequest = (): TemplateRenderRequest => ({
  version: '1.0',
  task: {
    imageCategory: 'infographic',
    durationSeconds: 8,
    aspectRatio: '16:9',
  },
  assets: [
    {
      id: 'asset-1',
      path: 'examples/demo-infographic.svg',
      width: 1080,
      height: 1920,
    },
  ],
});

const main = async (): Promise<void> => {
  // Advanced mode tests: AiMotionRequest / MotionPlan remains available for callers that can provide structure.
  const comparisonRequest: AiMotionRequest = {
    ...createBaseRequest(),
    task: {
      ...createBaseRequest().task,
      goal: 'animate-comparison',
    },
    asset: {
      ...createBaseRequest().asset,
      kind: 'chart',
    },
    visualStructure: {
      ...createBaseRequest().visualStructure,
      layout: 'comparison-split',
      regions: [
        {
          id: 'left',
          role: 'comparison-left',
          x: 40,
          y: 240,
          w: 420,
          h: 980,
        },
        {
          id: 'right',
          role: 'comparison-right',
          x: 560,
          y: 240,
          w: 420,
          h: 980,
        },
      ],
      readingOrder: ['left', 'right'],
      primaryRegionId: 'right',
    },
  };
  assert.equal(selectMotionRecipe(comparisonRequest), 'COMPARISON_LEFT_RIGHT_REVEAL');

  const storyboardRequest: AiMotionRequest = {
    ...createBaseRequest(),
    task: {
      ...createBaseRequest().task,
      goal: 'animate-storyboard',
    },
    asset: {
      ...createBaseRequest().asset,
      kind: 'storyboard',
    },
    visualStructure: {
      ...createBaseRequest().visualStructure,
      layout: 'comic-panels',
      regions: [
        {
          id: 'panel-1',
          role: 'panel',
          x: 80,
          y: 120,
          w: 420,
          h: 420,
        },
        {
          id: 'panel-2',
          role: 'panel',
          x: 560,
          y: 120,
          w: 420,
          h: 420,
        },
      ],
      readingOrder: ['panel-1', 'panel-2'],
      primaryRegionId: 'panel-2',
    },
  };
  assert.equal(selectMotionRecipe(storyboardRequest), 'STORYBOARD_PANEL_PUSH');

  const screenshotRequest: AiMotionRequest = {
    ...createBaseRequest(),
    task: {
      ...createBaseRequest().task,
      goal: 'animate-screenshot',
    },
    asset: {
      ...createBaseRequest().asset,
      kind: 'screenshot',
    },
  };
  assert.equal(selectMotionRecipe(screenshotRequest), 'SCREENSHOT_TOP_TO_BOTTOM_SCAN');

  const invalidReadingOrderRequest: AiMotionRequest = {
    ...createBaseRequest(),
    visualStructure: {
      ...createBaseRequest().visualStructure,
      readingOrder: ['r1', 'missing-region'],
    },
  };
  const readingOrderError = getThrownError(() => {
    buildMotionPlanFromAiRequest(invalidReadingOrderRequest);
  });
  assert.match(readingOrderError.message, /readingOrder references unknown region 'missing-region'/);

  const invalidPreferredRecipeRequest = {
    ...createBaseRequest(),
    task: {
      ...createBaseRequest().task,
      preferredRecipe: 'NOT_A_REAL_RECIPE',
    },
  };
  const preferredRecipeError = getThrownError(() => {
    buildMotionPlanFromAiRequest(invalidPreferredRecipeRequest as AiMotionRequest);
  });
  assert.match(preferredRecipeError.message, /preferredRecipe|must be one of/i);
  assert.doesNotMatch(preferredRecipeError.message, /compileRecipe|is not a function|undefined/i);

  const infographicExample = await loadExample<AiMotionRequest>('examples/ai-request-infographic.json');
  const infographicPlan = buildMotionPlanFromAiRequest(infographicExample);
  assert.equal(infographicPlan.version, '2.0');
  assert.ok(infographicPlan.camera.length > 0);

  const storyboardExample = await loadExample<AiMotionRequest>('examples/ai-request-storyboard.json');
  const storyboardPlan = buildMotionPlanFromAiRequest(storyboardExample);
  assert.equal(storyboardPlan.version, '2.0');
  assert.ok(storyboardPlan.camera.some((keyframe) => keyframe.target.type === 'region'));

  // Default template skill tests: TemplateRenderRequest is the recommended AI-facing path.
  const templateInfographicRequest = createTemplateRequest();
  assert.equal(selectTemplate(templateInfographicRequest), 'InfographicZoomTemplate');
  const templateInfographicPlan = buildTemplateRenderPlan(templateInfographicRequest);
  assert.equal(templateInfographicPlan.templateId, 'InfographicZoomTemplate');

  const templateLandscapeRequest: TemplateRenderRequest = {
    ...createTemplateRequest(),
    task: {
      ...createTemplateRequest().task,
      imageCategory: 'landscape',
    },
    assets: [
      {
        id: 'landscape',
        path: 'examples/demo-landscape.svg',
        width: 1920,
        height: 1080,
      },
    ],
  };
  assert.equal(selectTemplate(templateLandscapeRequest), 'CinematicDepthTemplate');
  assert.equal(buildTemplateRenderPlan(templateLandscapeRequest).templateId, 'CinematicDepthTemplate');

  const templatePortraitRequest: TemplateRenderRequest = {
    ...createTemplateRequest(),
    task: {
      ...createTemplateRequest().task,
      imageCategory: 'portrait',
    },
    assets: [
      {
        id: 'portrait',
        path: 'examples/demo-portrait.svg',
        width: 1080,
        height: 1600,
      },
    ],
  };
  assert.equal(selectTemplate(templatePortraitRequest), 'PortraitFocusTemplate');

  const templateProductRequest: TemplateRenderRequest = {
    ...createTemplateRequest(),
    task: {
      ...createTemplateRequest().task,
      imageCategory: 'product',
    },
    assets: [
      {
        id: 'product',
        path: 'examples/demo-product.svg',
        width: 1600,
        height: 1600,
      },
    ],
  };
  assert.equal(selectTemplate(templateProductRequest), 'ProductHeroTemplate');

  const templateScreenshotRequest: TemplateRenderRequest = {
    ...createTemplateRequest(),
    task: {
      ...createTemplateRequest().task,
      imageCategory: 'screenshot',
    },
    assets: [
      {
        id: 'screenshot',
        path: 'examples/demo-screenshot.svg',
        width: 1080,
        height: 1920,
      },
    ],
  };
  assert.equal(selectTemplate(templateScreenshotRequest), 'ScreenshotScanTemplate');

  const templatePosterRequest: TemplateRenderRequest = {
    ...createTemplateRequest(),
    task: {
      ...createTemplateRequest().task,
      imageCategory: 'poster',
    },
    assets: [
      {
        id: 'poster',
        path: 'examples/demo-poster.svg',
        width: 1200,
        height: 1600,
      },
    ],
  };
  assert.equal(selectTemplate(templatePosterRequest), 'PosterImpactTemplate');

  const templateMultiImageRequest: TemplateRenderRequest = {
    ...createTemplateRequest(),
    task: {
      ...createTemplateRequest().task,
      imageCategory: 'multi-image',
      effectStyle: 'photo-wall',
    },
    assets: [
      {id: 'a', path: 'examples/demo-photo-1.svg'},
      {id: 'b', path: 'examples/demo-photo-2.svg'},
      {id: 'c', path: 'examples/demo-photo-3.svg'},
    ],
  };
  assert.equal(selectTemplate(templateMultiImageRequest), 'PhotoWallTemplate');

  const templateCardStackRequest: TemplateRenderRequest = {
    ...templateMultiImageRequest,
    task: {
      ...templateMultiImageRequest.task,
      effectStyle: 'card-stack',
    },
  };
  assert.equal(selectTemplate(templateCardStackRequest), 'CardStackTemplate');

  const templateGridShuffleRequest: TemplateRenderRequest = {
    ...templateMultiImageRequest,
    task: {
      ...templateMultiImageRequest.task,
      effectStyle: 'grid-shuffle',
    },
  };
  assert.equal(selectTemplate(templateGridShuffleRequest), 'GridShuffleTemplate');

  const templateStoryboardRequest: TemplateRenderRequest = {
    ...createTemplateRequest(),
    task: {
      ...createTemplateRequest().task,
      imageCategory: 'storyboard',
    },
    assets: [
      {
        id: 'storyboard',
        path: 'examples/demo-storyboard.svg',
        width: 1920,
        height: 1080,
      },
    ],
    text: {
      title: 'Storyboard Grid',
      captions: ['A', 'B', 'C', 'D'],
    },
  };
  assert.equal(selectTemplate(templateStoryboardRequest), 'StoryboardGridTemplate');
  assert.equal(buildTemplateRenderPlan(templateStoryboardRequest).templateId, 'StoryboardGridTemplate');

  const templateUnknownRequest: TemplateRenderRequest = {
    ...createTemplateRequest(),
    task: {
      ...createTemplateRequest().task,
      imageCategory: 'unknown',
    },
  };
  assert.equal(selectTemplate(templateUnknownRequest), 'SafeKenBurnsTemplate');
  assert.equal(buildTemplateRenderPlan(templateUnknownRequest).templateId, 'SafeKenBurnsTemplate');

  const preferredTemplateRequest: TemplateRenderRequest = {
    ...createTemplateRequest(),
    task: {
      ...createTemplateRequest().task,
      preferredTemplate: 'DocumentFocusTemplate',
    },
  };
  assert.equal(selectTemplate(preferredTemplateRequest), 'DocumentFocusTemplate');
  assert.equal(buildTemplateRenderPlan(preferredTemplateRequest).templateId, 'DocumentFocusTemplate');

  const invalidPreferredTemplateRequest = {
    ...createTemplateRequest(),
    task: {
      ...createTemplateRequest().task,
      preferredTemplate: 'NotARealTemplate',
    },
  } as unknown as TemplateRenderRequest;
  const invalidPreferredTemplateDiagnostics = validateTemplateRenderRequest(invalidPreferredTemplateRequest);
  assert.ok(invalidPreferredTemplateDiagnostics.some((diagnostic) => /preferredTemplate|must be one of/i.test(diagnostic)));
  const invalidPreferredTemplateError = getThrownError(() => {
    buildTemplateRenderPlan(invalidPreferredTemplateRequest);
  });
  assert.match(invalidPreferredTemplateError.message, /preferredTemplate|must be one of/i);

  const emptyAssetsRequest: TemplateRenderRequest = {
    ...createTemplateRequest(),
    assets: [],
  };
  const emptyAssetsError = getThrownError(() => {
    buildTemplateRenderPlan(emptyAssetsRequest);
  });
  assert.match(emptyAssetsError.message, /assets.*at least 1|assets.*at least one/i);

  const templateInfographicExample = await loadExample<TemplateRenderRequest>('examples/template-request-infographic.json');
  assert.equal(buildTemplateRenderPlan(templateInfographicExample).templateId, 'InfographicZoomTemplate');

  const templateLandscapeExample = await loadExample<TemplateRenderRequest>('examples/template-request-landscape.json');
  assert.equal(buildTemplateRenderPlan(templateLandscapeExample).templateId, 'CinematicDepthTemplate');

  const templateMultiImageExample = await loadExample<TemplateRenderRequest>('examples/template-request-multi-image.json');
  const templateMultiImagePlan = buildTemplateRenderPlan(templateMultiImageExample);
  assert.ok(
    templateMultiImagePlan.templateId === 'PhotoWallTemplate' || templateMultiImagePlan.templateId === 'CardStackTemplate',
  );

  console.log('All template and motion pipeline tests passed.');
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
