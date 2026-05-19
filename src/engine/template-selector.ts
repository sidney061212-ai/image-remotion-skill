import type {TemplateIdV2, TemplateRenderRequest} from '../types';

export const TEMPLATE_IDS_V2: readonly TemplateIdV2[] = [
  'InfographicZoomTemplate',
  'CinematicDepthTemplate',
  'PortraitFocusTemplate',
  'ProductHeroTemplate',
  'ScreenshotScanTemplate',
  'PosterImpactTemplate',
  'StoryboardGridTemplate',
  'PhotoWallTemplate',
  'CardStackTemplate',
  'GridShuffleTemplate',
  'DocumentFocusTemplate',
  'SafeKenBurnsTemplate',
];

const templateIdSet = new Set<string>(TEMPLATE_IDS_V2);

export const isTemplateIdV2 = (value: unknown): value is TemplateIdV2 =>
  typeof value === 'string' && templateIdSet.has(value);

const isMultiImageCategory = (imageCategory: TemplateRenderRequest['task']['imageCategory']): boolean =>
  imageCategory === 'collage' || imageCategory === 'multi-image';

const isCinematicCategory = (imageCategory: TemplateRenderRequest['task']['imageCategory'] | 'photo'): boolean =>
  imageCategory === 'landscape' || imageCategory === 'photo' || imageCategory === 'unknown';

export function selectTemplate(request: TemplateRenderRequest): TemplateIdV2 {
  const {imageCategory, effectStyle, preferredTemplate} = request.task;

  if (isTemplateIdV2(preferredTemplate)) {
    return preferredTemplate;
  }

  if (imageCategory === 'storyboard') {
    return 'StoryboardGridTemplate';
  }

  if (imageCategory === 'infographic') {
    return 'InfographicZoomTemplate';
  }

  if (isMultiImageCategory(imageCategory)) {
    if (effectStyle === 'card-stack') {
      return 'CardStackTemplate';
    }

    if (effectStyle === 'grid-shuffle') {
      return 'GridShuffleTemplate';
    }

    return 'PhotoWallTemplate';
  }

  if (effectStyle === 'tech-scan' && (imageCategory === 'screenshot' || imageCategory === 'document')) {
    return 'ScreenshotScanTemplate';
  }

  if (effectStyle === 'product-hero' && (imageCategory === 'product' || imageCategory === 'unknown')) {
    return 'ProductHeroTemplate';
  }

  if (effectStyle === 'poster-impact' && (imageCategory === 'poster' || imageCategory === 'unknown')) {
    return 'PosterImpactTemplate';
  }

  if (effectStyle === 'cinematic-depth' && isCinematicCategory(imageCategory)) {
    return 'CinematicDepthTemplate';
  }

  if (imageCategory === 'landscape') {
    return 'CinematicDepthTemplate';
  }

  if (imageCategory === 'portrait') {
    return 'PortraitFocusTemplate';
  }

  if (imageCategory === 'product') {
    return 'ProductHeroTemplate';
  }

  if (imageCategory === 'screenshot') {
    return 'ScreenshotScanTemplate';
  }

  if (imageCategory === 'poster') {
    return 'PosterImpactTemplate';
  }

  if (imageCategory === 'document') {
    return 'DocumentFocusTemplate';
  }

  return 'SafeKenBurnsTemplate';
}
