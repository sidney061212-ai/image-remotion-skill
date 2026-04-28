import React from 'react';
import type {TemplateSceneProps} from '../types';
import {AssetImage, Caption, FullFrame, HighlightBox, SoftVignette, colors, regionToStyle} from './common';

export const SpotlightDim: React.FC<TemplateSceneProps> = ({scene, asset}) => {
  const region = asset?.focusRegions?.find((r) => r.id === scene.focusRegion) ?? asset?.focusRegions?.[0];
  const style = regionToStyle(region, asset);
  return (
    <FullFrame>
      <AssetImage asset={asset} />
      <div style={{position: 'absolute', inset: 0, backgroundColor: colors.dim}} />
      {style ? (
        <div style={{position: 'absolute', ...style, overflow: 'hidden', borderRadius: 20}}>
          <AssetImage asset={asset} />
        </div>
      ) : null}
      <HighlightBox region={region} asset={asset} color={colors.accent2} />
      <SoftVignette />
      <Caption text={scene.caption} />
    </FullFrame>
  );
};
