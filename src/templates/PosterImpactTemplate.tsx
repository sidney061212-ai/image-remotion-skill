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

export const PosterImpactTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = getProgress(frame, durationInFrames);
  const config = getIntensityConfig(plan.options?.intensity);
  const punchScale = interpolate(progress, [0, 0.1, 0.34, 1], [0.82, 1.08, 1.02, 1.04 + config.zoomAmount * 0.4]);
  const rotate = interpolate(progress, [0, 0.1, 1], [-2.2, 0, 0.3]);
  const glowOpacity = interpolate(progress, [0, 0.12, 1], [0.15, 0.42, 0.28]);

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#ffa96f" showDefaultText={false}>
      <BackgroundBlurLayer asset={asset} blurAmount={config.blurAmount} brightness={0.62} scale={1.2} vignette={false} />
      <SoftGradientOverlay variant="warm" opacity={0.9} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '102px 128px 134px'}}>
        <div
          style={{
            position: 'absolute',
            width: '74%',
            height: '70%',
            borderRadius: '50%',
            background: `rgba(255, 176, 100, ${glowOpacity})`,
            filter: 'blur(54px)',
          }}
        />
        <FloatingImageCard
          src={getAssetSrc(asset.path)}
          width="76%"
          height="100%"
          fit={getFitMode(plan, 'cover')}
          rotate={rotate}
          scale={punchScale}
          borderRadius={30}
          shadowStrength={0.34}
        />
      </AbsoluteFill>
      <VignetteOverlay strength={0.6} />
      <TitleBlock plan={plan} position="bottom-left" color="#fff7ef" accentColor="#ffa96f" delay={18} maxWidth="54%" compact />
    </TemplateShell>
  );
};
