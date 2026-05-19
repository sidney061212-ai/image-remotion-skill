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
  safeSpring,
} from './common';

export const PortraitFocusTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const config = getIntensityConfig(plan.options?.intensity);
  const progress = getProgress(frame, durationInFrames);
  const enter = safeSpring({frame, fps, delay: 8, damping: 25, stiffness: 82});
  const scale = interpolate(progress, [0, 1], [1, 1 + config.zoomAmount * 0.62]);
  const translateY = interpolate(progress, [0, 1], [10 * config.motionAmount, -14 * config.motionAmount]);
  const enterScale = interpolate(enter, [0, 1], [0.94, 1]);
  const glowPulse = interpolate(progress, [0, 0.5, 1], [0.22, 0.34, 0.26]);

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#d2a4ff" showDefaultText={false}>
      <BackgroundBlurLayer asset={asset} blurAmount={config.blurAmount} brightness={0.76} scale={1.2} vignette={false} />
      <SoftGradientOverlay variant="cool" opacity={0.85} />
      <AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            inset: '15% 18% 13%',
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,255,255,${glowPulse}), rgba(210,164,255,0.18) 42%, transparent 72%)`,
            filter: 'blur(24px)',
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '120px 116px 154px'}}>
        <FloatingImageCard
          src={getAssetSrc(asset.path)}
          width="72%"
          height="100%"
          fit={getFitMode(plan, 'contain')}
          y={translateY}
          scale={scale * enterScale}
          borderRadius={38}
          shadowStrength={config.shadowStrength + 0.08}
          style={{
            background: 'rgba(255,255,255,0.68)',
          }}
        />
      </AbsoluteFill>
      <VignetteOverlay strength={0.36} />
      <TitleBlock plan={plan} position="bottom-left" color="#fbf8ff" accentColor="#d2a4ff" delay={34} maxWidth="54%" compact />
    </TemplateShell>
  );
};
