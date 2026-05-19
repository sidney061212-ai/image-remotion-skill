import type {AiMotionRequest, OverlayEvent} from '../../types';
import {
  buildCaptionOverlays,
  fullFrameKeyframe,
  getNormalizedConstraints,
  getOrderedRegions,
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

export const compileScreenshotTopToBottomScan = (request: AiMotionRequest): RecipeCompileResult => {
  const duration = request.task.durationSeconds;
  const constraints = getNormalizedConstraints(request);
  const ordered = [...getOrderedRegions(request)].sort((a, b) => a.y - b.y || a.x - b.x);
  const primary = getPrimaryRegion(request);

  if (ordered.length === 0 && !primary) {
    return {
      camera: sortKeyframes([fullFrameKeyframe(0, 'screenshot-start'), fullFrameKeyframe(duration, 'screenshot-end')], duration),
      overlays: [],
      warnings: ['SCREENSHOT_TOP_TO_BOTTOM_SCAN received no regions, so the plan falls back to a full-frame hold.'],
    };
  }

  const scanRegions = primary
    ? [...ordered.filter((region) => region.id !== primary.id), primary]
    : ordered;
  const openHold = Math.max(0.45, Math.min(constraints.minHoldSeconds, 0.8));
  const closeHold = primary ? 0.5 : 0.3;
  const segmentSpan = Math.max(0.9, (duration - openHold - closeHold) / Math.max(scanRegions.length, 1));
  const camera = [fullFrameKeyframe(0, 'screenshot-overview'), fullFrameKeyframe(openHold, 'screenshot-establish')];
  const overlays: OverlayEvent[] = [];
  const regionTimes: Record<string, {time: number; duration: number}> = {};

  scanRegions.forEach((region, index) => {
    const segmentStart = openHold + index * segmentSpan;
    const moveDuration = constraints.avoidFastMotion ? 0.8 : 0.62;
    const arrival = Math.min(duration, segmentStart + moveDuration);
    const holdEnd = Math.min(duration, Math.max(arrival + Math.max(0.8, constraints.minHoldSeconds), segmentStart + segmentSpan));
    const scale = regionScale(region, request, {paddingRatio: constraints.avoidCroppingText ? 1.55 : 1.25});
    const {cx, cy} = regionCenter(region, request);

    camera.push(
      regionKeyframe(
        arrival,
        region.id,
        scale,
        constraints.avoidFastMotion ? 'easeInOut' : (constraints.allowWhipPan && region.motionHint === 'whip' ? 'whip' : 'easeInOut'),
        getRegionLabel(region, `scan-${index + 1}`),
      ),
    );
    camera.push(pointKeyframe(holdEnd, cx, cy, scale, 'hold', `hold-${region.id}`));

    overlays.push({
      time: arrival,
      duration: Math.max(0.8, holdEnd - arrival),
      type: 'scan-line',
      regionId: region.id,
    });
    overlays.push({
      time: arrival,
      duration: Math.max(0.8, holdEnd - arrival),
      type: 'spotlight',
      regionId: region.id,
    });

    regionTimes[region.id] = {
      time: arrival,
      duration: Math.max(0.8, holdEnd - arrival),
    };
  });

  return {
    camera: sortKeyframes(camera, duration),
    overlays: sortOverlays([...overlays, ...buildCaptionOverlays(request, regionTimes)], duration),
  };
};
