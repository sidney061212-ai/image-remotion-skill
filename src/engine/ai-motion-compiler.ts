import type {AiMotionRequest, MotionPlan, MotionRecipeId} from '../types';
import {selectMotionRecipe} from './ai-recipe-selector';
import {splitAiMotionDiagnostics, validateAiMotionRequest} from './ai-request-validator';
import {compileCollageAssemble} from './recipes/collage';
import {compileComparisonLeftRightReveal} from './recipes/comparison';
import {compileDocumentLineSpotlight} from './recipes/document';
import {compileInfographicOverviewToKeypoints, compileInfographicStepScan} from './recipes/infographic';
import {compilePhotoKenBurns} from './recipes/photo';
import {compilePosterHeroDepthPush} from './recipes/poster';
import {compileScreenshotTopToBottomScan} from './recipes/screenshot';
import {compileStoryboardPanelHop, compileStoryboardPanelPush} from './recipes/storyboard';
import {getNormalizedConstraints, getOutputSize, type RecipeCompileResult} from './recipes/utils';

const DEFAULT_MOTION_FPS = 60;

const COMPILERS: Record<MotionRecipeId, (request: AiMotionRequest) => RecipeCompileResult> = {
  INFOGRAPHIC_OVERVIEW_TO_KEYPOINTS: compileInfographicOverviewToKeypoints,
  INFOGRAPHIC_STEP_SCAN: compileInfographicStepScan,
  STORYBOARD_PANEL_PUSH: compileStoryboardPanelPush,
  STORYBOARD_PANEL_HOP: compileStoryboardPanelHop,
  SCREENSHOT_TOP_TO_BOTTOM_SCAN: compileScreenshotTopToBottomScan,
  COMPARISON_LEFT_RIGHT_REVEAL: compileComparisonLeftRightReveal,
  POSTER_HERO_DEPTH_PUSH: compilePosterHeroDepthPush,
  COLLAGE_ASSEMBLE: compileCollageAssemble,
  DOCUMENT_LINE_SPOTLIGHT: compileDocumentLineSpotlight,
  PHOTO_KEN_BURNS: compilePhotoKenBurns,
};

export function buildMotionPlanFromAiRequest(request: AiMotionRequest): MotionPlan {
  const diagnostics = validateAiMotionRequest(request);
  const {errors, warnings} = splitAiMotionDiagnostics(diagnostics);

  if (errors.length > 0) {
    throw new Error(`Invalid AiMotionRequest:\n- ${errors.join('\n- ')}`);
  }

  const recipeId = selectMotionRecipe(request);
  const compileRecipe = COMPILERS[recipeId];
  const compiled = compileRecipe(request);
  const outputSize = getOutputSize(request.task.aspectRatio);
  const constraints = getNormalizedConstraints(request);

  return {
    version: '2.0',
    sourceRequestVersion: '1.0',
    image: request.asset.path,
    imageWidth: request.asset.width,
    imageHeight: request.asset.height,
    outputWidth: outputSize.width,
    outputHeight: outputSize.height,
    fps: DEFAULT_MOTION_FPS,
    durationSeconds: request.task.durationSeconds,
    recipeId,
    visualStructure: request.visualStructure,
    camera: compiled.camera,
    overlays: compiled.overlays,
    renderOptions: {
      allowBlur: constraints.allowBlur,
      allowWhipPan: constraints.allowWhipPan,
    },
    warnings: [...warnings, ...(compiled.warnings ?? [])],
  };
}
