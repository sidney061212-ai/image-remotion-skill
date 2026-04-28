import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateSceneProps} from '../types';
import {AssetImage, Caption, FullFrame, SoftVignette} from './common';

export const ParallaxDepth: React.FC<TemplateSceneProps> = ({scene, asset}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const bgScale = interpolate(frame, [0, durationInFrames], [1.08, 1.14]);
  const fgScale = interpolate(frame, [0, durationInFrames], [1.0, 1.08]);
  return (
    <FullFrame>
      <AssetImage asset={asset} scale={bgScale} opacity={0.7} />
      <div style={{position: 'absolute', inset: 0, backdropFilter: 'blur(8px)'}} />
      <AssetImage asset={asset} scale={fgScale} />
      <SoftVignette />
      <Caption text={scene.caption} />
    </FullFrame>
  );
};
