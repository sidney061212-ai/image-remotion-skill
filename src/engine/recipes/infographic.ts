import type {AiMotionRequest, AiVisualRegion, OverlayEvent} from '../../types';
import {
  buildCaptionOverlays,
  distributeTimes,
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

const dedupeRegions = (regions: AiVisualRegion[]): AiVisualRegion[] => {
  const seen = new Set<string>();
  return regions.filter((region) => {
    if (seen.has(region.id)) {
      return false;
    }
    seen.add(region.id);
    return true;
  });
};

export const compileInfographicOverviewToKeypoints = (request: AiMotionRequest): RecipeCompileResult => {
  const duration = request.task.durationSeconds;
  const constraints = getNormalizedConstraints(request);
  const ordered = getOrderedRegions(request);
  const primary = getPrimaryRegion(request);
  const keyCandidates = dedupeRegions([
    ...ordered.filter((region) => region.role === 'title' || region.role === 'subtitle').slice(0, 1),
    ...ordered.filter((region) => region.role === 'number' || region.role === 'chart').slice(0, 2),
    ...(primary ? [primary] : []),
    ...ordered.filter((region) => region.role === 'cta' || region.role === 'detail').slice(0, 1),
  ]);
  const regions = (keyCandidates.length > 0 ? keyCandidates : ordered).slice(0, Math.max(1, Math.min(4, ordered.length)));

  if (regions.length === 0) {
    return {
      camera: sortKeyframes([fullFrameKeyframe(0, 'overview'), fullFrameKeyframe(duration, 'overview-end')], duration),
      overlays: [],
      warnings: ['INFOGRAPHIC_OVERVIEW_TO_KEYPOINTS received no regions, so the plan falls back to a full-frame hold.'],
    };
  }

  const openHold = Math.max(0.6, constraints.minHoldSeconds);
  const closeHold = Math.max(0.6, Math.min(duration * 0.12, 1.2));
  const segmentSpan = Math.max(0.9, (duration - openHold - closeHold) / regions.length);
  const regionTimes: Record<string, {time: number; duration: number}> = {};
  const camera = [fullFrameKeyframe(0, 'overview'), fullFrameKeyframe(openHold, 'establish')];
  const overlays: OverlayEvent[] = [];

  regions.forEach((region, index) => {
    const segmentStart = openHold + index * segmentSpan;
    const moveDuration = Math.max(constraints.avoidFastMotion ? 0.7 : 0.55, segmentSpan * 0.32);
    const arrival = Math.min(duration - closeHold, segmentStart + moveDuration);
    const holdEnd = Math.min(duration - closeHold, segmentStart + segmentSpan);
    const scale = regionScale(region, request);
    const {cx, cy} = regionCenter(region, request);

    camera.push(regionKeyframe(arrival, region.id, scale, 'easeInOut', getRegionLabel(region, `region-${index + 1}`)));
    camera.push(pointKeyframe(holdEnd, cx, cy, scale, 'hold', `hold-${region.id}`));

    overlays.push({
      time: arrival,
      duration: Math.max(0.5, holdEnd - arrival),
      type: region.role === 'number' ? 'number-pulse' : 'focus-box',
      regionId: region.id,
      text: region.role === 'number' ? region.label : undefined,
    });

    regionTimes[region.id] = {
      time: arrival,
      duration: Math.max(0.5, holdEnd - arrival),
    };
  });

  if (!primary || primary.id === regions[regions.length - 1]?.id) {
    camera.push(fullFrameKeyframe(duration, 'overview-return'));
  } else {
    const scale = regionScale(primary, request);
    const {cx, cy} = regionCenter(primary, request);
    const arriveAtConclusion = Math.max(duration - closeHold, openHold);
    camera.push(regionKeyframe(arriveAtConclusion, primary.id, scale, 'easeInOut', getRegionLabel(primary, 'primary')));
    camera.push(pointKeyframe(duration, cx, cy, scale, 'hold', `hold-${primary.id}`));
    overlays.push({
      time: arriveAtConclusion,
      duration: Math.max(0.4, duration - arriveAtConclusion),
      type: 'focus-box',
      regionId: primary.id,
    });
    regionTimes[primary.id] = {
      time: arriveAtConclusion,
      duration: Math.max(0.4, duration - arriveAtConclusion),
    };
  }

  return {
    camera: sortKeyframes(camera, duration),
    overlays: sortOverlays([...overlays, ...buildCaptionOverlays(request, regionTimes)], duration),
  };
};

export const compileInfographicStepScan = (request: AiMotionRequest): RecipeCompileResult => {
  const duration = request.task.durationSeconds;
  const constraints = getNormalizedConstraints(request);
  const ordered = [...getOrderedRegions(request)].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
      return a.order - b.order;
    }
    return a.y - b.y || a.x - b.x;
  });

  if (ordered.length === 0) {
    return {
      camera: sortKeyframes([fullFrameKeyframe(0, 'scan-start'), fullFrameKeyframe(duration, 'scan-end')], duration),
      overlays: [],
      warnings: ['INFOGRAPHIC_STEP_SCAN received no regions, so the plan falls back to a full-frame hold.'],
    };
  }

  const openHold = Math.max(0.5, constraints.minHoldSeconds);
  const available = Math.max(ordered.length * 0.8, duration - openHold);
  const segmentSpan = Math.max(0.95, available / ordered.length);
  const regionTimes: Record<string, {time: number; duration: number}> = {};
  const camera = [fullFrameKeyframe(0, 'scan-overview'), fullFrameKeyframe(openHold, 'scan-establish')];
  const overlays: OverlayEvent[] = [];

  ordered.forEach((region, index) => {
    const segmentStart = openHold + index * segmentSpan;
    const moveDuration = Math.max(0.65, constraints.avoidFastMotion ? 0.85 : 0.7);
    const arrival = Math.min(duration, segmentStart + moveDuration);
    const holdEnd = Math.min(duration, Math.max(arrival + Math.max(constraints.minHoldSeconds, 0.8), segmentStart + segmentSpan));
    const scale = regionScale(region, request, {paddingRatio: constraints.avoidCroppingText ? 1.5 : 1.2});
    const {cx, cy} = regionCenter(region, request);

    camera.push(regionKeyframe(arrival, region.id, scale, 'easeInOut', getRegionLabel(region, `scan-${index + 1}`)));
    camera.push(pointKeyframe(holdEnd, cx, cy, scale, 'hold', `hold-${region.id}`));

    overlays.push({
      time: arrival,
      duration: Math.max(0.8, holdEnd - arrival),
      type: 'focus-box',
      regionId: region.id,
    });
    overlays.push({
      time: arrival,
      duration: Math.max(0.8, holdEnd - arrival),
      type: 'scan-line',
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
