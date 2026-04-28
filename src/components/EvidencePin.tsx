import React from 'react';
import type {TemplateSceneProps} from '../types';
import {ArrowTag, AssetImage, Caption, FullFrame, HighlightBox, SoftVignette} from './common';

export const EvidencePin: React.FC<TemplateSceneProps> = ({scene, asset}) => {
  const region = asset?.focusRegions?.find((r) => r.id === scene.focusRegion) ?? asset?.focusRegions?.[0];
  const label = typeof scene.overlay?.label === 'string' ? scene.overlay.label : region?.label;
  return (
    <FullFrame>
      <AssetImage asset={asset} scale={1.06} />
      <HighlightBox region={region} asset={asset} />
      <ArrowTag region={region} asset={asset} label={label} />
      <SoftVignette />
      <Caption text={scene.caption} />
    </FullFrame>
  );
};
