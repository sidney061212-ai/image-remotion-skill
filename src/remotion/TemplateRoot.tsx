import React from 'react';
import {Composition, getInputProps} from 'remotion';
import exampleTemplateRequest from '../../examples/template-request-infographic.json';
import {buildTemplateRenderPlan} from '../engine/template-plan-compiler';
import {TEMPLATE_COMPONENTS} from '../templates';
import type {TemplateRenderPlan, TemplateRenderRequest} from '../types';

interface TemplateRootInputProps {
  plan?: TemplateRenderPlan;
  request?: TemplateRenderRequest;
}

let fallbackPlan: TemplateRenderPlan | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  fallbackPlan = require('../../outputs/current-template-plan.json') as TemplateRenderPlan;
} catch {
  fallbackPlan = null;
}

const fallbackRequest = exampleTemplateRequest as TemplateRenderRequest;

const EmptyState: React.FC = () => (
  <div style={{color: '#17304b', fontSize: 42, padding: 80}}>No TemplateRenderPlan loaded</div>
);

const resolvePlan = (
  plan: TemplateRenderPlan | undefined,
  request: TemplateRenderRequest | undefined,
): TemplateRenderPlan | null => {
  if (plan) {
    return plan;
  }

  if (request) {
    return buildTemplateRenderPlan(request);
  }

  if (fallbackPlan) {
    return fallbackPlan;
  }

  return buildTemplateRenderPlan(fallbackRequest);
};

const TemplateVideo: React.FC<TemplateRootInputProps> = ({plan, request}) => {
  const resolvedPlan = resolvePlan(plan, request);
  if (!resolvedPlan) {
    return <EmptyState />;
  }

  const TemplateComponent = TEMPLATE_COMPONENTS[resolvedPlan.templateId];
  if (!TemplateComponent) {
    return (
      <div style={{color: '#17304b', fontSize: 42, padding: 80}}>
        Unsupported template: {resolvedPlan.templateId}
      </div>
    );
  }

  return <TemplateComponent plan={resolvedPlan} />;
};

export const TemplateRoot: React.FC = () => {
  const inputProps = getInputProps() as TemplateRootInputProps;
  const resolvedPlan = resolvePlan(inputProps.plan, inputProps.request);
  const fps = resolvedPlan?.fps ?? 60;
  const width = resolvedPlan?.outputWidth ?? 1080;
  const height = resolvedPlan?.outputHeight ?? 1920;
  const durationInFrames = Math.max(1, Math.round((resolvedPlan?.durationSeconds ?? 6) * fps));

  return (
    <Composition
      id="TemplateVideo"
      component={TemplateVideo}
      durationInFrames={durationInFrames}
      fps={fps}
      width={width}
      height={height}
      defaultProps={{
        plan: inputProps.plan ?? resolvedPlan ?? undefined,
        request: inputProps.request ?? undefined,
      }}
    />
  );
};
