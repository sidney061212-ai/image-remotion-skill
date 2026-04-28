import type {InputPackage} from '../types';

export const validateInputPackage = (input: InputPackage): string[] => {
  const errors: string[] = [];
  if (input.project.aspectRatio !== '9:16') {
    errors.push('Only 9:16 is supported in this starter kit.');
  }
  if (!input.script.length) {
    errors.push('At least one script line is required.');
  }
  if (!input.assets.length) {
    errors.push('At least one asset is required.');
  }
  for (const asset of input.assets) {
    for (const region of asset.focusRegions ?? []) {
      if (region.w <= 0 || region.h <= 0) {
        errors.push(`Invalid focus region size: ${asset.id}.${region.id}`);
      }
    }
  }
  return errors;
};
