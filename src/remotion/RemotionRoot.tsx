import React from 'react';
import {Composition} from 'remotion';
import exampleInput from '../../examples/example-input.json';
import {buildStoryboard} from '../engine/storyboard';
import {StoryboardVideo} from './StoryboardVideo';
import type {InputPackage} from '../types';

const storyboard = buildStoryboard(exampleInput as InputPackage);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="StoryboardDemo"
        component={() => <StoryboardVideo storyboard={storyboard} assets={exampleInput.assets} />}
        durationInFrames={Math.ceil(storyboard.videoMeta.duration * storyboard.videoMeta.fps)}
        fps={storyboard.videoMeta.fps}
        width={1080}
        height={1920}
      />
    </>
  );
};

export default RemotionRoot;
