import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {FloatingCard, TemplateShell, getAssetSrc, getFitMode, getIntensityMultiplier, getPrimaryAsset, getProgress} from './common';

export const PortraitFocusTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const intensity = getIntensityMultiplier(plan.options?.intensity);
  const progress = getProgress(frame, durationInFrames);
  const scale = interpolate(progress, [0, 1], [1, 1.04 + (intensity - 1) * 0.02]);
  const translateY = interpolate(progress, [0, 1], [10 * intensity, -14 * intensity]);

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#d2a4ff">
      <AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            inset: '18% 18% 14%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.34), transparent 72%)',
            filter: 'blur(20px)',
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '120px 120px'}}>
        <FloatingCard width="72%" height="100%">
          <Img
            src={getAssetSrc(asset.path)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: getFitMode(plan, 'contain'),
              transform: `translateY(${translateY}px) scale(${scale})`,
            }}
          />
        </FloatingCard>
      </AbsoluteFill>
    </TemplateShell>
  );
};
