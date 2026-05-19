import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {TemplateAsset, TemplateBackground, TemplateFitMode, TemplateIntensity, TemplateProps, TemplateRenderPlan} from '../types';

export type {TemplateProps} from '../types';

export const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export const getAssetSrc = (assetPath: string): string => {
  if (
    assetPath.startsWith('/') ||
    assetPath.startsWith('file:') ||
    assetPath.startsWith('http://') ||
    assetPath.startsWith('https://')
  ) {
    return assetPath;
  }

  return staticFile(assetPath);
};

export const getPrimaryAsset = (plan: TemplateRenderPlan): TemplateAsset => plan.assets[0];

export const getIntensityMultiplier = (intensity: TemplateIntensity | undefined): number => {
  switch (intensity) {
    case 'low':
      return 0.78;
    case 'high':
      return 1.25;
    case 'medium':
    default:
      return 1;
  }
};

export interface IntensityConfig {
  zoomAmount: number;
  motionAmount: number;
  shadowStrength: number;
  animationSpeed: number;
  blurAmount: number;
}

export const getIntensityConfig = (intensity: TemplateIntensity | undefined): IntensityConfig => {
  switch (intensity) {
    case 'low':
      return {
        zoomAmount: 0.035,
        motionAmount: 0.72,
        shadowStrength: 0.16,
        animationSpeed: 0.9,
        blurAmount: 24,
      };
    case 'high':
      return {
        zoomAmount: 0.085,
        motionAmount: 1.22,
        shadowStrength: 0.3,
        animationSpeed: 1.14,
        blurAmount: 42,
      };
    case 'medium':
    default:
      return {
        zoomAmount: 0.055,
        motionAmount: 1,
        shadowStrength: 0.22,
        animationSpeed: 1,
        blurAmount: 34,
      };
  }
};

export const safeSpring = ({
  frame,
  fps,
  delay = 0,
  durationInFrames,
  damping = 22,
  stiffness = 95,
  mass = 0.9,
}: {
  frame: number;
  fps: number;
  delay?: number;
  durationInFrames?: number;
  damping?: number;
  stiffness?: number;
  mass?: number;
}): number =>
  clamp(
    spring({
      frame: Math.max(0, frame - delay),
      fps,
      durationInFrames,
      config: {
        damping,
        stiffness,
        mass,
      },
    }),
    0,
    1,
  );

export const getFitMode = (plan: TemplateRenderPlan, fallback: TemplateFitMode = 'contain'): TemplateFitMode =>
  plan.options?.fit ?? fallback;

export const getBackgroundMode = (plan: TemplateRenderPlan): TemplateBackground => {
  if (plan.options?.background) {
    return plan.options.background;
  }

  switch (plan.templateId) {
    case 'CinematicDepthTemplate':
    case 'PortraitFocusTemplate':
    case 'ProductHeroTemplate':
    case 'PosterImpactTemplate':
    case 'SafeKenBurnsTemplate':
      return 'blur';
    case 'ScreenshotScanTemplate':
    case 'DocumentFocusTemplate':
      return 'solid';
    default:
      return 'gradient';
  }
};

export const getCaptionLines = (plan: TemplateRenderPlan): string[] => plan.text?.captions ?? [];

export const getProgress = (frame: number, durationInFrames: number): number =>
  clamp(frame / Math.max(1, durationInFrames - 1), 0, 1);

export interface GridCell {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const buildGridLayout = (
  itemCount: number,
  width: number,
  height: number,
  gap = 28,
  outerPadding = 72,
): GridCell[] => {
  const columns = itemCount <= 2 ? 2 : itemCount <= 4 ? 2 : itemCount <= 6 ? 3 : 4;
  const rows = Math.max(1, Math.ceil(itemCount / columns));
  const availableWidth = width - outerPadding * 2 - gap * (columns - 1);
  const availableHeight = height - outerPadding * 2 - gap * (rows - 1);
  const cellWidth = availableWidth / columns;
  const cellHeight = availableHeight / rows;

  return Array.from({length: itemCount}, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    return {
      left: outerPadding + column * (cellWidth + gap),
      top: outerPadding + row * (cellHeight + gap),
      width: cellWidth,
      height: cellHeight,
    };
  });
};

const BackgroundLayer: React.FC<{plan: TemplateRenderPlan; asset?: TemplateAsset}> = ({plan, asset}) => {
  const mode = getBackgroundMode(plan);

  if (mode === 'none') {
    return <AbsoluteFill style={{backgroundColor: '#0d1118'}} />;
  }

  if (mode === 'solid') {
    return (
      <AbsoluteFill
        style={{
          background: 'linear-gradient(135deg, #edf5ff 0%, #e5f1ff 35%, #dcecff 100%)',
        }}
      />
    );
  }

  if (mode === 'blur' && asset) {
    return (
      <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#eff6ff'}}>
        <Img
          src={getAssetSrc(asset.path)}
          style={{
            position: 'absolute',
            inset: -80,
            width: 'calc(100% + 160px)',
            height: 'calc(100% + 160px)',
            objectFit: 'cover',
            filter: 'blur(36px) saturate(1.12) brightness(0.94)',
            transform: 'scale(1.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(237,244,255,0.72))',
          }}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 18% 20%, rgba(105, 170, 255, 0.18), transparent 30%), radial-gradient(circle at 82% 18%, rgba(178, 157, 255, 0.18), transparent 28%), linear-gradient(135deg, #f6fbff 0%, #edf6ff 48%, #e4f0ff 100%)',
      }}
    />
  );
};

