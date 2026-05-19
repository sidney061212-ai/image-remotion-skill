import React from 'react';
import {Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {TemplateShell, buildGridLayout, getAssetSrc, getPrimaryAsset, getProgress} from './common';

const lerp = (from: number, to: number, progress: number): number => from + (to - from) * progress;

export const GridShuffleTemplate: React.FC<TemplateProps> = ({plan}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  const assets = plan.assets.slice(0, 9);
  const finalCells = buildGridLayout(assets.length, width, height, 22, 62);
  const shuffledCells = [...finalCells].reverse();
  const progress = getProgress(frame, durationInFrames);
  const settle = progress < 0.55 ? progress / 0.55 : 1;
  const pulseScale = interpolate(progress, [0, 0.55, 1], [0.88, 1.04, 1]);

  return (
    <TemplateShell plan={plan} asset={getPrimaryAsset(plan)} accentColor="#8fe4ff">
      {assets.map((asset, index) => {
        const from = shuffledCells[index];
        const to = finalCells[index];
        const left = lerp(from.left, to.left, settle);
        const top = lerp(from.top, to.top, settle);
        const rotate = lerp((index % 2 === 0 ? -1 : 1) * 12, 0, settle);

        return (
          <div
            key={asset.id}
            style={{
              position: 'absolute',
              left,
              top,
              width: to.width,
              height: to.height,
              borderRadius: 22,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.38)',
              boxShadow: '0 18px 42px rgba(84, 113, 148, 0.16)',
              transform: `rotate(${rotate}deg) scale(${pulseScale})`,
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
