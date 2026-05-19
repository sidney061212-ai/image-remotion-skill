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
  safeSpring,
} from './common';
import {SafeKenBurnsTemplate} from './SafeKenBurnsTemplate';

const startOffsets = [
  [-520, -260, -13],
  [520, -220, 11],
  [-460, 260, 8],
  [520, 280, -10],
  [0, -420, 7],
  [0, 420, -7],
  [-620, 0, 12],
  [620, 0, -12],
  [-320, -360, 9],
  [360, -360, -9],
  [-340, 360, -8],
  [380, 360, 8],
] as const;

export const PhotoWallTemplate: React.FC<TemplateProps> = ({plan}) => {
  if (plan.assets.length < 2) {
    return <SafeKenBurnsTemplate plan={plan} />;
  }

  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const progress = getProgress(frame, durationInFrames);
  const assets = plan.assets.slice(0, 12);
  const cells = buildGridLayout(assets.length, width, height, 26, 82);
  const wallScale = interpolate(progress, [0, 0.72, 1], [1.05, 1, 0.96]);

  return (
    <TemplateShell plan={plan} asset={getPrimaryAsset(plan)} accentColor="#8fd8c2" showDefaultText={false}>
      <SoftGradientOverlay variant="mint" opacity={0.85} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${wallScale})`,
        }}
      >
        {assets.map((asset, index) => {
          const cell = cells[index];
          const [fromX, fromY, fromRotate] = startOffsets[index % startOffsets.length];
          const enter = safeSpring({
            frame,
            fps,
            delay: index * 5,
            damping: 20,
            stiffness: 88,
          });
          const settle = safeSpring({
            frame,
            fps,
            delay: 26 + index * 3,
            damping: 26,
            stiffness: 70,
          });
          const finalRotate = (index % 2 === 0 ? -1 : 1) * (2 + (index % 3));
          const left = cell.left + fromX * (1 - enter);
          const top = cell.top + fromY * (1 - enter);
          const rotate = interpolate(settle, [0, 1], [fromRotate, finalRotate]);
          const scale = interpolate(enter, [0, 1], [0.76, 1]);

          return (
            <div
              key={asset.id}
              style={{
                position: 'absolute',
                left,
                top,
              }}
            >
              <FloatingImageCard
                src={getAssetSrc(asset.path)}
                width={cell.width}
                height={cell.height}
                fit="cover"
                rotate={rotate}
                scale={scale}
                borderRadius={22}
                shadowStrength={0.24}
                style={{
                  border: '1px solid rgba(255,255,255,0.62)',
                  background: '#ffffff',
                }}
              />
            </div>
          );
        })}
      </div>
      <VignetteOverlay strength={0.28} />
      <TitleBlock plan={plan} position="bottom-center" color="#17304b" accentColor="#8fd8c2" delay={Math.max(34, assets.length * 5)} compact />
    </TemplateShell>
  );
};
