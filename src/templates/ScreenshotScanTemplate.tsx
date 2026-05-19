import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {FloatingCard, TemplateShell, getAssetSrc, getPrimaryAsset} from './common';

export const ScreenshotScanTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();

  const containerWidth = Math.min(width * 0.72, 860);
  const containerHeight = Math.min(height * 0.82, 1320);
  const imageWidth = asset.width ?? plan.outputWidth;
  const imageHeight = asset.height ?? plan.outputHeight;
  const renderedHeight = containerWidth * (imageHeight / imageWidth);
  const overflow = Math.max(0, renderedHeight - containerHeight);
  const translateY = interpolate(frame, [0, durationInFrames], [0, overflow > 0 ? -overflow * 0.94 : -containerHeight * 0.08]);
  const scanTop = interpolate(frame, [0, durationInFrames], [-120, containerHeight + 120]);

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#71d7ff">
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <FloatingCard
          width={containerWidth}
          height={containerHeight}
          style={{
            background: 'rgba(255,255,255,0.88)',
            border: '1px solid rgba(113, 215, 255, 0.28)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              borderRadius: 34,
              background: '#ecf4ff',
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
                top: scanTop,
                height: 92,
                background: 'linear-gradient(180deg, transparent 0%, rgba(113, 215, 255, 0.3) 48%, transparent 100%)',
                mixBlendMode: 'screen',
              }}
            />
          </div>
        </FloatingCard>
      </AbsoluteFill>
    </TemplateShell>
  );
};
