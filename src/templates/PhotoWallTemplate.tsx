import React from 'react';
import {Img, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {TemplateShell, buildGridLayout, getAssetSrc, getPrimaryAsset} from './common';

export const PhotoWallTemplate: React.FC<TemplateProps> = ({plan}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const assets = plan.assets.slice(0, 12);
  const cells = buildGridLayout(assets.length, width, height, 24, 68);

  return (
    <TemplateShell plan={plan} asset={getPrimaryAsset(plan)} accentColor="#8fd8c2">
      {assets.map((asset, index) => {
        const cell = cells[index];
        const enter = spring({
          frame: Math.max(0, frame - index * 4),
          fps,
          config: {damping: 15},
        });
        const fromX = (index % 2 === 0 ? -1 : 1) * (220 + index * 34);
        const fromY = index % 3 === 0 ? -180 : 180 + index * 16;
        const rotate = (index % 2 === 0 ? -8 : 8) * (1 - enter);

        return (
          <div
            key={asset.id}
            style={{
              position: 'absolute',
              left: cell.left + fromX * (1 - enter),
              top: cell.top + fromY * (1 - enter),
              width: cell.width,
              height: cell.height,
              borderRadius: 24,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.38)',
              boxShadow: '0 20px 50px rgba(84, 113, 148, 0.18)',
              transform: `rotate(${rotate}deg) scale(${0.92 + enter * 0.08})`,
              background: 'rgba(255,255,255,0.74)',
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
