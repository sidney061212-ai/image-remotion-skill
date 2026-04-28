import React from 'react';
import type {TemplateSceneProps} from '../types';
import {AbsoluteFill} from 'remotion';
import {AssetImage, Caption, FullFrame, SoftVignette, colors} from './common';

export const SplitCompare: React.FC<TemplateSceneProps> = ({scene, asset, secondaryAsset}) => {
  return (
    <FullFrame>
      <div style={{display: 'flex', width: '100%', height: '100%'}}>
        <div style={{position: 'relative', width: '50%', height: '100%'}}>
          <AssetImage asset={asset} scale={1.04} />
          <AbsoluteFill style={{justifyContent: 'flex-start', padding: 28}}>
            <div style={{backgroundColor: colors.accent, color: '#111827', fontSize: 28, fontWeight: 900, padding: '8px 12px', borderRadius: 12, alignSelf: 'flex-start'}}>LEFT</div>
          </AbsoluteFill>
        </div>
        <div style={{position: 'relative', width: '50%', height: '100%'}}>
          <AssetImage asset={secondaryAsset ?? asset} scale={1.04} />
          <AbsoluteFill style={{justifyContent: 'flex-start', padding: 28}}>
            <div style={{backgroundColor: colors.accent2, color: '#111827', fontSize: 28, fontWeight: 900, padding: '8px 12px', borderRadius: 12, alignSelf: 'flex-start'}}>RIGHT</div>
          </AbsoluteFill>
        </div>
      </div>
      <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 4, backgroundColor: 'rgba(248,250,252,0.75)'}} />
      <SoftVignette />
      <Caption text={scene.caption} />
    </FullFrame>
  );
};
