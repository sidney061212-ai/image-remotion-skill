export type Intent =
  | 'HOOK'
  | 'CLAIM'
  | 'FOCUS'
  | 'EVIDENCE'
  | 'COMPARE'
  | 'STEP'
  | 'DETAIL'
  | 'NUMBER'
  | 'EMOTION'
  | 'ENDING';

export type AssetType =
  | 'portrait'
  | 'screenshot'
  | 'document'
  | 'chart'
  | 'poster'
  | 'product'
  | 'collage'
  | string;

export type LegacyTemplateId =
  | 'T01_HookZoomHit'
  | 'T02_BigHeadlineSlam'
  | 'T03_FocusBoxPush'
  | 'T04_SpotlightDim'
  | 'T05_RegionHop'
  | 'T06_ScreenshotScan'
  | 'T07_MagnifierTrack'
  | 'T08_SplitCompare'
  | 'T09_SwipeCompare'
  | 'T10_BulletStackReveal'
  | 'T11_EvidencePin'
  | 'T12_DataPulse'
  | 'T13_ParallaxDepth'
  | 'T14_FreezePunch'
  | 'T15_BeatMicroCut'
  | 'T16_OutroLoopCard';

export type ImageWorkflowMode = 'infographic' | 'xhs-card-series' | 'direct-assets-to-video';

export type ReferenceUsage = 'direct' | 'style' | 'palette';

export type ImageBackend =
  | 'native-imagegen'
  | 'baoyu-imagine'
  | 'openai'
  | 'google'
  | 'azure'
  | 'openrouter'
  | 'dashscope'
  | 'zai'
  | 'minimax'
  | 'jimeng'
  | 'seedream'
  | 'replicate'
  | string;

export interface FocusRegion {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  importance?: number;
}

export interface Asset {
  id: string;
  type: AssetType;
  path: string;
  description?: string;
  width?: number;
  height?: number;
  focusRegions?: FocusRegion[];
}

export interface ScriptLine {
  id: string;
  text: string;
  intent?: Intent;
  priority?: number;
}

export interface Constraints {
  maxSceneCount?: number;
  maxCaptionCharsPerLine?: number;
  allowGlitch?: boolean;
  allowParallax?: boolean;
  needSubtitles?: boolean;
}

export interface ProjectMeta {
  title: string;
  aspectRatio: '9:16';
  style: string;
  pace: 'fast' | 'medium' | 'steady';
  durationTarget: number;
}

export interface InputPackage {
  project: ProjectMeta;
  script: ScriptLine[];
  assets: Asset[];
  constraints?: Constraints;
}

export interface ReferenceImage {
  refId: string;
  path: string;
  usage: ReferenceUsage;
  description?: string;
}

export interface ImagePromptRecord {
  id: string;
  type: 'cover' | 'card' | 'infographic' | 'supporting-image';
  promptFile: string;
  aspectRatio: string;
  language?: string;
  references?: ReferenceImage[];
  promptSummary?: string;
}

export interface ImageGenerationPlan {
  mode: ImageWorkflowMode;
  topic: string;
  layout?: string;
  style?: string;
  aspectRatio: string;
  language?: string;
  backend: ImageBackend;
  promptRecords: ImagePromptRecord[];
  confirmationRequired: boolean;
  notes?: string[];
}

export interface ApprovedGeneratedAsset extends Asset {
  source: 'generated' | 'uploaded';
  approved: boolean;
  promptRecordId?: string;
  order?: number;
}

export interface ImageToVideoPackage {
  mode: ImageWorkflowMode;
  plan?: ImageGenerationPlan;
  approvedAssets: ApprovedGeneratedAsset[];
  script: ScriptLine[];
  project: ProjectMeta;
  constraints?: Constraints;
}

export interface Scene {
  sceneId: string;
  start: number;
  end: number;
  scriptRef?: string;
  assetRef?: string;
  template: LegacyTemplateId;
  focusRegion?: string;
  caption?: string;
  bullets?: string[];
  motion?: Record<string, unknown>;
  overlay?: Record<string, unknown>;
  transitionIn?: string;
  transitionOut?: string;
}

