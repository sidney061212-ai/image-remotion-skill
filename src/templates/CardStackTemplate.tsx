import React from 'react';
import {Img, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {TemplateShell, clamp, getAssetSrc, getPrimaryAsset} from './common';
import {SafeKenBurnsTemplate} from './SafeKenBurnsTemplate';

const lerp = (from: number, to: number, progress: number): number => from + (to - from) * progress;

export const CardStackTemplate: React.FC<TemplateProps> = ({plan}) => {
  if (plan.assets.length < 2) {
    return <SafeKenBurnsTemplate plan={plan} />;
  }

  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const assets = plan.assets.slice(0, 10);
  const spread = Math.min(assets.length, 6);

  return (
    <TemplateShell plan={plan} asset={getPrimaryAsset(plan)} accentColor="#ffcf97">
      {assets.map((asset, index) => {
        const reveal = spring({
          frame: Math.max(0, frame - index * 5),
          fps,
          config: {damping: 14},
        });
        const centeredLeft = width * 0.5 - 230;
        const centeredTop = height * 0.5 - 310;
        const columnOffset = (index - (spread - 1) / 2) * 96;
        const rowOffset = index < 5 ? -16 * index : 42 * (index - 4);
        const left = centeredLeft + columnOffset * reveal;
        const top = centeredTop + rowOffset * reveal;
        const rotate = lerp(-14 + index * 5, clamp((index - (spread - 1) / 2) * 7, -18, 18), reveal);
        const scale = 0.9 + reveal * 0.1;

        return (
          <div
            key={asset.id}
            style={{
              position: 'absolute',
              left,
              top,
              width: 460,
              height: 620,
              borderRadius: 28,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.4)',
              boxShadow: '0 24px 60px rgba(84, 113, 148, 0.18)',
              transform: `rotate(${rotate}deg) scale(${scale})`,
              background: 'rgba(255,255,255,0.76)',
            }}
          >
            <Img
              src={getAssetSrc(asset.path)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        );
      })}
    </TemplateShell>
  );
};
