# image-remotion-skill

`image-remotion-skill` 是一个 **AI-facing image motion skill**。  
它不做人工剪辑界面，不做拖拽关键帧，不做人类审核面板。它的职责是把上层 AI 已经分析好的图片结构，**确定性地编译成 Remotion `MotionPlan`，再渲染成 MP4**。

新主线：

```text
AiMotionRequest -> validate -> selectMotionRecipe -> compileMotionPlan -> MotionPlanRenderer -> MP4
```

---

## Positioning

这个仓库适合被上层 AI、agent、批处理工作流调用：

1. AI 生成或接收图片
2. AI 分析图片结构
3. AI 产出 `ai-motion-request.json`
4. 本 skill 编译 `motion-plan.json`
5. 本 skill 渲染 MP4

这个 skill **不负责**：

- OCR
- 自动理解图片内容
- 大模型判断哪些区域重要
- 人工审核工作流
- UI 编辑器

这个 skill **只负责**：

- 严格 schema
- 明确校验错误
- 可预测 recipe 选择
- 纯函数 MotionPlan 编译
- 稳定 Remotion 渲染

---

## Upstream AI Contract

调用这个 skill 的上层 AI 必须遵守这些约束：

- AI 必须先分析图片，再生成结构化请求
- AI 必须提供 source image `width` / `height`
- `visualStructure.regions` 坐标必须是**原图像素坐标**
- `readingOrder` 只能引用 `regions` 中真实存在的 `id`
- 这个 skill 不做 OCR、不做图片理解、不自动猜区域
- `preferredRecipe` 只有在 AI 非常确定时才传，否则应让 selector 自动判断
- 如果图是分景图 / 漫画分格图，推荐 `goal=animate-storyboard`、`layout=comic-panels`、region `role=panel`
- 如果图是信息图，推荐 `goal=animate-infographic`、`layout=vertical-sections` / `timeline` / `mixed`，region `role` 优先使用 `title` / `number` / `chart` / `step` / `detail` / `cta`

---

## Core Formats

AI 请求输入：

- `schemas/ai-motion-request.schema.json`
- 对应 TypeScript 类型：`AiMotionRequest`

编译输出：

- `schemas/motion-plan.schema.json`
- 对应 TypeScript 类型：`MotionPlan`

关键约束：

- `visualStructure.regions` 使用 **原图像素坐标**，不是归一化坐标
- `readingOrder` 表示 AI 认为画面应被观看的顺序
- 上层 AI 推荐传 `AiMotionRequest`，而不是手写 camera keyframes
- caption 文本只能来自请求本身，不由 skill 自行生成

---

## Motion Recipes

当前主线支持这些 recipe：

- `INFOGRAPHIC_OVERVIEW_TO_KEYPOINTS`
- `INFOGRAPHIC_STEP_SCAN`
- `STORYBOARD_PANEL_PUSH`
- `STORYBOARD_PANEL_HOP`
- `SCREENSHOT_TOP_TO_BOTTOM_SCAN`
- `COMPARISON_LEFT_RIGHT_REVEAL`
- `POSTER_HERO_DEPTH_PUSH`
- `COLLAGE_ASSEMBLE`
- `DOCUMENT_LINE_SPOTLIGHT`
- `PHOTO_KEN_BURNS`

推荐 goal：

- 信息图：`animate-infographic`
- 分景图 / 多格图：`animate-storyboard`
- 截图：`animate-screenshot`
- 海报 / 商品图：`animate-poster`
- 对比图：`animate-comparison`
- 文档截图：`animate-document`
- 普通照片：`animate-photo`

---

## CLI

安装依赖并构建：

```bash
npm install
npm run typecheck
npm run build
npm run test
```

编译 MotionPlan：

```bash
npm run plan:ai -- examples/ai-request-infographic.json outputs/infographic-plan.json
```

也可以用 storyboard example：

```bash
npm run plan:ai -- examples/ai-request-storyboard.json outputs/storyboard-plan.json
```

渲染 MP4：

```bash
npm run render:motion -- outputs/infographic-plan.json out/infographic.mp4
```

`render` 命令会自动把图片 staging 到 Remotion `public/`，并写入 `outputs/current-motion-plan.json` 作为开发 fallback。

---

## Remotion Entrypoints

新主线：

- `src/remotion/MotionPlanRenderer.tsx`
- `src/remotion/MotionPlanRoot.tsx`
- Composition id: `MotionPlan`

保留的旧入口：

- `src/remotion/InfogramRoot.tsx`
- `src/remotion/RemotionRoot.tsx`

---

## Legacy Status

旧的 `Storyboard` / `T01-T16` 模板系统仍然保留，避免破坏已有调用，但现在应视为：

- `legacy`
- `experimental`
- 非主推荐路径

尤其是：

- `src/engine/storyboard.ts`
- `schemas/input.schema.json`
- `schemas/storyboard.schema.json`
- `src/components/*` 的模板组件

它们更偏向旧的脚本驱动模板路线；新的 AI skill 主线以 `AiMotionRequest` 和 `MotionPlan` 为核心。

---

## Examples

AI-facing examples：

- `examples/ai-request-infographic.json`
- `examples/ai-request-storyboard.json`
- `examples/ai-request-screenshot.json`
- `examples/ai-request-comparison.json`

这些例子都假设：

- 上层 AI 已经知道图片尺寸
- 上层 AI 已经给出 `regions`
- 上层 AI 已经给出 `readingOrder`

---

## Library Usage

```ts
import {buildMotionPlanFromAiRequest} from 'image-remotion-skill';
import request from './examples/ai-request-infographic.json';

const plan = buildMotionPlanFromAiRequest(request);
console.log(plan.recipeId);
console.log(plan.camera);
```

---

## Development Notes

- 新的 compiler / recipe 模块都应该保持纯函数
- 渲染阶段可以做文件 staging，但不应反向污染编译逻辑
- 文案只能影响 caption / label overlay，不应决定主镜头路径

## License

MIT
