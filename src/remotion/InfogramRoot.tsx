/**
 * InfogramRoot — Remotion entry point for infogram videos.
 *
 * Reads the video plan from inputProps (passed via --props flag)
 * or falls back to a default plan file for development.
 */
import React from "react";
import { Composition } from "remotion";
import { InfogramVideoRenderer, type InfogramVideoPlan } from "./InfogramVideo";

// Default plan for dev/preview — overridden by --props at render time
let defaultPlan: InfogramVideoPlan | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  defaultPlan = require("../../outputs/current-plan.json") as InfogramVideoPlan;
} catch {
  // No default plan available
}

const InnerVideo: React.FC<{ plan?: InfogramVideoPlan }> = ({ plan }) => {
  const p = plan ?? defaultPlan;
  if (!p) return <div style={{ color: "#fff", fontSize: 48, padding: 80 }}>No plan loaded</div>;
  return <InfogramVideoRenderer plan={p} />;
};

export const InfogramRoot: React.FC = () => {
  const plan = defaultPlan;
  const fps = plan?.fps ?? 90;
  const w = plan?.outputWidth ?? 2560;
  const h = plan?.outputHeight ?? 1440;
  const dur = plan?.durationSeconds ?? 60;

  return (
    <Composition
      id="Infogram"
      component={InnerVideo}
      durationInFrames={Math.round(dur * fps)}
      fps={fps}
      width={w}
      height={h}
      defaultProps={{ plan: plan ?? undefined }}
    />
  );
};
