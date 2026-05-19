import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import type {AiVisualRegion, CameraKeyframe, MotionPlan, OverlayEvent} from '../types';

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const ease = (progress: number, easing: CameraKeyframe['easing'] | undefined): number => {
  const t = clamp(progress, 0, 1);
  switch (easing) {
    case 'hold':
      return t >= 1 ? 1 : 0;
    case 'easeInOut':
      return t * t * (3 - 2 * t);
    case 'spring': {
      const overshoot = 1.70158;
      const shifted = t - 1;
      return 1 + shifted * shifted * ((overshoot + 1) * shifted + overshoot);
    }
    case 'whip':
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    case 'linear':
    default:
      return t;
  }
};

const getRegionMap = (plan: MotionPlan): Map<string, AiVisualRegion> =>
  new Map(plan.visualStructure.regions.map((region) => [region.id, region]));

const resolveTargetPoint = (
  target: CameraKeyframe['target'],
  plan: MotionPlan,
  regionMap: Map<string, AiVisualRegion>,
): {cx: number; cy: number} => {
  if (target.type === 'full') {
    return {cx: 0.5, cy: 0.5};
  }

  if (target.type === 'point') {
    return {cx: clamp(target.cx, 0, 1), cy: clamp(target.cy, 0, 1)};
  }

  const region = regionMap.get(target.regionId);
  if (!region) {
    return {cx: 0.5, cy: 0.5};
  }

  return {
    cx: clamp((region.x + region.w / 2) / plan.imageWidth, 0, 1),
    cy: clamp((region.y + region.h / 2) / plan.imageHeight, 0, 1),
  };
};

const getSegmentIndex = (time: number, camera: MotionPlan['camera']): number => {
  for (let index = 1; index < camera.length; index += 1) {
    if (time <= camera[index].time) {
      return index;
    }
  }
  return camera.length - 1;
};

const interpolateCamera = (
  time: number,
  plan: MotionPlan,
  regionMap: Map<string, AiVisualRegion>,
): {cx: number; cy: number; scale: number; easing?: CameraKeyframe['easing']} => {
  const camera = plan.camera;
  if (camera.length === 0) {
    return {cx: 0.5, cy: 0.5, scale: 1};
  }

  if (camera.length === 1 || time <= camera[0].time) {
    const point = resolveTargetPoint(camera[0].target, plan, regionMap);
    return {...point, scale: camera[0].scale, easing: camera[0].easing};
  }

  const segmentIndex = getSegmentIndex(time, camera);
  const next = camera[segmentIndex];
  const previous = camera[Math.max(0, segmentIndex - 1)];
  const previousPoint = resolveTargetPoint(previous.target, plan, regionMap);
  const nextPoint = resolveTargetPoint(next.target, plan, regionMap);

  if (!next || !previous || next.time === previous.time) {
    return {...nextPoint, scale: next?.scale ?? previous.scale, easing: next?.easing};
  }

  const progress = clamp((time - previous.time) / (next.time - previous.time), 0, 1);
  const eased = ease(progress, next.easing);

  return {
    cx: previousPoint.cx + (nextPoint.cx - previousPoint.cx) * eased,
    cy: previousPoint.cy + (nextPoint.cy - previousPoint.cy) * eased,
    scale: previous.scale + (next.scale - previous.scale) * eased,
    easing: next.easing,
  };
};

const getVelocity = (
  frame: number,
  plan: MotionPlan,
  regionMap: Map<string, AiVisualRegion>,
): number => {
  const delta = 2;
  const fps = plan.fps;
  const before = interpolateCamera(Math.max(0, frame - delta) / fps, plan, regionMap);
  const after = interpolateCamera((frame + delta) / fps, plan, regionMap);
  const dx = (after.cx - before.cx) * plan.imageWidth;
  const dy = (after.cy - before.cy) * plan.imageHeight;
  return Math.sqrt(dx * dx + dy * dy) / (delta * 2);
};

