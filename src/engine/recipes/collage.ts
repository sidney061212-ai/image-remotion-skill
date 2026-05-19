import type {AiMotionRequest, OverlayEvent} from '../../types';
import {
  buildCaptionOverlays,
  fullFrameKeyframe,
  getNormalizedConstraints,
  getOrderedRegions,
  pointKeyframe,
  regionCenter,
  regionKeyframe,
  regionScale,
  sortKeyframes,
  sortOverlays,
  type RecipeCompileResult,
} from './utils';
import {compilePhotoKenBurns} from './photo';

export const compileCollageAssemble = (request: AiMotionRequest): RecipeCompileResult => {
  const duration = request.task.durationSeconds;
  const constraints = getNormalizedConstraints(request);
  const regions = getOrderedRegions(request)
    .sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
    .slice(0, 4);

  if (regions.length < 2) {
    const fallback = compilePhotoKenBurns(request);
    return {
      ...fallback,
      warnings: [...(fallback.warnings ?? []), 'COLLAGE_ASSEMBLE fell back to PHOTO_KEN_BURNS because fewer than two regions were provided.'],
    };
  }

  const hopSpan = Math.max(0.65, (duration - 0.8) / (regions.length + 1));
  const camera = [fullFrameKeyframe(0, 'collage-open')];
  const overlays: OverlayEvent[] = [];
  const regionTimes: Record<string, {time: number; duration: number}> = {};

  regions.forEach((region, index) => {
    const moveEnd = Math.min(duration, 0.2 + hopSpan * (index + 1));
    const holdEnd = Math.min(duration, moveEnd + Math.max(0.35, constraints.minHoldSeconds * 0.65));
    const scale = regionScale(region, request, {paddingRatio: 1.12, maxZoom: Math.min(constraints.maxZoom, 1.8)});
    const {cx, cy} = regionCenter(region, request);

    camera.push(
      regionKeyframe(
        moveEnd,
        region.id,
        scale,
        constraints.allowWhipPan && !constraints.avoidFastMotion ? 'whip' : 'easeInOut',
        region.label ?? `collage-${index + 1}`,
      ),
    );
    camera.push(pointKeyframe(holdEnd, cx, cy, scale, 'hold', `hold-${region.id}`));

    overlays.push({
      time: moveEnd,
      duration: Math.max(0.3, holdEnd - moveEnd),
      type: 'focus-box',
      regionId: region.id,
    });

    regionTimes[region.id] = {
      time: moveEnd,
      duration: Math.max(0.3, holdEnd - moveEnd),
    };
  });

  camera.push(fullFrameKeyframe(duration, 'collage-full'));

  return {
    camera: sortKeyframes(camera, duration),
    overlays: sortOverlays([...overlays, ...buildCaptionOverlays(request, regionTimes)], duration),
  };
};
