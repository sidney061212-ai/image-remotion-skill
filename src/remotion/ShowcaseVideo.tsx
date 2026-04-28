import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

const SRC = staticFile("showcase/claude.png");
const IMG_W = 1672;
const IMG_H = 941;
const OUT_W = 2560;
const OUT_H = 1440;
const FPS = 90;
const TOTAL_DUR = 60;

// ─── Keyframe track ───
// 甩镜统一 0.3s，到位后静帧停留
const keyframes: [number, number, number, number][] = [
  // ── 开场：全图 ──
  [0,    0.50, 0.50, 1.0  ],
  [3,    0.50, 0.50, 1.0  ],

  // ── 第一区：财务四联卡（左上）──
  [5,    0.20, 0.18, 2.8  ],  // 快推到营收
  [7,    0.20, 0.18, 2.8  ],  // 停留
  [9,    0.35, 0.18, 2.8  ],  // 横扫到净利润
  [10.5, 0.35, 0.18, 2.8  ],  // 停留
  [12,   0.48, 0.18, 2.8  ],  // 扫到扣非/现金流
  [14,   0.48, 0.18, 2.8  ],  // 停留

  // ── 甩镜到利润弹性区 ──
  [14.3, 0.72, 0.25, 2.5  ],  // 甩镜 0.3s
  [17,   0.72, 0.25, 2.5  ],  // 停留
  [18.5, 0.88, 0.28, 2.5  ],  // 平移到ROE
  [20.5, 0.88, 0.28, 2.5  ],  // 停留

  // ── 甩镜到业务矩阵 ──
  [20.8, 0.22, 0.55, 2.4  ],  // 甩镜 0.3s
  [23,   0.22, 0.55, 2.4  ],  // 停留
  [25.5, 0.50, 0.55, 2.4  ],  // 横扫中间
  [27,   0.50, 0.55, 2.4  ],  // 停留
  [29,   0.75, 0.55, 2.4  ],  // 横扫到右侧
  [31,   0.75, 0.55, 2.4  ],  // 停留

  // ── 甩镜到创新与风险 ──
  [31.3, 0.30, 0.78, 2.2  ],  // 甩镜 0.3s
  [34,   0.30, 0.78, 2.2  ],  // 停留
  [36,   0.70, 0.78, 2.2  ],  // 平移到风险估值
  [38,   0.70, 0.78, 2.2  ],  // 停留
  [39.5, 0.80, 0.82, 2.4  ],  // 微推到目标价
  [41.5, 0.80, 0.82, 2.4  ],  // 停留

  // ── 结尾：拉回全图 → 推结论 ──
  [43.5, 0.50, 0.50, 1.0  ],  // 拉回全图
  [45.5, 0.50, 0.50, 1.0  ],  // 停留
  [47.5, 0.50, 0.88, 1.8  ],  // 推进结论区
  [50,   0.50, 0.88, 1.8  ],  // 停留
  [52,   0.50, 0.88, 2.0  ],  // 微推强调
  [60,   0.50, 0.88, 2.0  ],  // 定格
];

const kfFrames = keyframes.map(([t]) => Math.round(t * FPS));
const kfCx = keyframes.map(([, cx]) => cx);
const kfCy = keyframes.map(([,, cy]) => cy);
const kfScale = keyframes.map(([,,, s]) => s);

// Precompute velocity at each keyframe boundary to detect whip-pans
// We'll compute velocity per-frame in the component
const getVelocity = (frame: number): number => {
  const delta = 2; // look 2 frames ahead/behind
  const cx0 = interpolate(Math.max(0, frame - delta), kfFrames, kfCx, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cy0 = interpolate(Math.max(0, frame - delta), kfFrames, kfCy, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cx1 = interpolate(frame + delta, kfFrames, kfCx, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cy1 = interpolate(frame + delta, kfFrames, kfCy, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dx = (cx1 - cx0) * IMG_W;
  const dy = (cy1 - cy0) * IMG_H;
  return Math.sqrt(dx * dx + dy * dy) / (delta * 2);
};

export const ShowcaseVideo: React.FC = () => {
  const frame = useCurrentFrame();

  const cx = interpolate(frame, kfFrames, kfCx, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cy = interpolate(frame, kfFrames, kfCy, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = interpolate(frame, kfFrames, kfScale, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const imgW = IMG_W * scale;
  const imgH = IMG_H * scale;
  const tx = OUT_W / 2 - cx * imgW;
  const ty = OUT_H / 2 - cy * imgH;

  // Whip-pan blur: velocity > threshold → frosted glass
  const velocity = getVelocity(frame);
  const blurAmount = velocity > 8 ? Math.min((velocity - 8) * 1.5, 40) : 0;

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Img
        src={SRC}
        style={{
          position: "absolute",
          left: tx,
          top: ty,
          width: imgW,
          height: imgH,
          objectFit: "fill",
          filter: blurAmount > 0 ? `blur(${blurAmount}px)` : "none",
        }}
      />
      {/* Frosted overlay during whip-pan */}
      {blurAmount > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0,0,0,${Math.min(blurAmount / 80, 0.3)})`,
            backdropFilter: `blur(${blurAmount * 0.5}px)`,
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export const SHOWCASE_TOTAL_FRAMES = Math.round(TOTAL_DUR * FPS);