const getImageSrc = (image: string): string => {
  if (image.startsWith('/') || image.startsWith('file:') || image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  return staticFile(image);
};

const overlayProgress = (event: OverlayEvent, time: number): number =>
  clamp((time - event.time) / Math.max(event.duration, 0.001), 0, 1);

const getRegionScreenRect = (
  regionId: string | undefined,
  regionMap: Map<string, AiVisualRegion>,
  tx: number,
  ty: number,
  actualScale: number,
): {left: number; top: number; width: number; height: number} | null => {
  if (!regionId) {
    return null;
  }
  const region = regionMap.get(regionId);
  if (!region) {
    return null;
  }

  return {
    left: tx + region.x * actualScale,
    top: ty + region.y * actualScale,
    width: region.w * actualScale,
    height: region.h * actualScale,
  };
};

const mergeStyle = (base: React.CSSProperties, extra?: Record<string, unknown>): React.CSSProperties => ({
  ...base,
  ...(extra as React.CSSProperties | undefined),
});

const renderOverlay = (
  event: OverlayEvent,
  plan: MotionPlan,
  regionMap: Map<string, AiVisualRegion>,
  time: number,
  tx: number,
  ty: number,
  actualScale: number,
): React.ReactNode => {
  const progress = overlayProgress(event, time);
  const rect = getRegionScreenRect(event.regionId, regionMap, tx, ty, actualScale);
  const fadeIn = clamp(progress / 0.2, 0, 1);
  const fadeOut = clamp((1 - progress) / 0.2, 0, 1);
  const opacity = Math.min(fadeIn, fadeOut);
  const style = event.style;

  if (event.type === 'focus-box' && rect) {
    return (
      <div
        key={`${event.type}-${event.time}-${event.regionId}`}
        style={mergeStyle({
          position: 'absolute',
          left: rect.left - 12,
          top: rect.top - 12,
          width: rect.width + 24,
          height: rect.height + 24,
          border: '4px solid rgba(255, 224, 102, 0.95)',
          borderRadius: 24,
          boxShadow: '0 0 0 2px rgba(0,0,0,0.3), 0 0 40px rgba(255, 224, 102, 0.28)',
          opacity,
        }, style)}
      />
    );
  }

  if (event.type === 'spotlight' && rect) {
    return (
      <div
        key={`${event.type}-${event.time}-${event.regionId}`}
        style={mergeStyle({
          position: 'absolute',
          left: rect.left - 16,
          top: rect.top - 16,
          width: rect.width + 32,
          height: rect.height + 32,
          borderRadius: 28,
          boxShadow: '0 0 0 9999px rgba(3, 6, 18, 0.55)',
          border: '2px solid rgba(255,255,255,0.2)',
          opacity: opacity * 0.95,
        }, style)}
      />
    );
  }

  if (event.type === 'caption' && event.text) {
    const captionWidth = Math.min(plan.outputWidth * 0.8, 860);
    const left = rect ? clamp(rect.left, 48, plan.outputWidth - captionWidth - 48) : 56;
    const top = rect ? clamp(rect.top + rect.height + 24, 56, plan.outputHeight - 220) : plan.outputHeight - 220;
    return (
      <div
        key={`${event.type}-${event.time}-${event.text}`}
        style={mergeStyle({
          position: 'absolute',
          left,
          top,
          maxWidth: captionWidth,
          padding: '20px 24px',
          borderRadius: 22,
          background: 'rgba(5, 8, 20, 0.72)',
          color: '#fff',
          fontSize: Math.max(30, plan.outputWidth * 0.026),
          lineHeight: 1.35,
          fontWeight: 600,
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          opacity,
        }, style)}
      >
        {event.text}
      </div>
    );
  }

  if (event.type === 'number-pulse' && rect) {
    return (
      <div
        key={`${event.type}-${event.time}-${event.regionId}`}
        style={mergeStyle({
          position: 'absolute',
          left: rect.left - 10,
          top: rect.top - 10,
          width: 64,
          height: 64,
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 196, 72, 0.95)',
          color: '#111',
          fontSize: 28,
          fontWeight: 800,
          transform: `scale(${1 + Math.sin(progress * Math.PI) * 0.18})`,
          opacity,
          boxShadow: '0 0 30px rgba(255, 196, 72, 0.4)',
        }, style)}
      >
        {event.text ?? ''}
      </div>
    );
  }

  if (event.type === 'label' && event.text) {
    const left = rect ? clamp(rect.left, 40, plan.outputWidth - 360) : 48;
    const top = rect ? clamp(rect.top - 82, 40, plan.outputHeight - 100) : 48;
    return (
      <div
        key={`${event.type}-${event.time}-${event.text}`}
        style={mergeStyle({
          position: 'absolute',
          left,
          top,
          padding: '14px 18px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.92)',
          color: '#111827',
          fontSize: Math.max(24, plan.outputWidth * 0.02),
          fontWeight: 700,
          letterSpacing: 0.3,
          opacity,
        }, style)}
      >
        {event.text}
      </div>
    );
  }

  if (event.type === 'wipe-line') {
    const x = plan.outputWidth * progress;
    return (
      <div
        key={`${event.type}-${event.time}`}
        style={mergeStyle({
          position: 'absolute',
          left: x,
          top: 0,
          width: 6,
          height: plan.outputHeight,
          background: 'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.95), rgba(255,255,255,0))',
          boxShadow: '0 0 28px rgba(255,255,255,0.4)',
          opacity,
        }, style)}
      />
    );
  }

  if (event.type === 'scan-line') {
    const baseRect = rect ?? {left: 0, top: 0, width: plan.outputWidth, height: plan.outputHeight};
    const y = baseRect.top + baseRect.height * progress;
    return (
      <div
        key={`${event.type}-${event.time}-${event.regionId ?? 'full'}`}
        style={mergeStyle({
          position: 'absolute',
          left: baseRect.left,
          top: y,
          width: baseRect.width,
          height: 4,
          background: 'linear-gradient(90deg, rgba(102, 212, 255, 0), rgba(102, 212, 255, 0.95), rgba(102, 212, 255, 0))',
          boxShadow: '0 0 28px rgba(102, 212, 255, 0.45)',
          opacity,
        }, style)}
      />
    );
  }

  return null;
};

