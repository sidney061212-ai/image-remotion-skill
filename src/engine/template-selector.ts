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

export function selectTemplate(request: TemplateRenderRequest): TemplateIdV2 {
  const {imageCategory, effectStyle, preferredTemplate} = request.task;

  if (isTemplateIdV2(preferredTemplate)) {
    return preferredTemplate;
  }

  if (effectStyle === 'cinematic-depth') {
    return 'CinematicDepthTemplate';
  }

  if (effectStyle === 'photo-wall') {
    return 'PhotoWallTemplate';
  }

  if (effectStyle === 'card-stack') {
    return 'CardStackTemplate';
  }

  if (effectStyle === 'grid-shuffle') {
    return 'GridShuffleTemplate';
  }

  if (effectStyle === 'product-hero') {
    return 'ProductHeroTemplate';
  }

  if (effectStyle === 'poster-impact') {
    return 'PosterImpactTemplate';
  }

  if (effectStyle === 'tech-scan' && (imageCategory === 'screenshot' || imageCategory === 'document')) {
    return 'ScreenshotScanTemplate';
  }

  if (imageCategory === 'infographic') {
    return 'InfographicZoomTemplate';
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

  if (imageCategory === 'storyboard') {
    return 'StoryboardGridTemplate';
  }

  if (imageCategory === 'document') {
    return 'DocumentFocusTemplate';
  }

  if (imageCategory === 'collage' || imageCategory === 'multi-image') {
    return 'PhotoWallTemplate';
  }

  return 'SafeKenBurnsTemplate';
}
