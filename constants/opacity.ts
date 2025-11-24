/**
 * Opacity constants for consistent transparency effects
 */
export const opacity = {
  none: 0,
  veryLight: 0.1,
  light: 0.2,
  lightMedium: 0.3,
  medium: 0.4,
  mediumStrong: 0.5,
  strong: 0.6,
  veryStrong: 0.7,
  almostOpaque: 0.8,
  nearlyFull: 0.9,
  full: 1,

  // Component-specific opacity values
  heroOverlay: 0.6,
  buttonOverlay: 0.3,
  borderOverlay: 0.2,
  borderOverlayMedium: 0.4,
  markerShadow: 0.25,
} as const;

export type OpacityKey = keyof typeof opacity;
