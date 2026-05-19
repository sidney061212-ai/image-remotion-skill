import type {FC} from 'react';
import type {TemplateIdV2, TemplateProps} from '../types';
import {CardStackTemplate} from './CardStackTemplate';
import {CinematicDepthTemplate} from './CinematicDepthTemplate';
import {DocumentFocusTemplate} from './DocumentFocusTemplate';
import {GridShuffleTemplate} from './GridShuffleTemplate';
import {InfographicZoomTemplate} from './InfographicZoomTemplate';
import {PhotoWallTemplate} from './PhotoWallTemplate';
import {PortraitFocusTemplate} from './PortraitFocusTemplate';
import {PosterImpactTemplate} from './PosterImpactTemplate';
import {ProductHeroTemplate} from './ProductHeroTemplate';
import {SafeKenBurnsTemplate} from './SafeKenBurnsTemplate';
import {ScreenshotScanTemplate} from './ScreenshotScanTemplate';
import {StoryboardGridTemplate} from './StoryboardGridTemplate';

export const TEMPLATE_COMPONENTS: Record<TemplateIdV2, FC<TemplateProps>> = {
  InfographicZoomTemplate,
  CinematicDepthTemplate,
  PortraitFocusTemplate,
  ProductHeroTemplate,
  ScreenshotScanTemplate,
  PosterImpactTemplate,
  StoryboardGridTemplate,
  PhotoWallTemplate,
  CardStackTemplate,
  GridShuffleTemplate,
  DocumentFocusTemplate,
  SafeKenBurnsTemplate,
};

export {
  CardStackTemplate,
  CinematicDepthTemplate,
  DocumentFocusTemplate,
  GridShuffleTemplate,
  InfographicZoomTemplate,
  PhotoWallTemplate,
  PortraitFocusTemplate,
  PosterImpactTemplate,
  ProductHeroTemplate,
  SafeKenBurnsTemplate,
  ScreenshotScanTemplate,
  StoryboardGridTemplate,
};
