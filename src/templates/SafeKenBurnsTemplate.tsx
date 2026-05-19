import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {FloatingCard, TemplateShell, getAssetSrc, getFitMode, getIntensityMultiplier, getPrimaryAsset, getProgress} from './common';

export const SafeKenBurnsTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const intensity = getIntensityMultiplier(plan.options?.intensity);
  const progress = getProgress(frame, durationInFrames);
  const scale = interpolate(progress, [0, 1], [1, 1.05 + (intensity - 1) * 0.03]);
  const translateX = interpolate(progress, [0, 1], [12 * intensity, -10 * intensity]);
  const translateY = interpolate(progress, [0, 1], [6 * intensity, -8 * intensity]);

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#c7d5ff">
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '110px 72px'}}>
        <FloatingCard width="100%" height="100%">
          <Img
            src={getAssetSrc(asset.path)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: getFitMode(plan, 'contain'),
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            }}
          />
        </FloatingCard>
      </AbsoluteFill>
    </TemplateShell>
  );
};
