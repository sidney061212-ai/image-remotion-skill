import type {AiMotionRequest, AiVisualRegion, OverlayEvent} from '../../types';
import {
  buildCaptionOverlays,
  fullFrameKeyframe,
  getNormalizedConstraints,
  getOrderedRegions,
  getRegionLabel,
  pointKeyframe,
  regionCenter,
  regionKeyframe,
  regionScale,
  sortKeyframes,
  sortOverlays,
  type RecipeCompileResult,
} from './utils';

const findComparisonSides = (request: AiMotionRequest): {left?: AiVisualRegion; right?: AiVisualRegion; warnings: string[]} => {
  const ordered = getOrderedRegions(request);
  const left = ordered.find((region) => region.role === 'comparison-left');
  const right = ordered.find((region) => region.role === 'comparison-right');

  if (left && right) {
    return {left, right, warnings: []};
  }

  const fallback = ordered.slice(0, 2);
  return {
    left: left ?? fallback[0],
    right: right ?? fallback[1],
    warnings: ['COMPARISON_LEFT_RIGHT_REVEAL expected comparison-left and comparison-right regions, so it fell back to the first two readingOrder regions.'],
  };
};

export const compileComparisonLeftRightReveal = (request: AiMotionRequest): RecipeCompileResult => {
  const duration = request.task.durationSeconds;
  const constraints = getNormalizedConstraints(request);
  const {left, right, warnings} = findComparisonSides(request);

  if (!left || !right) {
    return {
      camera: sortKeyframes([fullFrameKeyframe(0, 'comparison-start'), fullFrameKeyframe(duration, 'comparison-end')], duration),
      overlays: [],
      warnings: [...warnings, 'Comparison animation needs at least two candidate regions.'],
    };
  }

  const leftScale = regionScale(left, request, {paddingRatio: 1.18});
  const rightScale = regionScale(right, request, {paddingRatio: 1.18});
  const leftCenter = regionCenter(left, request);
  const rightCenter = regionCenter(right, request);
  const leftMoveEnd = Math.max(0.45, duration * 0.2);
  const leftHoldEnd = Math.max(leftMoveEnd + Math.max(constraints.minHoldSeconds, 0.9), duration * 0.45);
  const rightMoveEnd = Math.max(leftHoldEnd + (constraints.allowWhipPan && !constraints.avoidFastMotion ? 0.35 : 0.7), duration * 0.62);
  const rightHoldEnd = Math.max(rightMoveEnd + Math.max(constraints.minHoldSeconds, 0.9), duration * 0.82);
  const regionTimes = {
    [left.id]: {time: leftMoveEnd, duration: Math.max(0.9, leftHoldEnd - leftMoveEnd)},
    [right.id]: {time: rightMoveEnd, duration: Math.max(0.9, rightHoldEnd - rightMoveEnd)},
  };
  const overlays: OverlayEvent[] = [
    {
      time: leftMoveEnd,
      duration: Math.max(0.9, leftHoldEnd - leftMoveEnd),
      type: 'label',
      regionId: left.id,
      text: getRegionLabel(left, 'Left'),
    },
    {
      time: rightMoveEnd,
      duration: Math.max(0.9, rightHoldEnd - rightMoveEnd),
      type: 'label',
      regionId: right.id,
      text: getRegionLabel(right, 'Right'),
    },
    {
      time: leftHoldEnd,
      duration: Math.max(0.3, rightMoveEnd - leftHoldEnd),
      type: 'wipe-line',
      text: 'compare',
    },
  ];

  return {
    camera: sortKeyframes([
      regionKeyframe(0, left.id, leftScale, 'easeInOut', getRegionLabel(left, 'left')),
      pointKeyframe(leftHoldEnd, leftCenter.cx, leftCenter.cy, leftScale, 'hold', `hold-${left.id}`),
      regionKeyframe(
        rightMoveEnd,
        right.id,
        rightScale,
        constraints.allowWhipPan && !constraints.avoidFastMotion ? 'whip' : 'easeInOut',
        getRegionLabel(right, 'right'),
      ),
      pointKeyframe(rightHoldEnd, rightCenter.cx, rightCenter.cy, rightScale, 'hold', `hold-${right.id}`),
      fullFrameKeyframe(duration, 'comparison-full'),
    ], duration),
    overlays: sortOverlays([...overlays, ...buildCaptionOverlays(request, regionTimes)], duration),
    warnings,
  };
};
