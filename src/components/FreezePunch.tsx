import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateSceneProps} from '../types';
import {AssetImage, FullFrame, SoftVignette, colors} from './common';

export const FreezePunch: React.FC<TemplateSceneProps> = ({scene, asset}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({fps, frame, config: {damping: 12}});
  return (
    <FullFrame>
      <AssetImage asset={asset} scale={1.04} />
      <SoftVignette />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 56}}>
        <div
          style={{
            transform: `scale(${0.85 + p * 0.2})`,
            backgroundColor: colors.accent,
            color: '#111827',
            borderRadius: 28,
            padding: '24px 28px',
            fontSize: 72,
            lineHeight: 1.05,
            fontWeight: 1000,
            textAlign: 'center',
            boxShadow: '0 18px 40px rgba(249,115,22,0.35)',
          }}
        >
          {scene.caption}
        </div>
      </div>
    </FullFrame>
  );
};
