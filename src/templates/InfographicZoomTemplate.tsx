import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {
  FloatingImageCard,
  SoftGradientOverlay,
  TemplateShell,
  TitleBlock,
  VignetteOverlay,
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
  const focusScale = progress < 0.15 ? interpolate(progress, [0, 0.15], [0.96, 1.04]) : progress > 0.75 ? interpolate(progress, [0.75, 1], [1.05, 0.96]) : 1.22 + config.zoomAmount;
  const translateX = focusX * width * config.motionAmount;
  const translateY = focusY * height * config.motionAmount;
  const glowOpacity = interpolate(progress, [0.08, 0.18, 0.72, 0.84], [0, 0.72, 0.72, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleOpacity = interpolate(progress, [0.74, 0.86, 1], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#74e4ff" showDefaultText={false}>
      <SoftGradientOverlay variant="cool" opacity={0.8} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '118px 70px'}}>
        <FloatingImageCard
          src={getAssetSrc(asset.path)}
          width="100%"
          height="100%"
          fit="contain"
          borderRadius={34}
          shadowStrength={config.shadowStrength}
          imgStyle={{
            transform: `translate(${translateX}px, ${translateY}px) scale(${focusScale})`,
            transformOrigin: 'center',
          }}
          style={{
            background: 'rgba(255,255,255,0.9)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 20,
              borderRadius: 24,
              border: `3px solid rgba(116, 228, 255, ${glowOpacity})`,
              boxShadow: `0 0 34px rgba(116, 228, 255, ${glowOpacity * 0.55})`,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: `${isVertical ? [16, 45, 72][segmentIndex] : 18}%`,
              left: `${isVertical ? 7 : [7, 35, 63][segmentIndex]}%`,
              width: isVertical ? '86%' : '30%',
              height: isVertical ? '22%' : '68%',
              borderRadius: 22,
              border: `2px solid rgba(255,255,255,${glowOpacity * 0.78})`,
              background: `rgba(116, 228, 255, ${glowOpacity * 0.08})`,
              boxShadow: `inset 0 0 0 1px rgba(255,255,255,${glowOpacity * 0.22})`,
            }}
          />
        </FloatingImageCard>
      </AbsoluteFill>
      <div style={{opacity: titleOpacity}}>
        <TitleBlock plan={plan} position="bottom-left" accentColor="#74e4ff" color="#f7fbff" delay={0} maxWidth="72%" compact />
      </div>
      <VignetteOverlay strength={0.34} />
    </TemplateShell>
  );
};
