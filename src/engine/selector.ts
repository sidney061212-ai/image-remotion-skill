import {ASSET_TEMPLATE_MAP, INTENT_TEMPLATE_MAP, TEMPLATE_DURATIONS} from './constants';
import type {Asset, Intent, LegacyTemplateId, Scene, ScriptLine} from '../types';

const hookRegex = /(很多人|第一眼|你以为|其实不是|别再|千万别)/;
const claimRegex = /(核心|关键点|本质|真正的问题|结论)/;
const focusRegex = /(看这里|重点在|这一行|这一块|右上角|左边|右侧)/;
const evidenceRegex = /(证据|数据就在|你看这一句|变化才是关键)/;
const compareRegex = /(左边|右边|对比|一个是|另一个是|前后)/;
const stepRegex = /(第一|第二|第三|先看|再看|分三步)/;
const detailRegex = /(细节|忽略|小地方|漏洞|陷阱)/;
const numberRegex = /(\d+[%分万亿年月日时点名]|第\d+|增长了)/;
const endingRegex = /(最后记住|结论只有一个|记住这一点|最后答案)/;

export const inferIntent = (line: ScriptLine): Intent => {
  if (line.intent) return line.intent;
  const text = line.text;
  if (endingRegex.test(text)) return 'ENDING';
  if (compareRegex.test(text)) return 'COMPARE';
  if (stepRegex.test(text)) return 'STEP';
  if (focusRegex.test(text)) return 'FOCUS';
  if (evidenceRegex.test(text)) return 'EVIDENCE';
  if (detailRegex.test(text)) return 'DETAIL';
  if (numberRegex.test(text)) return 'NUMBER';
  if (claimRegex.test(text)) return 'CLAIM';
  if (hookRegex.test(text)) return 'HOOK';
  return 'CLAIM';
};

export const inferVisualTarget = (
  intent: Intent,
  asset?: Asset,
): 'whole-image' | 'single-region' | 'multi-region' | 'compare' | 'text-only' => {
  if (intent === 'COMPARE') return 'compare';
  if (!asset) return 'text-only';
  const count = asset.focusRegions?.length ?? 0;
  if (count > 1 && intent === 'STEP') return 'multi-region';
  if (count > 0 && ['FOCUS', 'EVIDENCE', 'DETAIL'].includes(intent)) return 'single-region';
  return 'whole-image';
};

export const selectTemplate = (intent: Intent, asset?: Asset): LegacyTemplateId => {
  const intentOptions = INTENT_TEMPLATE_MAP[intent];
  if (!asset) return intentOptions[0];

  const assetOptions = ASSET_TEMPLATE_MAP[asset.type] ?? [];
  const matched = intentOptions.find((item) => assetOptions.includes(item));
  if (matched) {
    if (!asset.focusRegions?.length && ['T03_FocusBoxPush', 'T04_SpotlightDim', 'T05_RegionHop', 'T07_MagnifierTrack', 'T11_EvidencePin'].includes(matched)) {
      return 'T02_BigHeadlineSlam';
    }
    return matched;
  }

  const fallback = intentOptions[0];
  if (!asset.focusRegions?.length && ['T03_FocusBoxPush', 'T04_SpotlightDim', 'T05_RegionHop', 'T07_MagnifierTrack', 'T11_EvidencePin'].includes(fallback)) {
    return 'T02_BigHeadlineSlam';
  }
  return fallback;
};

export const estimateSceneDuration = (
  template: LegacyTemplateId,
  pace: 'fast' | 'medium' | 'steady',
  textLength: number,
): number => {
  const [min, max] = TEMPLATE_DURATIONS[template];
  const base = min + Math.min(1, textLength / 20) * (max - min) * 0.75;
  const factor = pace === 'fast' ? 0.9 : pace === 'steady' ? 1.15 : 1;
  return Number(Math.max(min, Math.min(max, base * factor)).toFixed(2));
};

export const getPrimaryTemplates = (scenes: Scene[]): LegacyTemplateId[] => {
  const result: LegacyTemplateId[] = [];
  for (const scene of scenes) {
    if (!result.includes(scene.template)) {
      result.push(scene.template);
    }
  }
  return result;
};
