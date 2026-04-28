import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {
  BeatMicroCut,
  BigHeadlineSlam,
  BulletStackReveal,
  DataPulse,
  EvidencePin,
  FocusBoxPush,
  FreezePunch,
  HookZoomHit,
  MagnifierTrack,
  OutroLoopCard,
  ParallaxDepth,
  RegionHop,
  ScreenshotScan,
  SplitCompare,
  SpotlightDim,
  SwipeCompare,
} from '../components';
import type {Asset, Storyboard, TemplateSceneProps} from '../types';

const TEMPLATE_COMPONENTS = {
  T01_HookZoomHit: HookZoomHit,
  T02_BigHeadlineSlam: BigHeadlineSlam,
  T03_FocusBoxPush: FocusBoxPush,
  T04_SpotlightDim: SpotlightDim,
  T05_RegionHop: RegionHop,
  T06_ScreenshotScan: ScreenshotScan,
  T07_MagnifierTrack: MagnifierTrack,
  T08_SplitCompare: SplitCompare,
  T09_SwipeCompare: SwipeCompare,
  T10_BulletStackReveal: BulletStackReveal,
  T11_EvidencePin: EvidencePin,
  T12_DataPulse: DataPulse,
  T13_ParallaxDepth: ParallaxDepth,
  T14_FreezePunch: FreezePunch,
  T15_BeatMicroCut: BeatMicroCut,
  T16_OutroLoopCard: OutroLoopCard,
} as const;

const resolveAssets = (assets: Asset[] | undefined, assetRef?: string) => {
  const primary = assets?.find((a) => a.id === assetRef) ?? assets?.[0];
  const secondary = assets?.[1] ?? assets?.[0];
  return {primary, secondary};
};

export const StoryboardVideo: React.FC<{storyboard: Storyboard; assets?: Asset[]}> = ({storyboard, assets}) => {
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {storyboard.scenes.map((scene) => {
        const Component = TEMPLATE_COMPONENTS[scene.template];
        const {primary, secondary} = resolveAssets(assets, scene.assetRef);
        const durationInFrames = Math.max(1, Math.round((scene.end - scene.start) * storyboard.videoMeta.fps));
        const from = Math.round(scene.start * storyboard.videoMeta.fps);
        const props: TemplateSceneProps = {scene, asset: primary, secondaryAsset: secondary};
        return (
          <Sequence key={scene.sceneId} from={from} durationInFrames={durationInFrames}>
            <Component {...props} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
