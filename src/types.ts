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

export type TemplateId =
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
  template: TemplateId;
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
      recommendedTemplate: TemplateId;
    }>;
    primaryTemplates: TemplateId[];
  };
}

export interface TemplateSceneProps {
  scene: Scene;
  asset?: Asset;
  secondaryAsset?: Asset;
}
