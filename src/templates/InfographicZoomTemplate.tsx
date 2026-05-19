import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {
  DebugFrameOverlay,
  NaturalImageLayer,
  SoftGradientOverlay,
  TemplateShell,
  TitleBlock,
  clamp,
  getAssetSrc,
  getIntensityConfig,
  getPrimaryAsset,
  getProgress,
} from './common';

const lerp = (from: number, to: number, progress: number): number => from + (to - from) * progress;
const smooth = (value: number): number => value * value * (3 - 2 * value);

export const InfographicZoomTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  const progress = getProgress(frame, durationInFrames);
  const config = getIntensityConfig(plan.options?.intensity);
  const isVertical = (asset.height ?? plan.outputHeight) >= (asset.width ?? plan.outputWidth);

  const segmentProgress = clamp((progress - 0.15) / 0.6, 0, 1);
  const segmentFloat = segmentProgress * 3;
  const segmentIndex = Math.min(2, Math.floor(segmentFloat));
  const local = smooth(clamp(segmentFloat - segmentIndex, 0, 1));
  const centers = isVertical
    ? [
        {x: 0, y: 0.23},
        {x: 0, y: 0},
        {x: 0, y: -0.23},
      ]
    : [
        {x: 0.2, y: 0},
        {x: 0, y: 0},
        {x: -0.2, y: 0},
      ];
  const current = centers[segmentIndex];
  const next = centers[Math.min(2, segmentIndex + 1)];
  const focusX = progress < 0.15 || progress > 0.75 ? 0 : lerp(current.x, next.x, local);
  const focusY = progress < 0.15 || progress > 0.75 ? 0 : lerp(current.y, next.y, local);
  const focusScale =
    progress < 0.15
      ? interpolate(progress, [0, 0.15], [0.985, 1.015])
      : progress > 0.75
        ? interpolate(progress, [0.75, 1], [1.12, 0.99])
        : 1.12 + config.zoomAmount * 0.35;
  const translateX = focusX * width * 0.68 * config.motionAmount;
  const translateY = focusY * height * 0.68 * config.motionAmount;
  const spotlightOpacity = interpolate(progress, [0.12, 0.22, 0.72, 0.84], [0, 0.16, 0.16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleOpacity = interpolate(progress, [0.8, 0.9, 1], [0, 0.82, 0.82], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const debugFrameStyle: React.CSSProperties = {
    top: `${isVertical ? [16, 45, 72][segmentIndex] : 18}%`,
    left: `${isVertical ? 7 : [7, 35, 63][segmentIndex]}%`,
    width: isVertical ? '86%' : '30%',
    height: isVertical ? '22%' : '68%',
  };

  return (
    <TemplateShell plan={{...plan, text: {...plan.text, captions: []}}} accentColor="#74e4ff" showDefaultText={false}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #f7fbff 0%, #eef6ff 100%)'}} />
      <SoftGradientOverlay variant="cool" opacity={0.22} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '34px 26px'}}>
        <div style={{position: 'relative', width: '100%', height: '100%'}}>
          <NaturalImageLayer
            src={getAssetSrc(asset.path)}
            fit="contain"
            x={translateX}
            y={translateY}
            scale={focusScale}
            transformOrigin="center"
          />
          <DebugFrameOverlay plan={plan} style={debugFrameStyle} label={`segment ${segmentIndex + 1}`} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          opacity: spotlightOpacity,
          background: `radial-gradient(circle at ${50 + focusX * 34}% ${50 + focusY * 34}%, transparent 0%, transparent 36%, rgba(12, 26, 44, 0.2) 100%)`,
        }}
      />
      <div style={{opacity: titleOpacity}}>
        <TitleBlock plan={plan} position="bottom-left" accentColor="#74e4ff" color="#214264" delay={0} maxWidth="50%" compact />
      </div>
    </TemplateShell>
  );
};
