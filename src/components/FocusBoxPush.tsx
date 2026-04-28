import React from 'react';
import type {TemplateSceneProps} from '../types';
import {AnimatedScale, AssetImage, Caption, FullFrame, HighlightBox, SoftVignette} from './common';

export const FocusBoxPush: React.FC<TemplateSceneProps> = ({scene, asset}) => {
  const region = asset?.focusRegions?.find((r) => r.id === scene.focusRegion) ?? asset?.focusRegions?.[0];
  return (
    <FullFrame>
      <AnimatedScale from={1} to={Number(scene.motion?.scaleTo ?? 1.18)}>
        <AssetImage asset={asset} />
      </AnimatedScale>
      <HighlightBox region={region} asset={asset} />
      <SoftVignette />
      <Caption text={scene.caption} />
    </FullFrame>
  );
};
