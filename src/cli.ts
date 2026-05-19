#!/usr/bin/env -S node --experimental-specifier-resolution=node
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {copyFile, mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildMotionPlanFromAiRequest} from './engine/ai-motion-compiler';
import type {AiMotionRequest, MotionPlan} from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicRoot = path.join(projectRoot, 'public');
const outputsRoot = path.join(projectRoot, 'outputs');

const usage = `Usage:
  image-remotion-skill plan <ai-motion-request.json> <motion-plan.json>
  image-remotion-skill render <motion-plan.json> <output.mp4>`;

const readJson = async <T>(filePath: string): Promise<T> => {
  const content = await readFile(filePath, 'utf8');
  return JSON.parse(content) as T;
};

const writeJson = async (filePath: string, value: unknown): Promise<void> => {
  await mkdir(path.dirname(filePath), {recursive: true});
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const toPosixRelative = (from: string, to: string): string => path.relative(from, to).split(path.sep).join('/');

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await readFile(filePath);
    return true;
  } catch {
    return false;
  }
};

const resolvePlanImagePath = async (plan: MotionPlan, planPath: string): Promise<{sourcePath: string; remotionPath: string}> => {
  if (path.isAbsolute(plan.image) && await fileExists(plan.image)) {
    return {sourcePath: plan.image, remotionPath: ''};
  }

  const publicCandidate = path.join(publicRoot, plan.image);
  if (await fileExists(publicCandidate)) {
    return {sourcePath: publicCandidate, remotionPath: toPosixRelative(publicRoot, publicCandidate)};
  }

  const planRelativeCandidate = path.resolve(path.dirname(planPath), plan.image);
  if (await fileExists(planRelativeCandidate)) {
    return {sourcePath: planRelativeCandidate, remotionPath: ''};
  }

  const cwdCandidate = path.resolve(process.cwd(), plan.image);
  if (await fileExists(cwdCandidate)) {
    return {sourcePath: cwdCandidate, remotionPath: ''};
  }

  throw new Error(`Unable to resolve image path '${plan.image}' for MotionPlan render.`);
};

const stagePlanForRender = async (planPath: string): Promise<MotionPlan> => {
  const absolutePlanPath = path.resolve(planPath);
  const plan = await readJson<MotionPlan>(absolutePlanPath);
  const resolved = await resolvePlanImagePath(plan, absolutePlanPath);
  let remotionImagePath = resolved.remotionPath;

  if (!remotionImagePath) {
    const ext = path.extname(resolved.sourcePath) || '.png';
    const baseName = path.basename(resolved.sourcePath, ext).replace(/[^a-zA-Z0-9-_]/g, '-');
    const digest = createHash('sha1').update(resolved.sourcePath).digest('hex').slice(0, 12);
    const targetDir = path.join(publicRoot, 'generated');
    const targetPath = path.join(targetDir, `${baseName}-${digest}${ext}`);
    await mkdir(targetDir, {recursive: true});
    await copyFile(resolved.sourcePath, targetPath);
    remotionImagePath = toPosixRelative(publicRoot, targetPath);
  }

  const stagedPlan: MotionPlan = {
    ...plan,
    image: remotionImagePath,
  };

  await mkdir(outputsRoot, {recursive: true});
  await writeJson(path.join(outputsRoot, 'current-motion-plan.json'), stagedPlan);
  return stagedPlan;
};

const runRemotionRender = async (plan: MotionPlan, outputPath: string): Promise<void> => {
  const remotionBin = path.join(projectRoot, 'node_modules', '.bin', 'remotion');
  const outputAbsolutePath = path.resolve(outputPath);
  await mkdir(path.dirname(outputAbsolutePath), {recursive: true});

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      remotionBin,
      [
        'render',
        path.join(projectRoot, 'src', 'remotion', 'index.ts'),
        'MotionPlan',
        outputAbsolutePath,
        `--props=${JSON.stringify({plan})}`,
      ],
      {
        cwd: projectRoot,
        stdio: 'inherit',
      },
    );

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Remotion render exited with code ${code ?? 'unknown'}.`));
    });
  });
};

const main = async (): Promise<void> => {
  const [command, ...args] = process.argv.slice(2);

  if (!command) {
    throw new Error(usage);
  }

  if (command === 'plan') {
    const [requestPath, outputPath] = args;
    if (!requestPath || !outputPath) {
      throw new Error(usage);
    }

    const request = await readJson<AiMotionRequest>(path.resolve(requestPath));
    const plan = buildMotionPlanFromAiRequest(request);
    await writeJson(path.resolve(outputPath), plan);
    return;
  }

  if (command === 'render') {
    const [planPath, outputPath] = args;
    if (!planPath || !outputPath) {
      throw new Error(usage);
    }

    const stagedPlan = await stagePlanForRender(planPath);
    await runRemotionRender(stagedPlan, outputPath);
    return;
  }

  throw new Error(usage);
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
