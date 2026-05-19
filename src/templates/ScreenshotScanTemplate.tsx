import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {
  FloatingImageCard,
  SoftGradientOverlay,
  TemplateShell,
  TitleBlock,
  clamp,
  getAssetSrc,
  getPrimaryAsset,
  getProgress,
  safeSpring,
} from './common';

export const ScreenshotScanTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames, fps, width, height} = useVideoConfig();
  const progress = getProgress(frame, durationInFrames);
  const imageWidth = asset.width ?? plan.outputWidth;
  const imageHeight = asset.height ?? plan.outputHeight;
  const isVertical = imageHeight >= imageWidth;
  const enter = safeSpring({frame, fps, delay: 4, damping: 24, stiffness: 90});
  const containerWidth = isVertical ? Math.min(width * 0.62, 760) : Math.min(width * 0.82, 1220);
  const containerHeight = isVertical ? Math.min(height * 0.78, 1320) : Math.min(height * 0.62, 760);
  const renderedHeight = containerWidth * (imageHeight / imageWidth);
  const overflow = Math.max(0, renderedHeight - containerHeight);
  const scanProgress = clamp((progress - 0.16) / 0.58, 0, 1);
  const translateY = interpolate(scanProgress, [0, 1], [0, overflow > 0 ? -overflow * 0.92 : -containerHeight * 0.06]);
  const scanTop = interpolate(progress, [0.18, 0.76], [-100, containerHeight + 120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const punch = interpolate(progress, [0.58, 0.66, 0.75], [1, 1.06, 1.01], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const enterY = interpolate(enter, [0, 1], [70, 0]);
  const enterScale = interpolate(enter, [0, 1], [0.92, 1]);
  const exitScale = interpolate(progress, [0.78, 1], [1, 0.96], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#71d7ff" showDefaultText={false}>
      <SoftGradientOverlay variant="cool" opacity={1} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div
          style={{
            position: 'absolute',
            width: containerWidth + 92,
            height: containerHeight + 108,
            borderRadius: isVertical ? 72 : 38,
            background: isVertical ? '#101a2e' : '#f8fbff',
            boxShadow: '0 34px 110px rgba(29, 76, 120, 0.26)',
            transform: `translateY(${enterY}px) scale(${enterScale * punch * exitScale})`,
            border: isVertical ? '10px solid rgba(255,255,255,0.14)' : '1px solid rgba(110,150,190,0.28)',
          }}
        >
          {!isVertical && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 54,
                borderRadius: '38px 38px 0 0',
                background: '#e9f1f8',
                borderBottom: '1px solid rgba(110,150,190,0.24)',
              }}
            >
              <div style={{position: 'absolute', top: 18, left: 24, width: 14, height: 14, borderRadius: 999, background: '#ff6b6b'}} />
              <div style={{position: 'absolute', top: 18, left: 48, width: 14, height: 14, borderRadius: 999, background: '#ffd166'}} />
              <div style={{position: 'absolute', top: 18, left: 72, width: 14, height: 14, borderRadius: 999, background: '#4ecdc4'}} />
            </div>
          )}
          <FloatingImageCard
            src={getAssetSrc(asset.path)}
            width={containerWidth}
            height={containerHeight}
            fit="cover"
            borderRadius={isVertical ? 46 : 24}
            shadowStrength={0.08}
            style={{
              position: 'absolute',
              left: 46,
              top: isVertical ? 54 : 78,
              background: '#ecf4ff',
            }}
            imgStyle={{
              width: '100%',
              height: overflow > 0 ? 'auto' : '100%',
              minHeight: '100%',
              objectFit: overflow > 0 ? 'contain' : 'cover',
              transform: `translateY(${translateY}px)`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: scanTop,
                height: 86,
                background: 'linear-gradient(180deg, transparent 0%, rgba(105, 215, 255, 0.22) 50%, transparent 100%)',
                mixBlendMode: 'screen',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                border: '1px solid rgba(113, 215, 255, 0.2)',
              }}
            />
          </FloatingImageCard>
        </div>
      </AbsoluteFill>
      <TitleBlock plan={plan} position="bottom-left" color="#14314d" accentColor="#71d7ff" delay={36} maxWidth="52%" compact />
    </TemplateShell>
  );
};
