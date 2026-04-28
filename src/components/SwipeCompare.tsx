import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateSceneProps} from '../types';
import {AssetImage, Caption, FullFrame, SoftVignette} from './common';

export const SwipeCompare: React.FC<TemplateSceneProps> = ({scene, asset, secondaryAsset}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, width} = useVideoConfig();
  const reveal = interpolate(frame, [0, durationInFrames], [0.2, 0.85]);
  const clip = `inset(0 ${(1 - reveal) * 100}% 0 0)`;
  return (
    <FullFrame>
      <AssetImage asset={asset} />
      <div style={{position: 'absolute', inset: 0, clipPath: clip}}>
        <AssetImage asset={secondaryAsset ?? asset} />
      </div>
      <div style={{position: 'absolute', left: width * reveal, top: 0, bottom: 0, width: 6, backgroundColor: 'rgba(248,250,252,0.95)', transform: 'translateX(-50%)'}} />
      <SoftVignette />
      <Caption text={scene.caption} />
    </FullFrame>
  );
};