export interface Storyboard {
  videoMeta: {
    duration: number;
    aspectRatio: '9:16';
    theme: string;
    fps: number;
  };
  scenes: Scene[];
  analysis?: {
    scriptSegments: Array<{
      id: string;
      text: string;
      intent: Intent;
      visualTarget: 'whole-image' | 'single-region' | 'multi-region' | 'compare' | 'text-only';
      recommendedTemplate: LegacyTemplateId;
    }>;
    primaryTemplates: LegacyTemplateId[];
  };
}

export interface TemplateSceneProps {
  scene: Scene;
  asset?: Asset;
  secondaryAsset?: Asset;
}

export type MotionRecipeId =
  | 'INFOGRAPHIC_OVERVIEW_TO_KEYPOINTS'
  | 'INFOGRAPHIC_STEP_SCAN'
  | 'STORYBOARD_PANEL_PUSH'
  | 'STORYBOARD_PANEL_HOP'
  | 'SCREENSHOT_TOP_TO_BOTTOM_SCAN'
  | 'COMPARISON_LEFT_RIGHT_REVEAL'
  | 'POSTER_HERO_DEPTH_PUSH'
  | 'COLLAGE_ASSEMBLE'
  | 'DOCUMENT_LINE_SPOTLIGHT'
  | 'PHOTO_KEN_BURNS';

export type MotionGoal =
  | 'animate-single-image'
  | 'animate-infographic'
  | 'animate-storyboard'
  | 'animate-screenshot'
  | 'animate-poster'
  | 'animate-collage'
  | 'animate-comparison'
  | 'animate-document'
  | 'animate-photo';

export type TargetPlatform =
  | 'douyin'
  | 'tiktok'
  | 'xiaohongshu'
  | 'youtube-shorts'
  | 'bilibili'
  | 'presentation'
  | 'generic';

export type MotionStyle =
  | 'clean'
  | 'tech'
  | 'cinematic'
  | 'energetic'
  | 'documentary'
  | 'minimal';

export type ImageKind =
  | 'infographic'
  | 'storyboard'
  | 'screenshot'
  | 'document'
  | 'chart'
  | 'poster'
  | 'portrait'
  | 'product'
  | 'collage'
  | 'comparison'
  | 'photo'
  | 'unknown';

export type LayoutKind =
  | 'single-focus'
  | 'vertical-sections'
  | 'horizontal-sections'
  | 'grid'
  | 'comic-panels'
  | 'timeline'
  | 'comparison-split'
  | 'dense-document'
  | 'hero-title'
  | 'mixed';

export type RegionRole =
  | 'title'
  | 'subtitle'
  | 'hero'
  | 'number'
  | 'chart'
  | 'step'
  | 'panel'
  | 'comparison-left'
  | 'comparison-right'
  | 'quote'
  | 'cta'
  | 'detail'
  | 'background';

export type MotionHint =
  | 'hold'
  | 'push-in'
  | 'pull-out'
  | 'pan-to'
  | 'scan'
  | 'hop'
  | 'whip'
  | 'reveal'
  | 'compare';

export interface AiVisualRegion {
  id: string;
  role?: RegionRole;
  label?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  importance?: number;
  order?: number;
  motionHint?: MotionHint;
}

export interface AiMotionRequest {
  version: '1.0';
  task: {
    goal: MotionGoal;
    platform?: TargetPlatform;
    durationSeconds: number;
    aspectRatio: '9:16' | '16:9' | '1:1';
    style?: MotionStyle;
    preferredRecipe?: MotionRecipeId;
  };
  asset: {
    id: string;
    path: string;
    width: number;
    height: number;
    kind: ImageKind;
    description?: string;
  };
  visualStructure: {
    layout: LayoutKind;
    regions: AiVisualRegion[];
    readingOrder: string[];
    primaryRegionId?: string;
  };
  script?: {
    title?: string;
    captions?: Array<{
      text: string;
      start?: number;
      end?: number;
      attachToRegionId?: string;
    }>;
  };
  constraints?: {
    avoidCroppingText?: boolean;
    avoidFastMotion?: boolean;
    allowWhipPan?: boolean;
    allowBlur?: boolean;
    maxZoom?: number;
    minHoldSeconds?: number;
  };
}

