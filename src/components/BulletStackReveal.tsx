import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateSceneProps} from '../types';
import {AssetImage, Caption, FullFrame, SoftVignette, colors} from './common';

export const BulletStackReveal: React.FC<TemplateSceneProps> = ({scene, asset}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bullets = scene.bullets?.length ? scene.bullets : (scene.caption ? scene.caption.split(/[，。,.]/).filter(Boolean).slice(0, 3) : []);
  return (
    <FullFrame>
      <AssetImage asset={asset} scale={1.04} opacity={0.7} />
      <SoftVignette />
      <div style={{position: 'absolute', left: 56, right: 56, top: 240, display: 'flex', flexDirection: 'column', gap: 24}}>
        {bullets.map((bullet, i) => {
          const p = spring({fps, frame: frame - i * 6, config: {damping: 14}});
          return (
            <div
              key={`${bullet}-${i}`}
              style={{
                opacity: p,
                transform: `translateY(${(1 - p) * 24}px) scale(${0.95 + p * 0.05})`,
                backgroundColor: i === 0 ? colors.accent : 'rgba(15,23,42,0.74)',
                color: i === 0 ? '#111827' : colors.text,
                padding: '18px 22px',
                borderRadius: 20,
                fontSize: 38,
                fontWeight: 800,
              }}
            >
              {bullet}
            </div>
          );
        })}
      </div>
      <Caption text={scene.caption} />
    </FullFrame>
  );
};
