import React from 'react';
import {Composition, getInputProps} from 'remotion';
import type {MotionPlan} from '../types';
import {MotionPlanRenderer} from './MotionPlanRenderer';

interface MotionPlanInputProps {
  plan?: MotionPlan;
  allowBlur?: boolean;
  allowWhipPan?: boolean;
}

let fallbackPlan: MotionPlan | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  fallbackPlan = require('../../outputs/current-motion-plan.json') as MotionPlan;
} catch {
  fallbackPlan = null;
}

const EmptyState: React.FC = () => (
  <div style={{color: '#fff', fontSize: 42, padding: 80}}>No MotionPlan loaded</div>
);

const MotionPlanVideo: React.FC<MotionPlanInputProps> = ({plan, allowBlur, allowWhipPan}) => {
  const resolvedPlan = plan ?? fallbackPlan;
  if (!resolvedPlan) {
    return <EmptyState />;
  }
  return (
    <MotionPlanRenderer
      plan={resolvedPlan}
      allowBlur={allowBlur ?? resolvedPlan.renderOptions?.allowBlur ?? true}
      allowWhipPan={allowWhipPan ?? resolvedPlan.renderOptions?.allowWhipPan ?? true}
    />
  );
};

export const MotionPlanRoot: React.FC = () => {
  const inputProps = getInputProps() as MotionPlanInputProps;
  const plan = inputProps.plan ?? fallbackPlan;
  const fps = plan?.fps ?? 60;
  const width = plan?.outputWidth ?? 1080;
  const height = plan?.outputHeight ?? 1920;
  const durationInFrames = Math.max(1, Math.round((plan?.durationSeconds ?? 5) * fps));

  return (
    <Composition
      id="MotionPlan"
      component={MotionPlanVideo}
      durationInFrames={durationInFrames}
      fps={fps}
      width={width}
      height={height}
      defaultProps={{
        plan: plan ?? undefined,
        allowBlur: inputProps.allowBlur ?? plan?.renderOptions?.allowBlur ?? true,
        allowWhipPan: inputProps.allowWhipPan ?? plan?.renderOptions?.allowWhipPan ?? true,
      }}
    />
  );
};
