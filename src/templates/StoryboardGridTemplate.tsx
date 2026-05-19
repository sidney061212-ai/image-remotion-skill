import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {
  FloatingImageCard,
  SoftGradientOverlay,
  TemplateShell,
  TitleBlock,
  VignetteOverlay,
  clamp,
  getAssetSrc,
  getPrimaryAsset,
  getProgress,
} from './common';

const lerp = (from: number, to: number, progress: number): number => from + (to - from) * progress;
const smooth = (value: number): number => value * value * (3 - 2 * value);

const getStoryboardGrid = (assetWidth: number, assetHeight: number): {columns: number; rows: number} => {
  if (assetHeight > assetWidth * 1.22) {
    return {columns: 1, rows: 4};
  }
  return {columns: 2, rows: 2};
};

export const StoryboardGridTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
  const progress = getProgress(frame, durationInFrames);
  const assetWidth = asset.width ?? plan.outputWidth;
  const assetHeight = asset.height ?? plan.outputHeight;
  const {columns, rows} = getStoryboardGrid(assetWidth, assetHeight);
  const panelCount = columns * rows;
  const panelCenters = Array.from({length: panelCount}, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    return {
      cx: (column + 0.5) / columns,
      cy: (row + 0.5) / rows,
    };
  });
  const panelProgress = clamp((progress - 0.12) / 0.68, 0, 1);
  const panelFloat = panelProgress * panelCount;
  const activePanel = Math.min(panelCount - 1, Math.floor(panelFloat));
  const local = smooth(clamp(panelFloat - activePanel, 0, 1));
  const from = progress < 0.12 || progress > 0.8 ? {cx: 0.5, cy: 0.5} : panelCenters[activePanel];
  const to = progress > 0.8 ? {cx: 0.5, cy: 0.5} : panelCenters[Math.min(panelCount - 1, activePanel + 1)];
  const cx = lerp(from.cx, to.cx, local);
  const cy = lerp(from.cy, to.cy, local);
  const scale = progress < 0.12
    ? interpolate(progress, [0, 0.12], [0.96, 1])
    : progress > 0.8
      ? interpolate(progress, [0.8, 1], [1.38, 0.96])
      : 1.34;
  const frameWidth = width - 130;
  const frameHeight = height - 226;
  const translateX = (0.5 - cx) * frameWidth * (scale - 1) * 1.08;
  const translateY = (0.5 - cy) * frameHeight * (scale - 1) * 1.08;
  const overlayOpacity = interpolate(progress, [0.08, 0.16, 0.76, 0.9], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#ffe083" showDefaultText={false}>
      <SoftGradientOverlay variant="dark" opacity={0.5} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '118px 64px 108px'}}>
        <FloatingImageCard
          src={getAssetSrc(asset.path)}
          width="100%"
          height="100%"
          fit="cover"
          borderRadius={30}
          shadowStrength={0.3}
          imgStyle={{
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 26,
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gap: 18,
              opacity: overlayOpacity,
              pointerEvents: 'none',
            }}
          >
            {Array.from({length: panelCount}, (_, index) => (
              <div
                key={`panel-${index}`}
                style={{
                  borderRadius: 20,
                  border: `3px solid ${index === activePanel ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.18)'}`,
                  boxShadow: index === activePanel ? '0 0 30px rgba(255, 224, 131, 0.42)' : 'none',
                  background: index === activePanel ? 'rgba(255, 224, 131, 0.08)' : 'transparent',
                }}
              />
            ))}
          </div>
        </FloatingImageCard>
      </AbsoluteFill>
      <VignetteOverlay strength={0.44} />
      <TitleBlock plan={plan} position="bottom-left" color="#f8fbff" accentColor="#ffe083" delay={34} maxWidth="58%" compact />
    </TemplateShell>
  );
};
