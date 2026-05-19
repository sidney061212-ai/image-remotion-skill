import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {
  BackgroundBlurLayer,
  FloatingImageCard,
  SoftGradientOverlay,
  SweepHighlight,
  TemplateShell,
  TitleBlock,
  VignetteOverlay,
  getAssetSrc,
  getFitMode,
  getIntensityConfig,
  getPrimaryAsset,
  getProgress,
  safeSpring,
} from './common';

export const ProductHeroTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const progress = getProgress(frame, durationInFrames);
  const config = getIntensityConfig(plan.options?.intensity);
  const enter = safeSpring({frame, fps, delay: 8, damping: 23, stiffness: 88});
  const floatY = interpolate(progress, [0, 0.5, 1], [12, -12, 4]) * config.motionAmount;
  const cardScale = interpolate(enter, [0, 1], [0.88, 1]) * interpolate(progress, [0, 0.5, 1], [1, 1.025, 1.01]);
  const shadowScale = interpolate(progress, [0, 0.5, 1], [0.9, 1.08, 1]);

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#ffd57f" showDefaultText={false}>
      <BackgroundBlurLayer asset={asset} blurAmount={config.blurAmount} brightness={0.86} scale={1.22} vignette={false} />
      <SoftGradientOverlay variant="warm" opacity={1} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '154px 150px 218px'}}>
        <div
          style={{
            position: 'absolute',
            bottom: 180,
            left: '28%',
            right: '28%',
            height: 88,
            borderRadius: '50%',
            background: 'rgba(40, 54, 78, 0.22)',
            filter: 'blur(24px)',
            transform: `scale(${shadowScale})`,
          }}
        />
        <FloatingImageCard
          src={getAssetSrc(asset.path)}
          width="100%"
          height="100%"
          fit={getFitMode(plan, 'contain')}
          y={floatY}
          scale={cardScale}
          rotate={-0.6}
          borderRadius={38}
          shadowStrength={0.28}
          style={{
            background: 'rgba(255,255,255,0.78)',
          }}
        >
          <SweepHighlight color="#fff8de" opacity={0.34} />
        </FloatingImageCard>
      </AbsoluteFill>
      <VignetteOverlay strength={0.22} />
      <TitleBlock plan={plan} position="bottom-center" color="#17304b" accentColor="#ffd57f" delay={34} compact />
    </TemplateShell>
  );
};