export type CameraTarget =
  | {type: 'full'}
  | {type: 'region'; regionId: string}
  | {type: 'point'; cx: number; cy: number};

export interface CameraKeyframe {
  time: number;
  target: CameraTarget;
  scale: number;
  easing?: 'linear' | 'easeInOut' | 'spring' | 'hold' | 'whip';
  label?: string;
}

export interface OverlayEvent {
  time: number;
  duration: number;
  type:
    | 'focus-box'
    | 'spotlight'
    | 'caption'
    | 'number-pulse'
    | 'label'
    | 'wipe-line'
    | 'scan-line';
  regionId?: string;
  text?: string;
  style?: Record<string, unknown>;
}

export interface MotionPlan {
  version: '2.0';
  sourceRequestVersion: '1.0';
  image: string;
  imageWidth: number;
  imageHeight: number;
  outputWidth: number;
  outputHeight: number;
  fps: number;
  durationSeconds: number;
  recipeId: MotionRecipeId;
  visualStructure: AiMotionRequest['visualStructure'];
  camera: CameraKeyframe[];
  overlays: OverlayEvent[];
  renderOptions?: {
    allowBlur?: boolean;
    allowWhipPan?: boolean;
  };
  warnings?: string[];
}

export type ImageCategory =
  | 'infographic'
  | 'landscape'
  | 'photo'
  | 'portrait'
  | 'product'
  | 'screenshot'
  | 'poster'
  | 'storyboard'
  | 'collage'
  | 'multi-image'
  | 'document'
  | 'unknown';

export type TemplateEffectStyle =
  | 'clean-zoom'
  | 'cinematic-depth'
  | 'tech-scan'
  | 'card-stack'
  | 'grid-shuffle'
  | 'photo-wall'
  | 'split-compare'
  | 'parallax'
  | 'minimal'
  | 'product-hero'
  | 'poster-impact';

export type TemplateIntensity = 'low' | 'medium' | 'high';

export type TemplateBackground = 'blur' | 'solid' | 'gradient' | 'none';

export type TemplateFitMode = 'contain' | 'cover';

export interface TemplateAsset {
  id: string;
  path: string;
  width?: number;
  height?: number;
  label?: string;
}

export interface TemplateRenderRequest {
  version: '1.0';
  task: {
    imageCategory: ImageCategory;
    effectStyle?: TemplateEffectStyle;
    durationSeconds: number;
    aspectRatio: '9:16' | '16:9' | '1:1';
    fps?: number;
    preferredTemplate?: TemplateIdV2;
  };
  assets: TemplateAsset[];
  text?: {
    title?: string;
    subtitle?: string;
    captions?: string[];
  };
  options?: {
    intensity?: TemplateIntensity;
    loopable?: boolean;
    background?: TemplateBackground;
    fit?: TemplateFitMode;
    safeMode?: boolean;
  };
}

export type TemplateIdV2 =
  | 'InfographicZoomTemplate'
  | 'CinematicDepthTemplate'
  | 'PortraitFocusTemplate'
  | 'ProductHeroTemplate'
  | 'ScreenshotScanTemplate'
  | 'PosterImpactTemplate'
  | 'StoryboardGridTemplate'
  | 'PhotoWallTemplate'
  | 'CardStackTemplate'
  | 'GridShuffleTemplate'
  | 'DocumentFocusTemplate'
  | 'SafeKenBurnsTemplate';

export interface TemplateRenderPlan {
  version: '1.0';
  sourceRequestVersion: '1.0';
  templateId: TemplateIdV2;
  outputWidth: number;
  outputHeight: number;
  fps: number;
  durationSeconds: number;
  assets: TemplateAsset[];
  text?: TemplateRenderRequest['text'];
  options?: TemplateRenderRequest['options'];
  warnings?: string[];
}

export interface TemplateProps {
  plan: TemplateRenderPlan;
}

export type TemplateImageCategory = ImageCategory;
export type TemplateId = TemplateIdV2;
export type TemplatePlan = TemplateRenderPlan;
