import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
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

export const CinematicDepthTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = getProgress(frame, durationInFrames);
  const config = getIntensityConfig(plan.options?.intensity);
  const foregroundScale = interpolate(progress, [0, 1], [1, 1 + config.zoomAmount * 0.8]);
  const foregroundX = interpolate(progress, [0, 1], [24 * config.motionAmount, -28 * config.motionAmount]);
  const backgroundX = interpolate(progress, [0, 1], [-38 * config.motionAmount, 34 * config.motionAmount]);
  const floatY = interpolate(progress, [0, 0.5, 1], [8, -6, 0]);

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#ffd08a" showDefaultText={false}>
      <BackgroundBlurLayer
        asset={asset}
        blurAmount={config.blurAmount}
        scale={1.18}
        brightness={0.68}
        x={backgroundX}
        vignette={false}
      />
      <SoftGradientOverlay variant="warm" opacity={0.95} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '126px 96px'}}>
        <FloatingImageCard
          src={getAssetSrc(asset.path)}
          width="100%"
          height="100%"
          fit={getFitMode(plan, 'cover')}
          x={foregroundX}
          y={floatY}
          scale={foregroundScale}
          rotate={-0.4}
          borderRadius={28}
          shadowStrength={config.shadowStrength + 0.12}
          style={{
            border: '1px solid rgba(255,255,255,0.38)',
          }}
        >
          <Img
            src={getAssetSrc(asset.path)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: getFitMode(plan, 'cover'),
              opacity: 0.08,
              mixBlendMode: 'screen',
            }}
          />
        </FloatingImageCard>
      </AbsoluteFill>
      <VignetteOverlay strength={0.62} />
      <TitleBlock plan={plan} position="bottom-left" accentColor="#ffd08a" color="#fff8ee" delay={28} maxWidth="58%" />
    </TemplateShell>
  );
};
