import React from 'react';
import type {TemplateSceneProps} from '../types';
import {AnimatedScale, AssetImage, Caption, FullFrame, PunchLabel, SoftVignette} from './common';

export const HookZoomHit: React.FC<TemplateSceneProps> = ({scene, asset}) => {
  const scaleFrom = Number(scene.motion?.scaleFrom ?? 1);
  const scaleTo = Number(scene.motion?.scaleTo ?? 1.12);
  return (
    <FullFrame>
      <AnimatedScale from={scaleFrom} to={scaleTo}>
        <AssetImage asset={asset} />
      </AnimatedScale>
      <SoftVignette />
      <PunchLabel text="HOOK" />
      <Caption text={scene.caption} emphasis />
    </FullFrame>
  );
};
