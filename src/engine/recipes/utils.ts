import type {AiMotionRequest, AiVisualRegion, CameraKeyframe, OverlayEvent} from '../../types';

export interface RecipeCompileResult {
  camera: CameraKeyframe[];
  overlays: OverlayEvent[];
  warnings?: string[];
}

export interface RegionScaleOptions {
  paddingRatio?: number;
  maxZoom?: number;
}

export interface DistributeTimesOptions {
  start?: number;
  end?: number;
}

export interface NormalizedConstraints {
  avoidCroppingText: boolean;
  avoidFastMotion: boolean;
  allowWhipPan: boolean;
  allowBlur: boolean;
  maxZoom: number;
  minHoldSeconds: number;
}

const TEXT_SAFE_ROLES = new Set([
  'title',
  'subtitle',
  'number',
  'step',
  'quote',
  'cta',
  'detail',
]);

export const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export const getOutputSize = (aspectRatio: '9:16' | '16:9' | '1:1'): {width: number; height: number} => {
  if (aspectRatio === '16:9') {
    return {width: 1920, height: 1080};
  }
  if (aspectRatio === '1:1') {
    return {width: 1080, height: 1080};
  }
  return {width: 1080, height: 1920};
};

export const getNormalizedConstraints = (request: AiMotionRequest): NormalizedConstraints => ({
  avoidCroppingText: request.constraints?.avoidCroppingText ?? true,
  avoidFastMotion: request.constraints?.avoidFastMotion ?? false,
  allowWhipPan: request.constraints?.allowWhipPan ?? true,
  allowBlur: request.constraints?.allowBlur ?? true,
  maxZoom: request.constraints?.maxZoom ?? 2.2,
  minHoldSeconds: request.constraints?.minHoldSeconds ?? 0.8,
});

export const regionCenter = (
  region: AiVisualRegion,
  request: AiMotionRequest,
): {cx: number; cy: number} => ({
  cx: clamp((region.x + region.w / 2) / request.asset.width, 0, 1),
  cy: clamp((region.y + region.h / 2) / request.asset.height, 0, 1),
});

export const regionScale = (
  region: AiVisualRegion,
  request: AiMotionRequest,
  options?: RegionScaleOptions,
): number => {
  const {width: outputWidth, height: outputHeight} = getOutputSize(request.task.aspectRatio);
  const baseScale = Math.min(outputWidth / request.asset.width, outputHeight / request.asset.height);
  const constraints = getNormalizedConstraints(request);
  const textSafePadding = constraints.avoidCroppingText && region.role && TEXT_SAFE_ROLES.has(region.role) ? 1.45 : 1.22;
  const paddingRatio = options?.paddingRatio ?? (constraints.avoidCroppingText ? textSafePadding : 1.1);
  const rawScale = Math.min(
    outputWidth / (Math.max(region.w, 1) * baseScale * paddingRatio),
    outputHeight / (Math.max(region.h, 1) * baseScale * paddingRatio),
  );

  return clamp(rawScale, 1, options?.maxZoom ?? constraints.maxZoom);
};

export const fullFrameKeyframe = (time: number, label = 'full'): CameraKeyframe => ({
  time,
  target: {type: 'full'},
  scale: 1,
  label,
});

export const regionKeyframe = (
  time: number,
  regionId: string,
  scale: number,
  easing: CameraKeyframe['easing'] = 'easeInOut',
  label?: string,
): CameraKeyframe => ({
  time,
  target: {type: 'region', regionId},
  scale,
  easing,
  label,
});

export const pointKeyframe = (
  time: number,
  cx: number,
  cy: number,
  scale: number,
  easing: CameraKeyframe['easing'] = 'hold',
  label?: string,
): CameraKeyframe => ({
  time,
  target: {type: 'point', cx: clamp(cx, 0, 1), cy: clamp(cy, 0, 1)},
  scale,
  easing,
  label,
});

export const distributeTimes = (
  durationSeconds: number,
  itemCount: number,
  options?: DistributeTimesOptions,
): number[] => {
  if (itemCount <= 0) {
    return [];
  }

  const start = options?.start ?? 0;
  const end = options?.end ?? durationSeconds;

  if (itemCount === 1) {
    return [clamp(start, 0, durationSeconds)];
  }

  const span = Math.max(0, end - start);
  const step = span / (itemCount - 1);
  return Array.from({length: itemCount}, (_, index) => clamp(start + step * index, 0, durationSeconds));
};

