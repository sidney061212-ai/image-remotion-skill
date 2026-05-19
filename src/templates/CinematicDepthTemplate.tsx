import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {
  BackgroundBlurLayer,
  NaturalImageLayer,
  SoftGradientOverlay,
  TemplateShell,
  TitleBlock,
  VignetteOverlay,
  getAssetSrc,
  getFitMode,
  getIntensityConfig,
  getPrimaryAsset,
  getProgress,
} from './common';

export const CinematicDepthTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = getProgress(frame, durationInFrames);
  const config = getIntensityConfig(plan.options?.intensity);
  const fit = getFitMode(plan, 'cover');
  const foregroundScale = interpolate(progress, [0, 1], [1, 1.04 + config.zoomAmount * 0.2]);
  const foregroundX = interpolate(progress, [0, 1], [10 * config.motionAmount, -12 * config.motionAmount]);
  const foregroundY = interpolate(progress, [0, 1], [4 * config.motionAmount, -6 * config.motionAmount]);
  const backgroundX = interpolate(progress, [0, 1], [-18 * config.motionAmount, 18 * config.motionAmount]);

  return (
    <TemplateShell plan={{...plan, text: {...plan.text, captions: []}}} asset={asset} accentColor="#ffd08a" showDefaultText={false}>
      <BackgroundBlurLayer asset={asset} blurAmount={Math.max(24, config.blurAmount - 8)} scale={1.12} brightness={0.74} x={backgroundX} vignette={false} />
      <SoftGradientOverlay variant="warm" opacity={0.42} />
      <AbsoluteFill style={{overflow: 'hidden', padding: fit === 'contain' ? '42px' : 0}}>
        <NaturalImageLayer src={getAssetSrc(asset.path)} fit={fit} x={foregroundX} y={foregroundY} scale={foregroundScale} transformOrigin="center" />
      </AbsoluteFill>
      <VignetteOverlay strength={0.44} />
      <TitleBlock plan={plan} position="bottom-left" accentColor="#ffd08a" color="#fff8ee" delay={36} maxWidth="46%" compact />
    </TemplateShell>
  );
};
