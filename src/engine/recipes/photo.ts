import type {AiMotionRequest} from '../../types';
import {
  fullFrameKeyframe,
  getPrimaryRegion,
  pointKeyframe,
  regionCenter,
  regionScale,
  sortKeyframes,
  type RecipeCompileResult,
} from './utils';

export const compilePhotoKenBurns = (request: AiMotionRequest): RecipeCompileResult => {
  const duration = request.task.durationSeconds;
  const primary = getPrimaryRegion(request);
  const targetPoint = primary ? regionCenter(primary, request) : {cx: 0.52, cy: 0.48};
  const pushScale = primary ? Math.min(regionScale(primary, request, {paddingRatio: 1.45, maxZoom: 1.45}), 1.45) : 1.14;
  const settleTime = Math.max(0.6, duration * 0.7);

  return {
    camera: sortKeyframes([
      fullFrameKeyframe(0, 'photo-open'),
      pointKeyframe(settleTime, targetPoint.cx, targetPoint.cy, pushScale, 'easeInOut', 'photo-push'),
      pointKeyframe(duration, targetPoint.cx, targetPoint.cy, Math.max(1.04, pushScale + 0.04), 'easeInOut', 'photo-close'),
    ], duration),
    overlays: [],
  };
};
