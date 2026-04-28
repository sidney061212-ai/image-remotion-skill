import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateSceneProps} from '../types';
import {AssetImage, Caption, FullFrame, HighlightBox, SoftVignette} from './common';

export const RegionHop: React.FC<TemplateSceneProps> = ({scene, asset}) => {
  const ids = (scene.motion?.regionIds as string[] | undefined) ?? asset?.focusRegions?.map((r) => r.id) ?? [];
  const regions = ids.map((id) => asset?.focusRegions?.find((r) => r.id === id)).filter(Boolean);
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const idx = Math.min(regions.length - 1, Math.floor(interpolate(frame, [0, durationInFrames], [0, regions.length])));
  const region = regions[Math.max(0, idx)];
  return (
    <FullFrame>
      <AssetImage asset={asset} scale={1.04} />
      <HighlightBox region={region} asset={asset} />
      <SoftVignette />
      <Caption text={scene.caption} />
    </FullFrame>
  );
};
