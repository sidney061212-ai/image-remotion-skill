import type {TemplateRenderPlan, TemplateRenderRequest} from '../types';
import {getOutputSize} from './recipes/utils';
import {selectTemplate} from './template-selector';
import {splitTemplateDiagnostics, validateTemplateRenderRequest} from './template-request-validator';

const DEFAULT_TEMPLATE_FPS = 60;

export function buildTemplateRenderPlan(request: TemplateRenderRequest): TemplateRenderPlan {
  const diagnostics = validateTemplateRenderRequest(request);
  const {errors, warnings} = splitTemplateDiagnostics(diagnostics);

  if (errors.length > 0) {
    throw new Error(`Invalid TemplateRenderRequest:\n- ${errors.join('\n- ')}`);
  }

  const templateId = selectTemplate(request);
  const outputSize = getOutputSize(request.task.aspectRatio);

  return {
    version: '1.0',
    sourceRequestVersion: '1.0',
    templateId,
    outputWidth: outputSize.width,
    outputHeight: outputSize.height,
    fps: request.task.fps ?? DEFAULT_TEMPLATE_FPS,
    durationSeconds: request.task.durationSeconds,
    assets: request.assets,
    text: request.text,
    options: request.options,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
