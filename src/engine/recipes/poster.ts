import type {AiMotionRequest, OverlayEvent} from '../../types';
import {
  buildCaptionOverlays,
  fullFrameKeyframe,
  getFirstRegionByRole,
  getNormalizedConstraints,
  getPrimaryRegion,
  getRegionLabel,
  pointKeyframe,
  regionCenter,
  regionKeyframe,
  regionScale,
  sortKeyframes,
  sortOverlays,
  type RecipeCompileResult,
} from './utils';

export const compilePosterHeroDepthPush = (request: AiMotionRequest): RecipeCompileResult => {
  const duration = request.task.durationSeconds;
  const constraints = getNormalizedConstraints(request);
  const hero = getFirstRegionByRole(request, ['hero', 'title']) ?? getPrimaryRegion(request);

  if (!hero) {
    return {
      camera: sortKeyframes([
        fullFrameKeyframe(0, 'poster-open'),
        pointKeyframe(duration, 0.5, 0.5, 1.08, 'easeInOut', 'poster-close'),
      ], duration),
      overlays: sortOverlays(buildCaptionOverlays(request, {}), duration),
      warnings: ['POSTER_HERO_DEPTH_PUSH received no regions and fell back to a gentle center push.'],
    };
  }

  const pushScale = regionScale(hero, request, {paddingRatio: 1.28, maxZoom: Math.min(constraints.maxZoom, 1.8)});
  const pullScale = Math.max(1, pushScale - 0.12);
  const {cx, cy} = regionCenter(hero, request);
  const pushTime = Math.max(0.8, duration * 0.45);
  const settleTime = Math.max(pushTime + Math.max(constraints.minHoldSeconds, 0.8), duration * 0.82);
  const regionTimes = {
    [hero.id]: {time: pushTime, duration: Math.max(0.8, settleTime - pushTime)},
  };
  const overlays: OverlayEvent[] = [
    {
      time: pushTime,
      duration: Math.max(0.8, settleTime - pushTime),
      type: 'label',
      regionId: hero.id,
      text: getRegionLabel(hero, request.script?.title ?? 'hero'),
    },
  ];

  return {
    camera: sortKeyframes([
      fullFrameKeyframe(0, 'poster-open'),
      fullFrameKeyframe(Math.max(0.4, duration * 0.18), 'poster-establish'),
      regionKeyframe(pushTime, hero.id, pushScale, 'spring', getRegionLabel(hero, 'hero')),
      pointKeyframe(settleTime, cx, cy, pushScale, 'hold', `hold-${hero.id}`),
      pointKeyframe(duration, cx, cy, pullScale, 'easeInOut', 'poster-pull'),
    ], duration),
    overlays: sortOverlays([...overlays, ...buildCaptionOverlays(request, regionTimes)], duration),
  };
};
