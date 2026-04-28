import React from 'react';
import type {TemplateSceneProps} from '../types';
import {AnimatedScale, AssetImage, FullFrame, SoftVignette, colors} from './common';

export const OutroLoopCard: React.FC<TemplateSceneProps> = ({scene, asset}) => {
  const from = Number(scene.motion?.scaleFrom ?? 1.04);
  const to = Number(scene.motion?.scaleTo ?? 1.08);
  return (
    <FullFrame>
      <AnimatedScale from={from} to={to}>
        <AssetImage asset={asset} opacity={0.72} />
      </AnimatedScale>
      <SoftVignette />
      <div style={{position: 'absolute', left: 48, right: 48, bottom: 140, backgroundColor: 'rgba(15,23,42,0.72)', borderRadius: 28, padding: 28}}>
        <div style={{color: colors.text, fontSize: 62, lineHeight: 1.1, fontWeight: 900, textAlign: 'center'}}>{scene.caption}</div>
      </div>
    </FullFrame>
  );
};
