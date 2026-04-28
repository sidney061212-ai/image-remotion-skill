import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {DEFAULT_ASSET_HEIGHT, DEFAULT_ASSET_WIDTH} from '../engine/constants';
import type {Asset, FocusRegion} from '../types';

export const colors = {
  bg: '#0f172a',
  text: '#f8fafc',
  accent: '#f97316',
  accent2: '#22d3ee',
  dim: 'rgba(15,23,42,0.6)',
  line: 'rgba(248,250,252,0.9)',
};

export const FullFrame: React.FC<React.PropsWithChildren> = ({children}) => (
  <AbsoluteFill style={{backgroundColor: colors.bg, overflow: 'hidden', fontFamily: 'Inter, Arial, sans-serif'}}>
    {children}
  </AbsoluteFill>
);

export const AssetImage: React.FC<{asset?: Asset; scale?: number; translateX?: number; translateY?: number; opacity?: number}> = ({
  asset,
  scale = 1,
  translateX = 0,
  translateY = 0,
  opacity = 1,
}) => {
  if (!asset) {
    return <AbsoluteFill style={{background: 'linear-gradient(135deg,#111827,#334155)'}} />;
  }
  return (
    <Img
      src={asset.path}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        opacity,
      }}
    />
  );
};

export const Caption: React.FC<{text?: string; align?: 'left' | 'center'; emphasis?: boolean}> = ({text, align = 'center', emphasis = false}) => {
  if (!text) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 56,
        right: 56,
        bottom: 120,
        color: colors.text,
        fontSize: emphasis ? 64 : 54,
        lineHeight: 1.15,
        textAlign: align,
        fontWeight: 800,
        textShadow: '0 8px 24px rgba(0,0,0,0.35)',
      }}
    >
      {text}
    </div>
  );
};

export const PunchLabel: React.FC<{text?: string}> = ({text}) => {
  if (!text) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 100,
        left: 56,
        backgroundColor: colors.accent,
        color: '#111827',
        borderRadius: 20,
        padding: '14px 20px',
        fontSize: 34,
        fontWeight: 900,
        boxShadow: '0 12px 32px rgba(249,115,22,0.35)',
      }}
    >
      {text}
    </div>
  );
};

export const getAssetDimensions = (asset?: Asset) => ({
  width: asset?.width ?? DEFAULT_ASSET_WIDTH,
  height: asset?.height ?? DEFAULT_ASSET_HEIGHT,
});

export const regionToStyle = (region?: FocusRegion, asset?: Asset) => {
  if (!region) return null;
  const {width, height} = getAssetDimensions(asset);
  return {
    left: `${(region.x / width) * 100}%`,
    top: `${(region.y / height) * 100}%`,
    width: `${(region.w / width) * 100}%`,
    height: `${(region.h / height) * 100}%`,
  };
};

export const HighlightBox: React.FC<{region?: FocusRegion; asset?: Asset; color?: string; borderWidth?: number}> = ({
  region,
  asset,
  color = colors.accent,
  borderWidth = 6,
}) => {
  const style = regionToStyle(region, asset);
  if (!style) return null;
  return (
    <div
      style={{
        position: 'absolute',
        ...style,
        border: `${borderWidth}px solid ${color}`,
        borderRadius: 20,
        boxShadow: `0 0 0 2000px rgba(15,23,42,0.15), 0 0 28px ${color}`,
      }}
    />
  );
};

export const ArrowTag: React.FC<{region?: FocusRegion; asset?: Asset; label?: string}> = ({region, asset, label}) => {
  const style = regionToStyle(region, asset);
  if (!style) return null;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: `calc(${style.left} - 12px)`,
          top: `calc(${style.top} - 56px)`,
          width: 140,
          height: 6,
          backgroundColor: colors.accent2,
          transform: 'rotate(-18deg)',
          transformOrigin: 'left center',
          boxShadow: '0 0 18px rgba(34,211,238,0.6)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: `calc(${style.left} - 12px)`,
          top: `calc(${style.top} - 100px)`,
          backgroundColor: colors.accent2,
          color: '#0f172a',
          padding: '10px 16px',
          borderRadius: 14,
          fontWeight: 900,
          fontSize: 28,
        }}
      >
        {label}
      </div>
    </>
  );
};

export const AnimatedScale: React.FC<React.PropsWithChildren<{from?: number; to?: number}>> = ({children, from = 1, to = 1.08}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [from, to], {extrapolateRight: 'clamp'});
  return <div style={{width: '100%', height: '100%', transform: `scale(${scale})`}}>{children}</div>;
};

export const PopIn: React.FC<React.PropsWithChildren> = ({children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const value = spring({fps, frame, config: {damping: 12}});
  return <div style={{transform: `scale(${0.85 + value * 0.15})`, opacity: value}}>{children}</div>;
};

export const SoftVignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: 'radial-gradient(circle, rgba(15,23,42,0) 40%, rgba(15,23,42,0.42) 100%)',
      pointerEvents: 'none',
    }}
  />
);
