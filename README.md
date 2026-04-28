# image-remotion-skill（先行版）

`image-remotion-skill` 是一个把图片变成视频的开源工具包。  
核心目标很明确：**给图片添加稳定、可控的运镜效果，输出短视频**。

当前版本重点适配 **信息图（infographic）** 场景：  
- 通过 `video-plan.json` 定义镜头路径（关键帧）  
- 通过 Remotion 渲染为 MP4  
- 输出过程可复现、可迭代、可审查

后续内容（多图叙事、更多内容类型、自动区域识别等）正在开发中。

---

## 1. 项目定位

这个仓库不是“随便生成一个花哨视频”的黑盒工具。  
它是一个 **工程化的图片转视频底座**，强调：

- 可控：镜头参数都在 JSON 里，便于审查和调优
- 稳定：同样输入可以稳定复现同样输出
- 可组合：既可单独渲染，也可接入 AI 工作流

---

## 2. 当前已支持能力

### A. 信息图运镜渲染（主能力）

- 单张图片运镜（推近、平移、甩镜、停留）
- 基于关键帧插值生成平滑镜头
- 自动按速度触发甩镜模糊（motion blur）
- 一条命令渲染输出 MP4

入口与相关文件：
- `src/remotion/InfogramVideo.tsx`
- `src/remotion/InfogramRoot.tsx`
- `schemas/infogram-video-plan.schema.json`
- `render.sh`

### B. 模板化分镜规划（实验能力）

- 提供 16 个固定模板（T01～T16）
- 可由脚本与素材生成结构化 storyboard JSON
- 适合做“图片确认后再转视频”的可控流程

入口与相关文件：
- `src/engine/*`
- `src/components/*`
- `src/remotion/RemotionRoot.tsx`
- `schemas/input.schema.json`
- `schemas/storyboard.schema.json`
- `schemas/image-workflow.schema.json`

---

## 3. 当前边界（请先了解）

- 当前主线只保证 **信息图运镜** 场景可用。
- 暂不包含自动配音、自动字幕、自动 OCR 框选、UI 审核面板。
- 多图复杂叙事与更丰富内容类型仍在开发中。

如果你想先落地“图片 -> 运镜视频”，这个版本已经能用。  
如果你要完整生产线（自动化素材审核、语音强对齐等），建议在此基础上二次开发。

---

## 4. 环境要求

- Node.js 22（CI 使用 Node 22）
- npm
- `ffmpeg`（用于压缩与转码）
- `python3`（`render.sh` 用于读取 fps）

---

## 5. 快速开始

```bash
npm install
npm run typecheck
npm run build
```

启动 Remotion Studio：

```bash
npm run dev
```

渲染内置信息图示例：

```bash
npm run render:example
```

执行后会生成：
- `out/video.mp4`

---

## 6. 直接渲染你自己的信息图

1. 把图片放到 `public/` 下，例如：`public/my-project/infographic.png`
2. 按 schema 写一个 plan 文件（可参考 `examples/example-infogram-plan.json`）
3. 执行渲染：

```bash
./render.sh examples/example-infogram-plan.json ~/Desktop/demo.mp4
```

或：

```bash
./render.sh <你的-plan.json> <输出.mp4>
```

`render.sh` 会把 plan 临时复制到 `outputs/current-plan.json`，再调用 Remotion 渲染。

---

## 7. `video-plan.json` 关键字段

完整定义见：
- `schemas/infogram-video-plan.schema.json`

核心字段：
- `image`: 相对 `public/` 的图片路径
- `imageWidth` / `imageHeight`: 原图尺寸
- `outputWidth` / `outputHeight`: 输出分辨率
- `fps`: 帧率
- `durationSeconds`: 总时长
- `keyframes`: 运镜关键帧数组，元素为 `{time, cx, cy, scale}`

关键帧含义：
- `time`: 秒
- `cx` / `cy`: 镜头中心在图片上的归一化坐标（0~1）
- `scale`: 缩放倍数（`1.0` 为全图）

---

## 8. 仓库结构

```text
skill/                      AI 技能说明
schemas/                    JSON Schema（输入/输出/工作流）
examples/                   示例输入与示例计划
public/examples/            示例信息图资产
src/engine/                 分镜规划逻辑
src/components/             固定模板组件（T01～T16）
src/remotion/               Remotion 组合入口与渲染组件
render.sh                   一键渲染脚本
```

---

## 9. 作为库使用（分镜规划）

```ts
import {buildStoryboard} from 'image-remotion-skill';
import input from './examples/example-input.json';

const storyboard = buildStoryboard(input);
console.log(JSON.stringify(storyboard, null, 2));
```

---

## 10. 开源先行版说明

这是先行版（preview）。  
优先保证“信息图运镜”这条链路稳定可用，再逐步扩展内容类型与自动化能力。

欢迎提 issue / PR，建议优先围绕以下方向：
- 运镜规划质量
- 信息图字幕可读性
- schema 扩展兼容性
- 渲染性能与输出体积优化

---

## 11. 许可证

MIT，详见 `LICENSE`。
