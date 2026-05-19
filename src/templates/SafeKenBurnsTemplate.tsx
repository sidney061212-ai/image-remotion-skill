import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {
  BackgroundBlurLayer,
  NaturalImageLayer,
  SoftGradientOverlay,
  TemplateShell,
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
  const scale = interpolate(progress, [0, 1], [1, 1.035 + config.zoomAmount * 0.08]);
  const translateX = interpolate(progress, [0, 1], [8 * config.motionAmount, -8 * config.motionAmount]);
  const translateY = interpolate(progress, [0, 1], [5 * config.motionAmount, -7 * config.motionAmount]);

  return (
    <TemplateShell plan={{...plan, text: {...plan.text, captions: []}}} asset={asset} accentColor="#c7d5ff" showDefaultText={false}>
      <BackgroundBlurLayer asset={asset} blurAmount={Math.max(22, config.blurAmount - 10)} brightness={0.82} scale={1.12} opacity={0.72} vignette={false} />
      <SoftGradientOverlay variant="cool" opacity={0.28} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '38px 34px'}}>
        <NaturalImageLayer
          src={getAssetSrc(asset.path)}
          fit={getFitMode(plan, 'contain')}
          x={translateX}
          y={translateY}
          scale={scale}
          transformOrigin="center"
        />
      </AbsoluteFill>
      <VignetteOverlay strength={0.28} />
      {(plan.text?.title || plan.text?.subtitle) && (
        <div
          style={{
            position: 'absolute',
            left: 42,
            bottom: 34,
            maxWidth: '46%',
            color: 'rgba(248, 251, 255, 0.86)',
            textShadow: '0 6px 22px rgba(0,0,0,0.28)',
            pointerEvents: 'none',
          }}
        >
          {plan.text?.title && <div style={{fontSize: 24, lineHeight: 1.12, fontWeight: 750}}>{plan.text.title}</div>}
          {plan.text?.subtitle && <div style={{marginTop: 6, fontSize: 15, lineHeight: 1.28, opacity: 0.76}}>{plan.text.subtitle}</div>}
        </div>
      )}
    </TemplateShell>
  );
};
