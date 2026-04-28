import {buildStoryboard} from './storyboard';
import type {Asset, ImageToVideoPackage, InputPackage, Storyboard} from '../types';

export const toInputPackage = (workflow: ImageToVideoPackage): InputPackage => {
  const approvedAssets = [...workflow.approvedAssets]
    .filter((asset) => asset.approved)
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));

  if (!approvedAssets.length) {
    throw new Error('Image workflow must contain at least one approved asset before storyboard generation.');
  }

  const assets: Asset[] = approvedAssets.map((asset) => ({
    id: asset.id,
    type: asset.type,
    path: asset.path,
    description: asset.description,
    width: asset.width,
    height: asset.height,
    focusRegions: asset.focusRegions,
  }));

  return {
    project: workflow.project,
    script: workflow.script,
    assets,
    constraints: workflow.constraints,
  };
};

export const buildStoryboardFromImageWorkflow = (workflow: ImageToVideoPackage): Storyboard => {
  return buildStoryboard(toInputPackage(workflow));
};
