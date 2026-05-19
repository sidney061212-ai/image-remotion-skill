import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildMotionPlanFromAiRequest} from '../engine/ai-motion-compiler';
import {selectMotionRecipe} from '../engine/ai-recipe-selector';
import type {AiMotionRequest} from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

const loadExample = async (relativePath: string): Promise<AiMotionRequest> => {
  const content = await readFile(path.join(projectRoot, relativePath), 'utf8');
  return JSON.parse(content) as AiMotionRequest;
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

const main = async (): Promise<void> => {
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

  const infographicExample = await loadExample('examples/ai-request-infographic.json');
  const infographicPlan = buildMotionPlanFromAiRequest(infographicExample);
  assert.equal(infographicPlan.version, '2.0');
  assert.ok(infographicPlan.camera.length > 0);

  const storyboardExample = await loadExample('examples/ai-request-storyboard.json');
  const storyboardPlan = buildMotionPlanFromAiRequest(storyboardExample);
  assert.equal(storyboardPlan.version, '2.0');
  assert.ok(storyboardPlan.camera.some((keyframe) => keyframe.target.type === 'region'));

  console.log('All AI motion pipeline tests passed.');
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
