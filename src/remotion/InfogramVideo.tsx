/**
 * InfogramVideo — data-driven single-image camera motion component.
 *
 * Reads a video plan JSON and renders smooth keyframe-based camera motion
 * with automatic whip-pan blur detection.
 *
 * Usage: pass the plan as `inputProps` or import directly.
 */
import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

export interface InfogramKeyframe {
  time: number;
  cx: number;
  cy: number;
  scale: number;
  label?: string;
}

export interface InfogramVideoPlan {
  image: string;
  imageWidth: number;
  imageHeight: number;
  outputWidth: number;
  outputHeight: number;
  fps: number;
  durationSeconds: number;
  whipPanThreshold?: number;
  whipPanBlurMax?: number;
  keyframes: InfogramKeyframe[];
}

const clampOpts = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const getVelocity = (
  frame: number,
  kfFrames: number[],
  kfCx: number[],
  kfCy: number[],
  imgW: number,
  imgH: number,
): number => {
  const delta = 2;
  const cx0 = interpolate(Math.max(0, frame - delta), kfFrames, kfCx, clampOpts);
  const cy0 = interpolate(Math.max(0, frame - delta), kfFrames, kfCy, clampOpts);
  const cx1 = interpolate(frame + delta, kfFrames, kfCx, clampOpts);
  const cy1 = interpolate(frame + delta, kfFrames, kfCy, clampOpts);
  const dx = (cx1 - cx0) * imgW;
  const dy = (cy1 - cy0) * imgH;
  return Math.sqrt(dx * dx + dy * dy) / (delta * 2);
};

export const InfogramVideoRenderer: React.FC<{ plan: InfogramVideoPlan }> = ({ plan }) => {
  const frame = useCurrentFrame();
  const {
    image, imageWidth, imageHeight,
    outputWidth, outputHeight, fps,
    whipPanThreshold = 8,
    whipPanBlurMax = 40,
    keyframes,
  } = plan;

  const src = staticFile(image);
  const kfFrames = keyframes.map((kf) => Math.round(kf.time * fps));
  const kfCx = keyframes.map((kf) => kf.cx);
  const kfCy = keyframes.map((kf) => kf.cy);
  const kfScale = keyframes.map((kf) => kf.scale);

  const cx = interpolate(frame, kfFrames, kfCx, clampOpts);
  const cy = interpolate(frame, kfFrames, kfCy, clampOpts);
  const scale = interpolate(frame, kfFrames, kfScale, clampOpts);

  const imgW = imageWidth * scale;
  const imgH = imageHeight * scale;
  const tx = outputWidth / 2 - cx * imgW;
  const ty = outputHeight / 2 - cy * imgH;

  const velocity = getVelocity(frame, kfFrames, kfCx, kfCy, imageWidth, imageHeight);
  const blurAmount = velocity > whipPanThreshold
    ? Math.min((velocity - whipPanThreshold) * 1.5, whipPanBlurMax)
    : 0;

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Img
        src={src}
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
      {blurAmount > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0,0,0,${Math.min(blurAmount / 80, 0.3)})`,
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
