import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {
  FloatingImageCard,
  SoftGradientOverlay,
  TemplateShell,
  TitleBlock,
  VignetteOverlay,
  buildGridLayout,
  getAssetSrc,
  getPrimaryAsset,
  getProgress,
} from './common';
import {SafeKenBurnsTemplate} from './SafeKenBurnsTemplate';

const lerp = (from: number, to: number, progress: number): number => from + (to - from) * progress;
const smooth = (value: number): number => value * value * (3 - 2 * value);

export const GridShuffleTemplate: React.FC<TemplateProps> = ({plan}) => {
  if (plan.assets.length < 2) {
    return <SafeKenBurnsTemplate plan={plan} />;
  }

  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  const assets = plan.assets.slice(0, 9);
  const finalCells = buildGridLayout(assets.length, width, height, 22, 70);
  const shuffledCells = [...finalCells].map((_, index, cells) => cells[(index * 2 + 3) % cells.length]);
  const progress = getProgress(frame, durationInFrames);
  const appear = smooth(Math.min(1, progress / 0.18));
  const shuffle = smooth(Math.min(1, Math.max(0, (progress - 0.22) / 0.24)));
  const settle = smooth(Math.min(1, Math.max(0, (progress - 0.48) / 0.26)));
  const gridScale = interpolate(progress, [0, 0.18, 0.65, 1], [1.08, 1.02, 1, 0.97]);

  return (
    <TemplateShell plan={plan} asset={getPrimaryAsset(plan)} accentColor="#8fe4ff" showDefaultText={false}>
      <SoftGradientOverlay variant="cool" opacity={0.95} />
      <div style={{position: 'absolute', inset: 0, transform: `scale(${gridScale})`}}>
        {assets.map((asset, index) => {
          const from = shuffledCells[index];
          const to = finalCells[index];
          const swap = finalCells[(index + 2) % finalCells.length];
          const midLeft = lerp(from.left, swap.left, shuffle);
          const midTop = lerp(from.top, swap.top, shuffle);
          const left = lerp(midLeft, to.left, settle);
          const top = lerp(midTop, to.top, settle);
          const rotate = interpolate(progress, [0, 0.28, 0.58, 1], [(index % 2 === 0 ? -1 : 1) * 16, (index % 2 === 0 ? 1 : -1) * 8, 0, 0]);
          const scale = appear * interpolate(progress, [0, 0.28, 0.55, 1], [0.82, 1.08, 0.96, 1]);

          return (
            <div
              key={asset.id}
              style={{
                position: 'absolute',
                left,
                top,
                opacity: appear,
              }}
            >
              <FloatingImageCard
                src={getAssetSrc(asset.path)}
                width={to.width}
                height={to.height}
                fit="cover"
                rotate={rotate}
                scale={scale}
                borderRadius={20}
                shadowStrength={0.18}
                style={{
                  border: '1px solid rgba(255,255,255,0.58)',
                }}
              />
            </div>
          );
        })}
      </div>
      <VignetteOverlay strength={0.3} />
      <TitleBlock plan={plan} position="bottom-center" color="#17304b" accentColor="#8fe4ff" delay={44} compact />
    </TemplateShell>
  );
};
