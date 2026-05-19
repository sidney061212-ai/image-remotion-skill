import type {AiMotionRequest} from '../types';

export const AI_WARNING_PREFIX = 'WARNING: ';

const warning = (message: string): string => `${AI_WARNING_PREFIX}${message}`;

export const splitAiMotionDiagnostics = (diagnostics: string[]): {errors: string[]; warnings: string[]} => {
  const warnings: string[] = [];
  const errors: string[] = [];

  for (const diagnostic of diagnostics) {
    if (diagnostic.startsWith(AI_WARNING_PREFIX)) {
      warnings.push(diagnostic.slice(AI_WARNING_PREFIX.length));
    } else {
      errors.push(diagnostic);
    }
  }

  return {errors, warnings};
};

export function validateAiMotionRequest(request: AiMotionRequest): string[] {
  const diagnostics: string[] = [];

  if (request.version !== '1.0') {
    diagnostics.push(`request.version must be '1.0', received '${request.version}'.`);
  }

  if (request.task.durationSeconds < 3 || request.task.durationSeconds > 120) {
    diagnostics.push('task.durationSeconds must be between 3 and 120 seconds.');
  }

  if (!request.asset.path?.trim()) {
    diagnostics.push('asset.path is required.');
  }

  if (!request.asset.width || request.asset.width <= 0) {
    diagnostics.push('asset.width must be greater than 0.');
  }

  if (!request.asset.height || request.asset.height <= 0) {
    diagnostics.push('asset.height must be greater than 0.');
  }

  const regionIds = new Set<string>();
  const regionMap = new Map(request.visualStructure.regions.map((region) => [region.id, region]));

  for (const region of request.visualStructure.regions) {
    if (!region.id.trim()) {
      diagnostics.push('visualStructure.regions[].id is required.');
      continue;
    }

    if (regionIds.has(region.id)) {
      diagnostics.push(`Duplicate region id '${region.id}'.`);
    }
    regionIds.add(region.id);

    if (region.w <= 0 || region.h <= 0) {
      diagnostics.push(`Region '${region.id}' must have positive width and height.`);
    }

    if (region.x < 0 || region.y < 0) {
      diagnostics.push(`Region '${region.id}' must stay within the image bounds.`);
    }

    if (region.x + region.w > request.asset.width || region.y + region.h > request.asset.height) {
      diagnostics.push(`Region '${region.id}' extends beyond the source image bounds.`);
    }
  }

  for (const regionId of request.visualStructure.readingOrder) {
    if (!regionMap.has(regionId)) {
      diagnostics.push(`readingOrder references unknown region '${regionId}'.`);
    }
  }

  if (request.visualStructure.primaryRegionId && !regionMap.has(request.visualStructure.primaryRegionId)) {
    diagnostics.push(`primaryRegionId references unknown region '${request.visualStructure.primaryRegionId}'.`);
  }

  const captions = request.script?.captions ?? [];
  for (const [index, caption] of captions.entries()) {
    if (caption.start !== undefined && caption.end !== undefined && caption.end < caption.start) {
      diagnostics.push(`script.captions[${index}] has end before start.`);
    }

    if (caption.attachToRegionId && !regionMap.has(caption.attachToRegionId)) {
      diagnostics.push(`script.captions[${index}] references unknown region '${caption.attachToRegionId}'.`);
    }
  }

  if (request.task.goal === 'animate-storyboard') {
    const panelCount = request.visualStructure.regions.filter((region) => region.role === 'panel').length;
    if (panelCount < 2) {
      diagnostics.push(warning('animate-storyboard works best with at least two regions whose role is panel.'));
    }
  }

  if (request.task.goal === 'animate-comparison') {
    const hasLeft = request.visualStructure.regions.some((region) => region.role === 'comparison-left');
    const hasRight = request.visualStructure.regions.some((region) => region.role === 'comparison-right');
    if (!hasLeft || !hasRight) {
      diagnostics.push(warning('animate-comparison works best when both comparison-left and comparison-right regions are provided.'));
    }
  }

  return diagnostics;
}
