import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateProps} from './common';
import {FloatingCard, TemplateShell, getAssetSrc, getPrimaryAsset} from './common';

export const DocumentFocusTemplate: React.FC<TemplateProps> = ({plan}) => {
  const asset = getPrimaryAsset(plan);
  const frame = useCurrentFrame();
  const {durationInFrames, width, height} = useVideoConfig();

  const containerWidth = Math.min(width * 0.7, 840);
  const containerHeight = Math.min(height * 0.8, 1260);
  const imageWidth = asset.width ?? plan.outputWidth;
  const imageHeight = asset.height ?? plan.outputHeight;
  const renderedHeight = containerWidth * (imageHeight / imageWidth);
  const overflow = Math.max(0, renderedHeight - containerHeight);
  const translateY = interpolate(frame, [0, durationInFrames], [0, overflow > 0 ? -overflow * 0.88 : -containerHeight * 0.06]);

  return (
    <TemplateShell plan={plan} asset={asset} accentColor="#9cc0ff">
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div
          style={{
            position: 'absolute',
            width: containerWidth + 36,
            height: containerHeight + 36,
            borderRadius: 38,
            background: 'rgba(156, 192, 255, 0.16)',
            filter: 'blur(18px)',
          }}
        />
        <FloatingCard
          width={containerWidth}
          height={containerHeight}
          style={{
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(156, 192, 255, 0.22)',
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
          </div>
        </FloatingCard>
      </AbsoluteFill>
    </TemplateShell>
  );
};
