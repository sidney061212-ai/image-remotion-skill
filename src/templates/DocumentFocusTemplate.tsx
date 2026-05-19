import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {
  FloatingCard,
  SoftGradientOverlay,
  TemplateShell,
  TitleBlock,
  VignetteOverlay,
  clamp,
  getAssetSrc,
  getPrimaryAsset,
  getProgress,
  safeSpring,
} from './common';

export const DocumentFocusTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames, fps, width, height} = useVideoConfig();
  const progress = getProgress(frame, durationInFrames);

  const containerWidth = Math.min(width * 0.7, 840);
  const containerHeight = Math.min(height * 0.8, 1260);
  const imageWidth = asset.width ?? plan.outputWidth;
  const imageHeight = asset.height ?? plan.outputHeight;
  const renderedHeight = containerWidth * (imageHeight / imageWidth);
  const overflow = Math.max(0, renderedHeight - containerHeight);
  const scanProgress = clamp((progress - 0.12) / 0.72, 0, 1);
  const translateY = interpolate(scanProgress, [0, 1], [0, overflow > 0 ? -overflow * 0.88 : -containerHeight * 0.06]);
  const enter = safeSpring({frame, fps, delay: 6, damping: 26, stiffness: 78});
  const enterY = interpolate(enter, [0, 1], [42, 0]);
  const enterScale = interpolate(enter, [0, 1], [0.95, 1]);
  const focusTop = interpolate(progress, [0.18, 0.82], [containerHeight * 0.18, containerHeight * 0.7], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#9cc0ff" showDefaultText={false}>
      <SoftGradientOverlay variant="cool" opacity={0.72} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div
          style={{
            position: 'absolute',
            width: containerWidth + 76,
            height: containerHeight + 76,
            borderRadius: 46,
            background: 'rgba(156, 192, 255, 0.2)',
            filter: 'blur(22px)',
            transform: `translateY(${enterY}px) scale(${enterScale})`,
          }}
        />
        <FloatingCard
          width={containerWidth}
          height={containerHeight}
          style={{
            transform: `translateY(${enterY}px) scale(${enterScale})`,
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(156, 192, 255, 0.22)',
            boxShadow: '0 34px 100px rgba(41, 73, 112, 0.22)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              borderRadius: 34,
              background: '#f8fbff',
            }}
          >
            <Img
              src={getAssetSrc(asset.path)}
              style={{
                width: '100%',
                height: 'auto',
                minHeight: '100%',
                transform: `translateY(${translateY}px)`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: focusTop,
                height: 96,
                background: 'linear-gradient(180deg, transparent, rgba(156, 192, 255, 0.18), transparent)',
              }}
            />
          </div>
        </FloatingCard>
      </AbsoluteFill>
      <VignetteOverlay strength={0.22} />
      <TitleBlock plan={plan} position="bottom-left" color="#17304b" accentColor="#9cc0ff" delay={34} maxWidth="52%" compact />
    </TemplateShell>
  );
};