export const MotionPlanRenderer: React.FC<{
  plan: MotionPlan;
  allowBlur?: boolean;
  allowWhipPan?: boolean;
}> = ({plan, allowBlur = true, allowWhipPan = true}) => {
  const frame = useCurrentFrame();
  const time = frame / plan.fps;
  const regionMap = React.useMemo(() => getRegionMap(plan), [plan]);
  const cameraState = interpolateCamera(time, plan, regionMap);
  const containScale = Math.min(plan.outputWidth / plan.imageWidth, plan.outputHeight / plan.imageHeight);
  const actualScale = containScale * cameraState.scale;
  const imgW = plan.imageWidth * actualScale;
  const imgH = plan.imageHeight * actualScale;
  const tx = plan.outputWidth / 2 - cameraState.cx * imgW;
  const ty = plan.outputHeight / 2 - cameraState.cy * imgH;
  const velocity = getVelocity(frame, plan, regionMap);
  const blurEnabled = allowBlur && (plan.renderOptions?.allowBlur ?? true);
  const whipEnabled = allowWhipPan && (plan.renderOptions?.allowWhipPan ?? true);
  const segmentCanBlur = blurEnabled && whipEnabled && cameraState.easing === 'whip';
  const blurAmount = segmentCanBlur ? clamp((velocity - 8) * 1.5, 0, 36) : 0;
  const src = getImageSrc(plan.image);

  return (
    <AbsoluteFill style={{backgroundColor: '#020617', overflow: 'hidden'}}>
      <Img
        src={src}
        style={{
          position: 'absolute',
          left: tx,
          top: ty,
          width: imgW,
          height: imgH,
          objectFit: 'fill',
          filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
        }}
      />
      {blurAmount > 0 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `rgba(0,0,0,${Math.min(0.3, blurAmount / 90)})`,
            pointerEvents: 'none',
          }}
        />
      ) : null}
      {plan.overlays
        .filter((event) => time >= event.time && time <= event.time + event.duration)
        .map((event) => renderOverlay(event, plan, regionMap, time, tx, ty, actualScale))}
    </AbsoluteFill>
  );
};
