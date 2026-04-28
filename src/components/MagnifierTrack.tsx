import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateSceneProps} from '../types';
import {AssetImage, Caption, FullFrame, SoftVignette} from './common';

export const MagnifierTrack: React.FC<TemplateSceneProps> = ({scene, asset}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const x = interpolate(frame, [0, durationInFrames], [180, 720]);
  const y = interpolate(frame, [0, durationInFrames], [420, 820]);
  return (
    <FullFrame>
      <AssetImage asset={asset} />
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: 220,
          height: 220,
          borderRadius: 999,
          border: '8px solid rgba(248,250,252,0.95)',
          boxShadow: '0 0 0 2000px rgba(15,23,42,0.2)',
          overflow: 'hidden',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <AssetImage asset={asset} scale={1.4} translateX={-x * 0.2} translateY={-y * 0.2} />
      </div>
      <SoftVignette />
      <Caption text={scene.caption} />
    </FullFrame>
  );
};
