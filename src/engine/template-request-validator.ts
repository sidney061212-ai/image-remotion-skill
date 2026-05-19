import Ajv2020, {type ErrorObject} from 'ajv/dist/2020.js';
import templateRenderRequestSchema from '../../schemas/template-render-request.schema.json';
import type {TemplateRenderRequest} from '../types';

export const TEMPLATE_WARNING_PREFIX = 'WARNING: ';

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
});
const validateRequestSchema = ajv.compile(templateRenderRequestSchema);

const warning = (message: string): string => `${TEMPLATE_WARNING_PREFIX}${message}`;

const SINGLE_IMAGE_CATEGORIES = new Set([
  'product',
  'portrait',
  'landscape',
  'screenshot',
  'infographic',
  'document',
  'poster',
  'storyboard',
]);

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
    return `${path}.${String(error.params.missingProperty)} is required.`;
  }

  if (error.keyword === 'additionalProperties' && 'additionalProperty' in error.params) {
    return `${path} contains unsupported property '${String(error.params.additionalProperty)}'.`;
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

  if (error.keyword === 'minItems' && 'limit' in error.params) {
    return `${path} must contain at least ${String(error.params.limit)} item(s).`;
  }

  return `${path} ${error.message ?? 'is invalid.'}`;
};

export const splitTemplateDiagnostics = (diagnostics: string[]): {errors: string[]; warnings: string[]} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const diagnostic of diagnostics) {
    if (diagnostic.startsWith(TEMPLATE_WARNING_PREFIX)) {
      warnings.push(diagnostic.slice(TEMPLATE_WARNING_PREFIX.length));
    } else {
      errors.push(diagnostic);
    }
  }

  return {errors, warnings};
};

export function validateTemplateRenderRequest(request: TemplateRenderRequest): string[] {
  const diagnostics: string[] = [];

  if (!validateRequestSchema(request)) {
    for (const error of validateRequestSchema.errors ?? []) {
      diagnostics.push(formatSchemaError(error));
    }
    return diagnostics;
  }

  if (request.assets.length < 1) {
    diagnostics.push('assets must contain at least one image asset.');
  }

  if (request.task.durationSeconds < 3 || request.task.durationSeconds > 120) {
    diagnostics.push('task.durationSeconds must be between 3 and 120 seconds.');
  }

  for (const [index, asset] of request.assets.entries()) {
    if (!asset.path.trim()) {
      diagnostics.push(`assets[${index}].path is required.`);
    }

    if (asset.width !== undefined && asset.width <= 0) {
      diagnostics.push(`assets[${index}].width must be greater than 0 when provided.`);
    }

    if (asset.height !== undefined && asset.height <= 0) {
      diagnostics.push(`assets[${index}].height must be greater than 0 when provided.`);
    }
  }

  if ((request.task.imageCategory === 'multi-image' || request.task.imageCategory === 'collage') && request.assets.length < 2) {
    diagnostics.push(
      warning(
        `imageCategory '${request.task.imageCategory}' usually expects at least 2 assets. The renderer will fall back to safer single-image behavior if only one asset is available.`,
      ),
    );
  }

  if (SINGLE_IMAGE_CATEGORIES.has(request.task.imageCategory) && request.assets.length > 1) {
    diagnostics.push(
      warning(
        `imageCategory '${request.task.imageCategory}' mainly uses the first asset. Extra assets will be ignored by the current template selection.`,
      ),
    );
  }

  return diagnostics;
}
