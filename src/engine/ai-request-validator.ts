import {createRequire} from 'node:module';
import Ajv2020, {type ErrorObject} from 'ajv/dist/2020.js';
import type {AiMotionRequest} from '../types';

export const AI_WARNING_PREFIX = 'WARNING: ';

const require = createRequire(import.meta.url);
const aiMotionRequestSchema = require('../../schemas/ai-motion-request.schema.json') as Record<string, unknown>;
const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
});
const validateRequestSchema = ajv.compile(aiMotionRequestSchema);

const warning = (message: string): string => `${AI_WARNING_PREFIX}${message}`;

const formatPath = (instancePath: string): string => {
  if (!instancePath) {
    return 'request';
  }

  return instancePath
    .slice(1)
    .split('/')
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
    .join('.');
};

const formatSchemaError = (error: ErrorObject): string => {
  const path = formatPath(error.instancePath);

  if (error.keyword === 'required' && 'missingProperty' in error.params) {
    const missingProperty = String(error.params.missingProperty);
    return `${path}.${missingProperty} is required.`;
  }

  if (error.keyword === 'additionalProperties' && 'additionalProperty' in error.params) {
    const additionalProperty = String(error.params.additionalProperty);
    return `${path} contains unsupported property '${additionalProperty}'.`;
  }

  if (error.keyword === 'enum' && Array.isArray(error.params.allowedValues)) {
    return `${path} must be one of: ${error.params.allowedValues.join(', ')}.`;
  }

  if (error.keyword === 'const' && 'allowedValue' in error.params) {
    return `${path} must be exactly ${JSON.stringify(error.params.allowedValue)}.`;
  }

  if (error.keyword === 'type' && 'type' in error.params) {
    return `${path} must be of type ${String(error.params.type)}.`;
  }

  if (error.keyword === 'minimum' && 'limit' in error.params) {
    return `${path} must be >= ${String(error.params.limit)}.`;
  }

  if (error.keyword === 'maximum' && 'limit' in error.params) {
    return `${path} must be <= ${String(error.params.limit)}.`;
  }

  if (error.keyword === 'exclusiveMinimum' && 'limit' in error.params) {
    return `${path} must be > ${String(error.params.limit)}.`;
  }

  return `${path} ${error.message ?? 'is invalid.'}`;
};

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

export function validateAiMotionRequest(request: unknown): string[] {
  const diagnostics: string[] = [];

  if (!validateRequestSchema(request)) {
    for (const error of validateRequestSchema.errors ?? []) {
      diagnostics.push(formatSchemaError(error));
    }

    return diagnostics;
  }

  const typedRequest = request as AiMotionRequest;
  const regionIds = new Set<string>();
  const regionMap = new Map(typedRequest.visualStructure.regions.map((region) => [region.id, region]));

  for (const region of typedRequest.visualStructure.regions) {
    if (!region.id.trim()) {
      diagnostics.push('visualStructure.regions[].id is required.');
      continue;
    }

    if (regionIds.has(region.id)) {
      diagnostics.push(`Duplicate region id '${region.id}'.`);
    }
    regionIds.add(region.id);

    if (region.x + region.w > typedRequest.asset.width || region.y + region.h > typedRequest.asset.height) {
      diagnostics.push(`Region '${region.id}' extends beyond the source image bounds.`);
    }
  }

  for (const regionId of typedRequest.visualStructure.readingOrder) {
    if (!regionMap.has(regionId)) {
      diagnostics.push(`readingOrder references unknown region '${regionId}'.`);
    }
  }

  if (typedRequest.visualStructure.primaryRegionId && !regionMap.has(typedRequest.visualStructure.primaryRegionId)) {
    diagnostics.push(`primaryRegionId references unknown region '${typedRequest.visualStructure.primaryRegionId}'.`);
  }

  const captions = typedRequest.script?.captions ?? [];
  for (const [index, caption] of captions.entries()) {
    if (caption.start !== undefined && caption.end !== undefined && caption.end < caption.start) {
      diagnostics.push(`script.captions[${index}] has end before start.`);
    }

    if (caption.attachToRegionId && !regionMap.has(caption.attachToRegionId)) {
      diagnostics.push(`script.captions[${index}] references unknown region '${caption.attachToRegionId}'.`);
    }
  }

  if (typedRequest.task.goal === 'animate-storyboard') {
    const panelCount = typedRequest.visualStructure.regions.filter((region) => region.role === 'panel').length;
    if (panelCount < 2) {
      diagnostics.push(warning('animate-storyboard works best with at least two regions whose role is panel.'));
    }
  }

  if (typedRequest.task.goal === 'animate-comparison') {
    const hasLeft = typedRequest.visualStructure.regions.some((region) => region.role === 'comparison-left');
    const hasRight = typedRequest.visualStructure.regions.some((region) => region.role === 'comparison-right');
    if (!hasLeft || !hasRight) {
      diagnostics.push(
        warning('animate-comparison works best when both comparison-left and comparison-right regions are provided.'),
      );
    }
  }

  return diagnostics;
}
