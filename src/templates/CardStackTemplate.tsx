import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
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
  safeSpring,
} from './common';
import {SafeKenBurnsTemplate} from './SafeKenBurnsTemplate';

export const CardStackTemplate: React.FC<TemplateProps> = ({plan}) => {
  if (plan.assets.length < 2) {
    return <SafeKenBurnsTemplate plan={plan} />;
  }

  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const assets = plan.assets.slice(0, 10);
  const spread = Math.min(assets.length, 6);
  const cardWidth = Math.min(width * 0.34, 520);
  const cardHeight = Math.min(height * 0.66, 680);
  const centerLeft = width * 0.5 - cardWidth / 2;
  const centerTop = height * 0.5 - cardHeight / 2;

  return (
    <TemplateShell plan={plan} asset={getPrimaryAsset(plan)} accentColor="#ffcf97" showDefaultText={false}>
      <SoftGradientOverlay variant="warm" opacity={0.9} />
      {assets.map((asset, index) => {
        const reveal = safeSpring({
          frame,
          fps,
          delay: 12 + index * 6,
          damping: 22,
          stiffness: 86,
        });
        const rank = assets.length - index - 1;
        const fanIndex = index - (spread - 1) / 2;
        const finalX = clamp(fanIndex * 112, -420, 420);
        const finalY = index === assets.length - 1 ? -22 : Math.abs(fanIndex) * 16 + index * 5;
        const finalRotate = clamp(fanIndex * 7, -22, 22);
        const mainBoost = index === assets.length - 1 ? safeSpring({frame, fps, delay: 54, damping: 26, stiffness: 64}) : 0;
        const x = interpolate(reveal, [0, 1], [0, finalX]);
        const y = interpolate(reveal, [0, 1], [0, finalY]);
        const rotate = interpolate(reveal, [0, 1], [-10 + index * 2, finalRotate]);
        const scale = 0.88 + reveal * 0.1 + mainBoost * (index === assets.length - 1 ? 0.08 : 0);

        return (
          <div
            key={asset.id}
            style={{
              position: 'absolute',
              left: centerLeft,
              top: centerTop,
              zIndex: 20 + index,
              opacity: interpolate(reveal, [0, 0.35, 1], [0, 1, 1]),
            }}
          >
            <FloatingImageCard
              src={getAssetSrc(asset.path)}
              width={cardWidth}
              height={cardHeight}
              fit="cover"
              x={x}
              y={y + rank * 4}
              rotate={rotate}
              scale={scale}
              borderRadius={30}
              shadowStrength={0.18 + index * 0.012}
              style={{
                border: '1px solid rgba(255,255,255,0.68)',
              }}
            />
          </div>
        );
      })}
      <VignetteOverlay strength={0.32} />
      <TitleBlock plan={plan} position="bottom-left" color="#3b2a18" accentColor="#ffcf97" delay={58} maxWidth="48%" compact />
    </TemplateShell>
  );
};
