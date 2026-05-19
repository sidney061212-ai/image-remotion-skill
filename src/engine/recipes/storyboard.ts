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

const getStoryboardPanels = (request: AiMotionRequest): {panels: AiVisualRegion[]; warnings: string[]} => {
  const ordered = getOrderedRegions(request);
  const panelRegions = ordered.filter((region) => region.role === 'panel');

  if (panelRegions.length >= 2) {
    return {panels: panelRegions, warnings: []};
  }

  return {
    panels: ordered.slice(0, Math.max(2, ordered.length)),
    warnings: ['STORYBOARD_PANEL_* prefers multiple panel regions and fell back to readingOrder regions.'],
  };
};

const panelTransitionEasing = (
  previous: AiVisualRegion | undefined,
  current: AiVisualRegion,
  request: AiMotionRequest,
): 'easeInOut' | 'whip' => {
  const constraints = getNormalizedConstraints(request);
  if (!constraints.allowWhipPan || constraints.avoidFastMotion || !previous) {
    return 'easeInOut';
  }

  const prevCenter = regionCenter(previous, request);
  const currentCenter = regionCenter(current, request);
  const dx = currentCenter.cx - prevCenter.cx;
  const dy = currentCenter.cy - prevCenter.cy;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (current.motionHint === 'whip' || distance > 0.35) {
    return 'whip';
  }

  return 'easeInOut';
};

const compileStoryboard = (
  request: AiMotionRequest,
  mode: 'push' | 'hop',
): RecipeCompileResult => {
  const duration = request.task.durationSeconds;
  const constraints = getNormalizedConstraints(request);
  const {panels, warnings} = getStoryboardPanels(request);

  if (panels.length === 0) {
    return {
      camera: sortKeyframes([fullFrameKeyframe(0, 'storyboard-start'), fullFrameKeyframe(duration, 'storyboard-end')], duration),
      overlays: [],
      warnings: [...warnings, 'No panel candidates were available for storyboard animation.'],
    };
  }

  const openHold = mode === 'hop' ? 0.4 : Math.max(0.4, Math.min(0.8, constraints.minHoldSeconds));
  const closeHold = mode === 'hop' ? 0.5 : 0.7;
  const segmentSpan = Math.max(mode === 'hop' ? 0.8 : 1, (duration - openHold - closeHold) / panels.length);
  const camera = [fullFrameKeyframe(0, 'storyboard-overview'), fullFrameKeyframe(openHold, 'storyboard-establish')];
  const overlays: OverlayEvent[] = [];
  const regionTimes: Record<string, {time: number; duration: number}> = {};

  panels.forEach((panel, index) => {
    const segmentStart = openHold + index * segmentSpan;
    const moveDuration = Math.max(
      mode === 'hop' ? 0.28 : 0.45,
      constraints.avoidFastMotion ? 0.6 : mode === 'hop' ? 0.32 : 0.48,
    );
    const arrival = Math.min(duration - closeHold, segmentStart + moveDuration);
    const holdEnd = Math.min(duration - closeHold, segmentStart + segmentSpan);
    const scale = regionScale(panel, request, {paddingRatio: mode === 'hop' ? 1.12 : 1.2, maxZoom: 1.9});
    const {cx, cy} = regionCenter(panel, request);

    camera.push(
      regionKeyframe(
        arrival,
        panel.id,
        scale,
        panelTransitionEasing(index > 0 ? panels[index - 1] : undefined, panel, request),
        getRegionLabel(panel, `panel-${index + 1}`),
      ),
    );
    camera.push(pointKeyframe(holdEnd, cx, cy, scale, 'hold', `hold-${panel.id}`));

    overlays.push({
      time: arrival,
      duration: Math.max(0.35, holdEnd - arrival),
      type: 'focus-box',
      regionId: panel.id,
    });

    regionTimes[panel.id] = {
      time: arrival,
      duration: Math.max(0.35, holdEnd - arrival),
    };
  });

  camera.push(fullFrameKeyframe(duration, 'storyboard-pullout'));

  return {
    camera: sortKeyframes(camera, duration),
    overlays: sortOverlays([...overlays, ...buildCaptionOverlays(request, regionTimes)], duration),
    warnings,
  };
};

export const compileStoryboardPanelPush = (request: AiMotionRequest): RecipeCompileResult =>
  compileStoryboard(request, 'push');

export const compileStoryboardPanelHop = (request: AiMotionRequest): RecipeCompileResult =>
  compileStoryboard(request, 'hop');
