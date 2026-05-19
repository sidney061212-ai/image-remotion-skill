import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {FloatingCard, TemplateShell, getAssetSrc, getFitMode, getIntensityMultiplier, getPrimaryAsset, getProgress} from './common';

export const CinematicDepthTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const intensity = getIntensityMultiplier(plan.options?.intensity);
  const progress = getProgress(frame, durationInFrames);
  const scale = interpolate(progress, [0, 1], [1, 1.05 + (intensity - 1) * 0.03]);
  const translateX = interpolate(progress, [0, 0.5, 1], [24 * intensity, -16 * intensity, -28 * intensity]);
  const translateY = interpolate(progress, [0, 1], [14 * intensity, -10 * intensity]);
  const backgroundShift = interpolate(progress, [0, 1], [-26 * intensity, 18 * intensity]);

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#ffca8a">
      <AbsoluteFill>
        <Img
          src={getAssetSrc(asset.path)}
          style={{
            position: 'absolute',
            inset: -40,
            width: 'calc(100% + 80px)',
            height: 'calc(100% + 80px)',
            objectFit: 'cover',
            opacity: 0.3,
            filter: 'blur(30px) saturate(1.06)',
            transform: `translateX(${backgroundShift}px) scale(1.15)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 72% 18%, rgba(255, 214, 153, 0.24), transparent 26%)',
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '170px 84px 130px'}}>
        <FloatingCard width="100%" height="100%">
          <Img
            src={getAssetSrc(asset.path)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: getFitMode(plan, 'cover'),
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            }}
          />
        </FloatingCard>
      </AbsoluteFill>
    </TemplateShell>
  );
};
