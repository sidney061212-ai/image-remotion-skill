import React from 'react';
import {registerRoot} from 'remotion';
import {InfogramRoot} from './InfogramRoot';
import {MotionPlanRoot} from './MotionPlanRoot';
import {RemotionRoot} from './RemotionRoot';

const Root: React.FC = () =>
  React.createElement(
    React.Fragment,
    null,
    React.createElement(MotionPlanRoot),
    React.createElement(InfogramRoot),
    React.createElement(RemotionRoot),
  );

registerRoot(Root);
