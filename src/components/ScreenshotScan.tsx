import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateSceneProps} from '../types';
import {AssetImage, Caption, FullFrame, SoftVignette} from './common';

export const ScreenshotScan: React.FC<TemplateSceneProps> = ({scene, asset}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const translateY = interpolate(frame, [0, durationInFrames], [0, -120], {extrapolateRight: 'clamp'});
  return (
    <FullFrame>
      <AssetImage asset={asset} scale={1.08} translateY={translateY} />
      <div style={{position: 'absolute', left: 40, right: 40, top: '35%', height: 6, background: 'rgba(34,211,238,0.85)', boxShadow: '0 0 22px rgba(34,211,238,0.55)'}} />
      <SoftVignette />
      <Caption text={scene.caption} />
    </FullFrame>
  );
};
