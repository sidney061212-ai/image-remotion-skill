import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateSceneProps} from '../types';
import {AssetImage, Caption, FullFrame, SoftVignette} from './common';

export const BeatMicroCut: React.FC<TemplateSceneProps> = ({scene, asset}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const beat = Math.floor(frame / Math.max(1, Math.round(fps / 3))) % 2;
  const scale = interpolate(beat, [0, 1], [1.02, 1.08]);
  return (
    <FullFrame>
      <AssetImage asset={asset} scale={scale} opacity={beat === 0 ? 0.9 : 1} />
      <SoftVignette />
      <Caption text={scene.caption} />
    </FullFrame>
  );
};
