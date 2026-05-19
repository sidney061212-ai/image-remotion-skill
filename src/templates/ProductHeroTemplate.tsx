import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {FloatingCard, SweepHighlight, TemplateShell, getAssetSrc, getFitMode, getIntensityMultiplier, getPrimaryAsset, getProgress} from './common';

export const ProductHeroTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const intensity = getIntensityMultiplier(plan.options?.intensity);
  const progress = getProgress(frame, durationInFrames);
  const scale = interpolate(progress, [0, 0.35, 1], [0.96, 1.02, 1.06 + (intensity - 1) * 0.03]);
  const translateY = interpolate(progress, [0, 1], [18 * intensity, -12 * intensity]);
  const shadowScale = interpolate(progress, [0, 1], [0.92, 1.08]);

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#ffd57f">
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '180px 150px 170px'}}>
        <div
          style={{
            position: 'absolute',
            bottom: 150,
            left: '28%',
            right: '28%',
            height: 80,
            borderRadius: '50%',
            background: 'rgba(62, 91, 126, 0.18)',
            filter: 'blur(20px)',
            transform: `scale(${shadowScale})`,
          }}
        />
        <FloatingCard width="100%" height="100%" style={{background: 'rgba(255,255,255,0.72)'}}>
          <Img
            src={getAssetSrc(asset.path)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: getFitMode(plan, 'contain'),
              transform: `translateY(${translateY}px) scale(${scale})`,
            }}
          />
          <SweepHighlight color="#fff8de" opacity={0.28} />
        </FloatingCard>
      </AbsoluteFill>
    </TemplateShell>
  );
};
