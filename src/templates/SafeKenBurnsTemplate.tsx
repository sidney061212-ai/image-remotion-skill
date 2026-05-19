import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {
  BackgroundBlurLayer,
  FloatingImageCard,
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

export const SafeKenBurnsTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = getProgress(frame, durationInFrames);
  const config = getIntensityConfig(plan.options?.intensity);
  const scale = interpolate(progress, [0, 1], [1, 1 + config.zoomAmount]);
  const translateX = interpolate(progress, [0, 1], [18 * config.motionAmount, -14 * config.motionAmount]);
  const translateY = interpolate(progress, [0, 1], [10 * config.motionAmount, -12 * config.motionAmount]);

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#c7d5ff" showDefaultText={false}>
      <BackgroundBlurLayer asset={asset} blurAmount={config.blurAmount} brightness={0.78} scale={1.18} />
      <SoftGradientOverlay variant="cool" opacity={0.85} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '112px 78px 132px'}}>
        <FloatingImageCard
          src={getAssetSrc(asset.path)}
          width="100%"
          height="100%"
          fit={getFitMode(plan, 'contain')}
          x={translateX}
          y={translateY}
          scale={scale}
          borderRadius={32}
          shadowStrength={0.28}
          style={{
            background: 'rgba(255,255,255,0.74)',
          }}
        />
      </AbsoluteFill>
      <VignetteOverlay strength={0.42} />
      <TitleBlock plan={plan} position="bottom-left" color="#f8fbff" accentColor="#c7d5ff" delay={30} maxWidth="58%" compact />
    </TemplateShell>
  );
};
