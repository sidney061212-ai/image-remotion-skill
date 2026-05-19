/**
 * Legacy / experimental storyboard compiler.
 *
 * This path keeps the original script-intent -> T01-T16 template flow for
 * backwards compatibility, but the recommended AI-facing mainline now starts
 * from AiMotionRequest and compiles a MotionPlan instead.
 */
import {DEFAULT_FPS} from './constants';
import {estimateSceneDuration, getPrimaryTemplates, inferIntent, inferVisualTarget, selectTemplate} from './selector';
import type {Asset, FocusRegion, InputPackage, Scene, Storyboard, TemplateId} from '../types';

const pickAssetForIntent = (assets: Asset[], template: TemplateId): Asset | undefined => {
  if (template === 'T08_SplitCompare' || template === 'T09_SwipeCompare') {
    return assets[0];
  }
  return assets[0];
};

const pickRegion = (asset: Asset | undefined): FocusRegion | undefined => {
  if (!asset?.focusRegions?.length) return undefined;
  return [...asset.focusRegions].sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))[0];
};

const buildMotion = (template: TemplateId, region?: FocusRegion): Record<string, unknown> => {
  switch (template) {
    case 'T01_HookZoomHit':
      return {scaleFrom: 1, scaleTo: 1.12, shake: 0.6};
    case 'T03_FocusBoxPush':
      return {boxHighlight: true, scaleFrom: 1, scaleTo: 1.18, regionId: region?.id};
    case 'T04_SpotlightDim':
      return {dimBackground: true, regionId: region?.id};
    case 'T05_RegionHop':
      return {hopCount: 3};
    case 'T12_DataPulse':
      return {pulse: true, scaleFrom: 0.9, scaleTo: 1.15};
    case 'T14_FreezePunch':
      return {freeze: true, impact: 1};
    case 'T16_OutroLoopCard':
      return {loopZoom: true, scaleFrom: 1.04, scaleTo: 1.08};
    default:
      return {scaleFrom: 1, scaleTo: 1.04};
  }
};

const buildOverlay = (template: TemplateId, region?: FocusRegion): Record<string, unknown> | undefined => {
  if (template === 'T11_EvidencePin') {
    return {arrow: true, label: region?.label ?? '重点'};
  }
  return undefined;
};

export const buildStoryboard = (input: InputPackage): Storyboard => {
  const scenes: Scene[] = [];
  let cursor = 0;

  for (const [index, line] of input.script.entries()) {
    const intent = inferIntent(line);
    const draftTemplate = selectTemplate(intent, input.assets[0]);
    const asset = pickAssetForIntent(input.assets, draftTemplate);
    const template = selectTemplate(intent, asset);
    const region = pickRegion(asset);
    const duration = estimateSceneDuration(template, input.project.pace, line.text.length);

    const scene: Scene = {
      sceneId: `s${index + 1}`,
      start: Number(cursor.toFixed(2)),
      end: Number((cursor + duration).toFixed(2)),
      scriptRef: line.id,
      assetRef: asset?.id,
      template,
      focusRegion: region?.id,
      caption: line.text,
      transitionIn: index === 0 ? 'cut' : 'cut',
      transitionOut: index === input.script.length - 1 ? 'fade' : 'cut',
      motion: buildMotion(template, region),
      overlay: buildOverlay(template, region),
    };

    if (template === 'T10_BulletStackReveal') {
      scene.bullets = line.text.split(/[，。,.]/).map((item) => item.trim()).filter(Boolean).slice(0, 4);
    }

    if (template === 'T05_RegionHop') {
      scene.motion = {
        ...(scene.motion ?? {}),
        regionIds: asset?.focusRegions?.slice(0, 3).map((r) => r.id) ?? [],
      };
    }

    scenes.push(scene);
    cursor += duration;
  }

  const primaryTemplates = getPrimaryTemplates(scenes).slice(0, 3);
  const finalScenes = scenes.map((scene) => ({
    ...scene,
    template: primaryTemplates.includes(scene.template) ? scene.template : primaryTemplates[primaryTemplates.length - 1] ?? scene.template,
  }));

  return {
    videoMeta: {
      duration: Number((finalScenes.at(-1)?.end ?? 0).toFixed(2)),
      aspectRatio: '9:16',
      theme: input.project.style,
      fps: DEFAULT_FPS,
    },
    scenes: finalScenes,
    analysis: {
      scriptSegments: input.script.map((line) => {
        const intent = inferIntent(line);
        const asset = input.assets[0];
        return {
          id: line.id,
          text: line.text,
          intent,
          visualTarget: inferVisualTarget(intent, asset),
          recommendedTemplate: selectTemplate(intent, asset),
        };
      }),
      primaryTemplates,
    },
  };
};