export const getOrderedRegions = (request: AiMotionRequest): AiVisualRegion[] => {
  const regionMap = new Map(request.visualStructure.regions.map((region) => [region.id, region]));
  const ordered = request.visualStructure.readingOrder
    .map((regionId) => regionMap.get(regionId))
    .filter((region): region is AiVisualRegion => Boolean(region));

  const remaining = request.visualStructure.regions
    .filter((region) => !request.visualStructure.readingOrder.includes(region.id))
    .sort((a, b) => {
      const orderA = a.order ?? Number.POSITIVE_INFINITY;
      const orderB = b.order ?? Number.POSITIVE_INFINITY;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return (b.importance ?? 0) - (a.importance ?? 0);
    });

  return [...ordered, ...remaining];
};

export const getRegionById = (
  request: Pick<AiMotionRequest, 'visualStructure'>,
  regionId: string | undefined,
): AiVisualRegion | undefined => {
  if (!regionId) {
    return undefined;
  }
  return request.visualStructure.regions.find((region) => region.id === regionId);
};

export const getPrimaryRegion = (request: AiMotionRequest): AiVisualRegion | undefined => {
  return (
    getRegionById(request, request.visualStructure.primaryRegionId) ??
    getOrderedRegions(request).find((region) => region.importance !== undefined && region.importance > 0) ??
    getOrderedRegions(request)[0]
  );
};

export const getFirstRegionByRole = (
  request: AiMotionRequest,
  roles: Array<AiVisualRegion['role']>,
): AiVisualRegion | undefined => {
  const ordered = getOrderedRegions(request);
  return ordered.find((region) => region.role && roles.includes(region.role));
};

export const getRegionsByRole = (
  request: AiMotionRequest,
  roles: Array<AiVisualRegion['role']>,
): AiVisualRegion[] => getOrderedRegions(request).filter((region) => region.role && roles.includes(region.role));

export const getRegionLabel = (region: AiVisualRegion, fallback: string): string => region.label?.trim() || fallback;

export const buildCaptionOverlays = (
  request: AiMotionRequest,
  regionTimes: Record<string, {time: number; duration: number}>,
): OverlayEvent[] => {
  const captions = request.script?.captions ?? [];

  return captions.map((caption, index) => {
    const attachedTiming = caption.attachToRegionId ? regionTimes[caption.attachToRegionId] : undefined;
    const start = caption.start ?? attachedTiming?.time ?? Math.min(request.task.durationSeconds - 1, 0.8 + index * 1.4);
    const end = caption.end ?? (
      attachedTiming
        ? attachedTiming.time + attachedTiming.duration
        : Math.min(request.task.durationSeconds, start + 1.8)
    );
    return {
      time: clamp(start, 0, request.task.durationSeconds),
      duration: Math.max(0.4, clamp(end, start + 0.4, request.task.durationSeconds) - start),
      type: 'caption',
      regionId: caption.attachToRegionId,
      text: caption.text,
    };
  });
};

export const sortKeyframes = (camera: CameraKeyframe[], durationSeconds: number): CameraKeyframe[] => {
  const sorted = [...camera]
    .map((keyframe) => ({
      ...keyframe,
      time: clamp(Number(keyframe.time.toFixed(3)), 0, durationSeconds),
      scale: Number(clamp(keyframe.scale, 1, Number.POSITIVE_INFINITY).toFixed(3)),
    }))
    .sort((a, b) => a.time - b.time);

  if (sorted.length === 0 || sorted[0].time > 0) {
    sorted.unshift(fullFrameKeyframe(0));
  }

  const last = sorted[sorted.length - 1];
  if (last.time < durationSeconds) {
    sorted.push({...last, time: Number(durationSeconds.toFixed(3)), easing: 'hold'});
  }

  return sorted;
};

export const sortOverlays = (overlays: OverlayEvent[], durationSeconds: number): OverlayEvent[] =>
  [...overlays]
    .map((overlay) => ({
      ...overlay,
      time: clamp(Number(overlay.time.toFixed(3)), 0, durationSeconds),
      duration: Number(clamp(overlay.duration, 0, durationSeconds).toFixed(3)),
    }))
    .filter((overlay) => overlay.duration > 0)
    .sort((a, b) => a.time - b.time);
