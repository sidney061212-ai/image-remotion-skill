import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {FloatingCard, TemplateShell, getAssetSrc, getFitMode, getIntensityMultiplier, getPrimaryAsset, getProgress} from './common';

export const InfographicZoomTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = getProgress(frame, durationInFrames);
  const intensity = getIntensityMultiplier(plan.options?.intensity);
  const isVertical = (asset.height ?? plan.outputHeight) >= (asset.width ?? plan.outputWidth);
  const translateX = isVertical ? 0 : interpolate(progress, [0, 0.55, 1], [18 * intensity, -24 * intensity, 0]);
  const translateY = isVertical ? interpolate(progress, [0, 0.55, 1], [18 * intensity, -30 * intensity, 0]) : 0;
  const scale = interpolate(progress, [0, 0.68, 1], [1, 1.06 * intensity, 1.01]);

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#79b7ff">
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '150px 72px 150px'}}>
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
