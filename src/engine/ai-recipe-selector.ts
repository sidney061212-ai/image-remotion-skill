import type {AiMotionRequest, MotionRecipeId} from '../types';

export function selectMotionRecipe(request: AiMotionRequest): MotionRecipeId {
  if (request.task.preferredRecipe) {
    return request.task.preferredRecipe;
  }

  if (request.task.goal === 'animate-storyboard' || request.visualStructure.layout === 'comic-panels') {
    return 'STORYBOARD_PANEL_PUSH';
  }

  if (
    request.task.goal === 'animate-infographic' &&
    (request.visualStructure.layout === 'vertical-sections' || request.visualStructure.layout === 'timeline')
  ) {
    return 'INFOGRAPHIC_STEP_SCAN';
  }

  if (request.asset.kind === 'infographic' || request.asset.kind === 'chart') {
    return 'INFOGRAPHIC_OVERVIEW_TO_KEYPOINTS';
  }

  if (request.task.goal === 'animate-screenshot' || request.asset.kind === 'screenshot') {
    return 'SCREENSHOT_TOP_TO_BOTTOM_SCAN';
  }

  if (request.task.goal === 'animate-comparison' || request.visualStructure.layout === 'comparison-split') {
    return 'COMPARISON_LEFT_RIGHT_REVEAL';
  }

  if (request.task.goal === 'animate-poster' || request.asset.kind === 'poster' || request.asset.kind === 'product') {
    return 'POSTER_HERO_DEPTH_PUSH';
  }

  if (
    request.task.goal === 'animate-collage' ||
    request.visualStructure.layout === 'grid' ||
    request.asset.kind === 'collage'
  ) {
    return 'COLLAGE_ASSEMBLE';
  }

  if (request.task.goal === 'animate-document' || request.asset.kind === 'document') {
    return 'DOCUMENT_LINE_SPOTLIGHT';
  }

  if (request.task.goal === 'animate-photo' || request.asset.kind === 'photo' || request.asset.kind === 'portrait') {
    return 'PHOTO_KEN_BURNS';
  }

  return 'INFOGRAPHIC_OVERVIEW_TO_KEYPOINTS';
}
