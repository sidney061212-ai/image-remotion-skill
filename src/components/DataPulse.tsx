import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateSceneProps} from '../types';
import {AssetImage, Caption, FullFrame, SoftVignette, colors} from './common';

const extractNumber = (text?: string) => text?.match(/[\d.]+[%万亿千百十]?/)?.[0] ?? '32%';

export const DataPulse: React.FC<TemplateSceneProps> = ({scene, asset}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({fps, frame, config: {damping: 10}});
  const value = extractNumber(scene.caption);
  return (
    <FullFrame>
      <AssetImage asset={asset} scale={1.05} opacity={0.55} />
      <SoftVignette />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div
          style={{
            transform: `scale(${0.75 + p * 0.4})`,
            color: colors.accent,
            fontSize: 180,
            fontWeight: 1000,
            textShadow: '0 12px 36px rgba(249,115,22,0.35)',
          }}
        >
          {value}
        </div>
      </div>
      <Caption text={scene.caption} />
    </FullFrame>
  );
};
