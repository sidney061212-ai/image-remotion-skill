import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {FloatingCard, TemplateShell, clamp, getAssetSrc, getPrimaryAsset, getProgress} from './common';

const lerp = (from: number, to: number, progress: number): number => from + (to - from) * progress;

const getStoryboardGrid = (assetWidth: number, assetHeight: number): {columns: number; rows: number} => {
  if (assetHeight > assetWidth * 1.15) {
    return {columns: 1, rows: 4};
  }

  return {columns: 2, rows: 2};
};

export const StoryboardGridTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();
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
  const sequence = [{cx: 0.5, cy: 0.5}, ...panelCenters, {cx: 0.5, cy: 0.5}];
  const segmentCount = sequence.length - 1;
  const segmentSize = durationInFrames / segmentCount;
  const segmentIndex = Math.min(segmentCount - 1, Math.floor(frame / Math.max(1, segmentSize)));
  const localProgress = clamp((frame - segmentIndex * segmentSize) / Math.max(1, segmentSize), 0, 1);
  const easedProgress = localProgress * localProgress * (3 - 2 * localProgress);
  const from = sequence[segmentIndex];
  const to = sequence[segmentIndex + 1];
  const cx = lerp(from.cx, to.cx, easedProgress);
  const cy = lerp(from.cy, to.cy, easedProgress);
  const targetScale = segmentIndex === 0 ? 1.12 : segmentIndex === segmentCount - 1 ? 1 : 1.5;
  const previousScale = segmentIndex === 0 ? 1 : 1.5;
  const scale = lerp(previousScale, targetScale, easedProgress);
  const frameWidth = width - 120;
  const frameHeight = height - 240;
  const translateX = (0.5 - cx) * frameWidth * (scale - 1) * 1.1;
  const translateY = (0.5 - cy) * frameHeight * (scale - 1) * 1.1;
  const activePanelIndex = Math.min(panelCenters.length - 1, Math.max(0, segmentIndex - 1));
  const progress = getProgress(frame, durationInFrames);

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#9dc3ff">
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '150px 60px 110px'}}>
        <FloatingCard width="100%" height="100%">
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
            }}
          >
            <Img
              src={getAssetSrc(asset.path)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
              }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 26,
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gap: 20,
              pointerEvents: 'none',
            }}
          >
            {Array.from({length: panelCount}, (_, index) => (
              <div
                key={`panel-${index}`}
                style={{
                  borderRadius: 22,
                  border: `3px solid ${index === activePanelIndex && progress > 0.1 ? 'rgba(255, 215, 122, 0.92)' : 'rgba(255,255,255,0.18)'}`,
                  boxShadow: index === activePanelIndex ? '0 0 28px rgba(255, 215, 122, 0.3)' : 'none',
                  background: index === activePanelIndex ? 'rgba(255, 215, 122, 0.08)' : 'transparent',
                }}
              />
            ))}
          </div>
        </FloatingCard>
      </AbsoluteFill>
    </TemplateShell>
  );
};
