import React from "react";
import { Composition } from "remotion";
import { ShowcaseVideo, SHOWCASE_TOTAL_FRAMES } from "./ShowcaseVideo";

export const ShowcaseRoot: React.FC = () => (
  <Composition
    id="Showcase"
    component={ShowcaseVideo}
    durationInFrames={SHOWCASE_TOTAL_FRAMES}
    fps={90}
    width={2560}
    height={1440}
  />
);
