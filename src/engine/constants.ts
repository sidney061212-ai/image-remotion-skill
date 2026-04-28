import type {AssetType, Intent, TemplateId} from '../types';

export const INTENT_TEMPLATE_MAP: Record<Intent, TemplateId[]> = {
  HOOK: ['T01_HookZoomHit', 'T02_BigHeadlineSlam', 'T14_FreezePunch'],
  CLAIM: ['T02_BigHeadlineSlam', 'T10_BulletStackReveal', 'T11_EvidencePin'],
  FOCUS: ['T03_FocusBoxPush', 'T04_SpotlightDim', 'T11_EvidencePin'],
  EVIDENCE: ['T03_FocusBoxPush', 'T06_ScreenshotScan', 'T11_EvidencePin', 'T12_DataPulse'],
  COMPARE: ['T08_SplitCompare', 'T09_SwipeCompare'],
  STEP: ['T05_RegionHop', 'T10_BulletStackReveal'],
  DETAIL: ['T07_MagnifierTrack', 'T03_FocusBoxPush', 'T04_SpotlightDim'],
  NUMBER: ['T12_DataPulse', 'T14_FreezePunch'],
  EMOTION: ['T13_ParallaxDepth', 'T16_OutroLoopCard'],
  ENDING: ['T16_OutroLoopCard', 'T14_FreezePunch', 'T02_BigHeadlineSlam'],
};

export const ASSET_TEMPLATE_MAP: Record<string, TemplateId[]> = {
  portrait: ['T01_HookZoomHit', 'T02_BigHeadlineSlam', 'T13_ParallaxDepth', 'T16_OutroLoopCard'],
  screenshot: ['T03_FocusBoxPush', 'T04_SpotlightDim', 'T06_ScreenshotScan', 'T07_MagnifierTrack', 'T11_EvidencePin'],
  document: ['T03_FocusBoxPush', 'T04_SpotlightDim', 'T06_ScreenshotScan', 'T10_BulletStackReveal', 'T11_EvidencePin'],
  chart: ['T03_FocusBoxPush', 'T11_EvidencePin', 'T12_DataPulse', 'T05_RegionHop'],
  poster: ['T01_HookZoomHit', 'T02_BigHeadlineSlam', 'T13_ParallaxDepth', 'T14_FreezePunch'],
  product: ['T01_HookZoomHit', 'T13_ParallaxDepth', 'T11_EvidencePin'],
  collage: ['T05_RegionHop', 'T08_SplitCompare', 'T10_BulletStackReveal'],
};

export const TEMPLATE_DURATIONS: Record<TemplateId, [number, number]> = {
  T01_HookZoomHit: [0.5, 1.2],
  T02_BigHeadlineSlam: [0.6, 1.5],
  T03_FocusBoxPush: [1.0, 2.5],
  T04_SpotlightDim: [1.0, 2.0],
  T05_RegionHop: [1.8, 4.5],
  T06_ScreenshotScan: [1.5, 3.0],
  T07_MagnifierTrack: [1.2, 2.5],
  T08_SplitCompare: [1.5, 3.0],
  T09_SwipeCompare: [1.0, 2.0],
  T10_BulletStackReveal: [1.5, 3.5],
  T11_EvidencePin: [1.0, 2.0],
  T12_DataPulse: [0.8, 1.8],
  T13_ParallaxDepth: [1.5, 3.5],
  T14_FreezePunch: [0.4, 1.0],
  T15_BeatMicroCut: [0.8, 2.0],
  T16_OutroLoopCard: [1.2, 2.5],
};

export const DEFAULT_FPS = 30;
export const DEFAULT_ASSET_WIDTH = 1080;
export const DEFAULT_ASSET_HEIGHT = 1920;

export const TEMPLATE_SHORT_NAMES: Record<TemplateId, string> = {
  T01_HookZoomHit: 'T01',
  T02_BigHeadlineSlam: 'T02',
  T03_FocusBoxPush: 'T03',
  T04_SpotlightDim: 'T04',
  T05_RegionHop: 'T05',
  T06_ScreenshotScan: 'T06',
  T07_MagnifierTrack: 'T07',
  T08_SplitCompare: 'T08',
  T09_SwipeCompare: 'T09',
  T10_BulletStackReveal: 'T10',
  T11_EvidencePin: 'T11',
  T12_DataPulse: 'T12',
  T13_ParallaxDepth: 'T13',
  T14_FreezePunch: 'T14',
  T15_BeatMicroCut: 'T15',
  T16_OutroLoopCard: 'T16',
};

export const PACE_DURATION_FACTOR = {
  fast: 0.9,
  medium: 1,
  steady: 1.15,
} as const;

export const KNOWN_ASSET_TYPES: AssetType[] = ['portrait', 'screenshot', 'document', 'chart', 'poster', 'product', 'collage'];
