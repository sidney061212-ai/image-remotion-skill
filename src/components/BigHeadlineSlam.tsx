import React from 'react';
import type {TemplateSceneProps} from '../types';
import {AnimatedScale, AssetImage, FullFrame, PopIn, SoftVignette, colors} from './common';

export const BigHeadlineSlam: React.FC<TemplateSceneProps> = ({scene, asset}) => {
  return (
    <FullFrame>
      <AnimatedScale from={1} to={1.05}>
        <AssetImage asset={asset} />
      </AnimatedScale>
      <SoftVignette />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 56}}>
        <PopIn>
          <div
            style={{
              color: colors.text,
              fontSize: 84,
              lineHeight: 1.05,
              fontWeight: 900,
              textAlign: 'center',
              textShadow: '0 10px 30px rgba(0,0,0,0.35)',
            }}
          >
            {scene.caption}
          </div>
        </PopIn>
      </div>
    </FullFrame>
  );
};