export const TemplateShell: React.FC<{
  plan: TemplateRenderPlan;
  asset?: TemplateAsset;
  children: React.ReactNode;
  accentColor?: string;
  showDefaultText?: boolean;
}> = ({plan, asset, children, accentColor = '#79b7ff', showDefaultText = true}) => {
  const captions = getCaptionLines(plan);

  return (
    <AbsoluteFill style={{fontFamily: 'Helvetica, Arial, sans-serif', color: '#17304b', overflow: 'hidden'}}>
      <BackgroundLayer plan={plan} asset={asset} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.08) 58%, rgba(231, 240, 255, 0.34) 100%)',
        }}
      />
      {children}
      {showDefaultText && (plan.text?.title || plan.text?.subtitle) && (
        <div
          style={{
            position: 'absolute',
            top: 54,
            left: 56,
            right: 56,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {plan.text?.title && (
            <div
              style={{
                fontSize: 56,
                lineHeight: 1.05,
                fontWeight: 800,
                letterSpacing: -1.4,
                color: '#17304b',
                textShadow: '0 8px 28px rgba(255,255,255,0.18)',
              }}
            >
              {plan.text.title}
            </div>
          )}
          {plan.text?.subtitle && (
            <div
              style={{
                maxWidth: '72%',
                fontSize: 26,
                lineHeight: 1.35,
                color: 'rgba(30, 58, 95, 0.78)',
              }}
            >
              {plan.text.subtitle}
            </div>
          )}
          <div
            style={{
              width: 96,
              height: 5,
              borderRadius: 999,
              background: accentColor,
              boxShadow: `0 0 24px ${accentColor}55`,
            }}
          />
        </div>
      )}
      {captions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 56,
            right: 56,
            bottom: 42,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            alignItems: 'flex-end',
          }}
        >
          {captions.slice(0, 3).map((caption, index) => (
            <div
              key={`${caption}-${index}`}
              style={{
                maxWidth: '100%',
                padding: '14px 18px',
                borderRadius: 18,
                background: 'rgba(255,255,255,0.58)',
                border: '1px solid rgba(121, 183, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 18px 40px rgba(93, 128, 165, 0.12)',
                fontSize: 22,
                lineHeight: 1.35,
                color: '#214264',
              }}
            >
              {caption}
            </div>
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const BackgroundBlurLayer: React.FC<{
  asset: TemplateAsset;
  blurAmount?: number;
  scale?: number;
  brightness?: number;
  opacity?: number;
  x?: number;
  y?: number;
  vignette?: boolean;
}> = ({asset, blurAmount = 34, scale = 1.16, brightness = 0.72, opacity = 1, x = 0, y = 0, vignette = true}) => (
  <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#111827'}}>
    <Img
      src={getAssetSrc(asset.path)}
      style={{
        position: 'absolute',
        inset: -120,
        width: 'calc(100% + 240px)',
        height: 'calc(100% + 240px)',
        objectFit: 'cover',
        opacity,
        filter: `blur(${blurAmount}px) brightness(${brightness}) saturate(1.18)`,
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
      }}
    />
    {vignette && <VignetteOverlay strength={0.52} />}
  </AbsoluteFill>
);

export const VignetteOverlay: React.FC<{strength?: number; color?: string}> = ({strength = 0.48, color = '0, 0, 0'}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(circle at 50% 44%, rgba(${color}, 0) 42%, rgba(${color}, ${strength * 0.52}) 78%, rgba(${color}, ${strength}) 100%)`,
    }}
  />
);

export const SoftGradientOverlay: React.FC<{
  variant?: 'warm' | 'cool' | 'mint' | 'dark';
  opacity?: number;
}> = ({variant = 'cool', opacity = 1}) => {
  const gradients = {
    warm:
      'linear-gradient(135deg, rgba(255, 207, 133, 0.24), transparent 42%), linear-gradient(20deg, transparent 38%, rgba(255, 122, 89, 0.16))',
    cool:
      'linear-gradient(135deg, rgba(93, 172, 255, 0.22), transparent 42%), linear-gradient(25deg, transparent 34%, rgba(135, 120, 255, 0.16))',
    mint:
      'linear-gradient(135deg, rgba(42, 226, 190, 0.2), transparent 44%), linear-gradient(20deg, transparent 36%, rgba(255, 224, 131, 0.16))',
    dark:
      'linear-gradient(180deg, rgba(2, 8, 23, 0.18), transparent 38%, rgba(2, 8, 23, 0.36))',
  };

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        opacity,
        background: gradients[variant],
      }}
    />
  );
};

export const FloatingImageCard: React.FC<{
  src: string;
  width: string | number;
  height: string | number;
  fit?: TemplateFitMode;
  x?: number;
  y?: number;
  rotate?: number;
  scale?: number;
  borderRadius?: number;
  shadowStrength?: number;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({
  src,
  width,
  height,
  fit = 'cover',
  x = 0,
  y = 0,
  rotate = 0,
  scale = 1,
  borderRadius = 30,
  shadowStrength = 0.22,
  style,
  imgStyle,
  children,
}) => (
  <div
    style={{
      width,
      height,
      position: 'relative',
      borderRadius,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.54)',
      boxShadow: `0 30px 90px rgba(22, 44, 76, ${shadowStrength})`,
      background: 'rgba(255,255,255,0.72)',
      transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
      ...style,
    }}
  >
    <Img
      src={src}
      style={{
        width: '100%',
        height: '100%',
        objectFit: fit,
        display: 'block',
        ...imgStyle,
      }}
    />
    {children}
  </div>
);

export const TitleBlock: React.FC<{
  plan: TemplateRenderPlan;
  position?: 'top-left' | 'bottom-left' | 'bottom-center';
  color?: string;
  delay?: number;
  maxWidth?: number | string;
  accentColor?: string;
  compact?: boolean;
}> = ({plan, position = 'bottom-left', color = '#f8fbff', delay = 18, maxWidth = '62%', accentColor = '#79b7ff', compact = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (!plan.text?.title && !plan.text?.subtitle) {
    return null;
  }

  const enter = safeSpring({frame, fps, delay, damping: 24, stiffness: 82});
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const translateY = interpolate(enter, [0, 1], [26, 0]);
  const base: React.CSSProperties = {
    position: 'absolute',
    maxWidth,
    opacity,
    transform: `translateY(${translateY}px)`,
    display: 'flex',
    flexDirection: 'column',
    gap: compact ? 8 : 12,
    color,
    textShadow: '0 10px 34px rgba(0,0,0,0.22)',
    pointerEvents: 'none',
  };
  const positionStyle: Record<NonNullable<Parameters<typeof TitleBlock>[0]['position']>, React.CSSProperties> = {
    'top-left': {top: 56, left: 62},
    'bottom-left': {left: 62, bottom: 58},
    'bottom-center': {left: 72, right: 72, bottom: 58, maxWidth: 'none', alignItems: 'center', textAlign: 'center'},
  };

  return (
    <div style={{...base, ...positionStyle[position]}}>
      {plan.text?.title && (
        <div
          style={{
            fontSize: compact ? 34 : 46,
            lineHeight: 1.04,
            fontWeight: 850,
          }}
        >
          {plan.text.title}
        </div>
      )}
      {plan.text?.subtitle && (
        <div
          style={{
            fontSize: compact ? 20 : 24,
            lineHeight: 1.32,
            color,
            opacity: 0.82,
          }}
        >
          {plan.text.subtitle}
        </div>
      )}
      <div
        style={{
          width: compact ? 72 : 96,
          height: 5,
          borderRadius: 999,
          background: accentColor,
          boxShadow: `0 0 26px ${accentColor}66`,
        }}
      />
    </div>
  );
};

export const FloatingCard: React.FC<{
  children: React.ReactNode;
  width: string | number;
  height: string | number;
  style?: React.CSSProperties;
}> = ({children, width, height, style}) => (
  <div
    style={{
      width,
      height,
      position: 'relative',
      borderRadius: 34,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.52)',
      boxShadow: '0 28px 80px rgba(78, 112, 153, 0.18)',
      background: 'rgba(255,255,255,0.5)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const SweepHighlight: React.FC<{color?: string; opacity?: number}> = ({color = '#ffffff', opacity = 0.22}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const left = interpolate(frame, [0, durationInFrames], [-42, 122]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: `${left}%`,
          width: '32%',
          height: '140%',
          background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 18%, ${color}${Math.round(opacity * 255)
            .toString(16)
            .padStart(2, '0')} 48%, rgba(255,255,255,0.03) 82%, transparent 100%)`,
          transform: 'rotate(12deg)',
          filter: 'blur(10px)',
        }}
      />
    </div>
  );
};

export const EnterScale = ({
  from = 0.9,
  to = 1,
  damping = 14,
}: {
  from?: number;
  to?: number;
  damping?: number;
}): number => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return from + (to - from) * spring({frame, fps, config: {damping}});
};

export const DefaultTemplateFallback: React.FC<TemplateProps> = ({plan}) => (
  <TemplateShell plan={plan} asset={getPrimaryAsset(plan)}>
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontSize: 42, fontWeight: 700, color: '#214264'}}>Template unavailable</div>
    </AbsoluteFill>
  </TemplateShell>
);
