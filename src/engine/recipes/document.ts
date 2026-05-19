import type {AiMotionRequest, OverlayEvent} from '../../types';
import {
  buildCaptionOverlays,
  fullFrameKeyframe,
  getFirstRegionByRole,
  getNormalizedConstraints,
  getPrimaryRegion,
  pointKeyframe,
  regionCenter,
  regionKeyframe,
  regionScale,
  sortKeyframes,
  sortOverlays,
  type RecipeCompileResult,
} from './utils';

export const compileDocumentLineSpotlight = (request: AiMotionRequest): RecipeCompileResult => {
  const duration = request.task.durationSeconds;
  const constraints = getNormalizedConstraints(request);
  const title = getFirstRegionByRole(request, ['title', 'subtitle']);
  const detail = getFirstRegionByRole(request, ['detail', 'quote']) ?? getPrimaryRegion(request);
  const focusRegions = [title, detail].filter((region, index, items): region is NonNullable<typeof region> =>
    Boolean(region) && items.findIndex((item) => item?.id === region?.id) === index,
  );

  if (focusRegions.length === 0) {
    return {
      camera: sortKeyframes([fullFrameKeyframe(0, 'document-start'), fullFrameKeyframe(duration, 'document-end')], duration),
      overlays: sortOverlays(buildCaptionOverlays(request, {}), duration),
      warnings: ['DOCUMENT_LINE_SPOTLIGHT received no regions and fell back to a full-frame hold.'],
    };
  }

  const camera = [fullFrameKeyframe(0, 'document-overview')];
  const overlays: OverlayEvent[] = [];
  const regionTimes: Record<string, {time: number; duration: number}> = {};
  const openHold = Math.max(0.5, constraints.minHoldSeconds);
  const segmentSpan = Math.max(1.1, (duration - openHold) / focusRegions.length);

  camera.push(fullFrameKeyframe(openHold, 'document-establish'));

  focusRegions.forEach((region, index) => {
    const moveEnd = Math.min(duration, openHold + index * segmentSpan + 0.75);
    const holdEnd = Math.min(duration, moveEnd + Math.max(0.9, constraints.minHoldSeconds));
    const scale = regionScale(region, request, {paddingRatio: constraints.avoidCroppingText ? 1.65 : 1.3});
    const {cx, cy} = regionCenter(region, request);

    camera.push(regionKeyframe(moveEnd, region.id, scale, 'easeInOut', region.label ?? region.id));
    camera.push(pointKeyframe(holdEnd, cx, cy, scale, 'hold', `hold-${region.id}`));

    overlays.push({
      time: moveEnd,
      duration: Math.max(0.8, holdEnd - moveEnd),
      type: 'spotlight',
      regionId: region.id,
    });
    overlays.push({
      time: moveEnd,
      duration: Math.max(0.8, holdEnd - moveEnd),
      type: 'focus-box',
      regionId: region.id,
    });

    regionTimes[region.id] = {
      time: moveEnd,
      duration: Math.max(0.8, holdEnd - moveEnd),
    };
  });

  return {
    camera: sortKeyframes(camera, duration),
    overlays: sortOverlays([...overlays, ...buildCaptionOverlays(request, regionTimes)], duration),
  };
};
