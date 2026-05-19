import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {FloatingCard, TemplateShell, getAssetSrc, getFitMode, getIntensityMultiplier, getPrimaryAsset, getProgress} from './common';

export const PosterImpactTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const intensity = getIntensityMultiplier(plan.options?.intensity);
  const progress = getProgress(frame, durationInFrames);
  const scale = interpolate(progress, [0, 0.12, 0.45, 1], [0.9, 1.05, 1.02, 1.05 + (intensity - 1) * 0.03]);
  const titleOpacity = interpolate(progress, [0, 0.1, 0.2, 1], [0, 0.2, 1, 1]);

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#ffa96f">
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '130px 120px 150px'}}>
        <FloatingCard width="78%" height="100%">
          <Img
            src={getAssetSrc(asset.path)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: getFitMode(plan, 'cover'),
              transform: `scale(${scale})`,
            }}
          />
        </FloatingCard>
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: titleOpacity,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.06), transparent 36%)',
        }}
      />
    </TemplateShell>
  );
};
