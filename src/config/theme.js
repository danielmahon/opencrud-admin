// RMWC Theme Options
const rmwc = {
  primary: '#6200ee',
  secondary: '#018786',
  background: '#fff',
  surface: '#fff',
  error: '#b00020',
  onPrimary: '#fff',
  onSecondary: '#fff',
  onSurface: '#000',
  onError: '#fff',
  textPrimaryOnBackground: 'rgba(0,0,0,0.87)',
  textSecondaryOnBackground: 'rgba(0,0,0,0.54)',
  textHintOnBackground: 'rgba(0,0,0,0.38)',
  textDisabledOnBackground: 'rgba(0,0,0,0.38)',
  textIconOnBackground: 'rgba(0,0,0,0.38)',
  textPrimaryOnLight: 'rgba(0,0,0,0.87)',
  textSecondaryOnLight: 'rgba(0,0,0,0.54)',
  textHintOnLight: 'rgba(0,0,0,0.38)',
  textDisabledOnLight: 'rgba(0,0,0,0.38)',
  textIconOnLight: 'rgba(0,0,0,0.38)',
  textPrimaryOnDark: '#fff',
  textSecondaryOnDark: 'rgba(255,255,255,0.7)',
  textHintOnDark: 'rgba(255,255,255,0.5)',
  textDisabledOnDark: 'rgba(255,255,255,0.5)',
  textIconOnDark: 'rgba(255,255,255,0.5)',
};

// Set responsive breakpoints
// https://material.io/design/layout/responsive-layout-grid.html#breakpoints
const breakpoints = {
  xsmall: 0,
  small: 600,
  medium: 960,
  large: 1280,
  xlarge: 1920,
  // Max text content width, based on medium.com
  text: 700,
};

const motion = {
  exitDuration: 195,
  enterDuration: 225,
};

const columns = window.innerWidth < 600 ? 4 : window.innerWidth < 840 ? 8 : 12;

const device = {
  isPhone: window.innerWidth > 0 && window.innerWidth < 600,
  isTablet: window.innerWidth >= 600 && window.innerWidth < 960,
  isDesktop: window.innerWidth >= 960,
  mobile: `@media (max-width: ${breakpoints.small - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.small}px)`,
  desktop: `@media (min-width: ${breakpoints.large}px)`,
  gt: {
    mobile: `@media (min-width: ${breakpoints.small}px)`,
    tablet: `@media (min-width: ${breakpoints.large}px)`,
  },
  lt: {
    tablet: `@media (max-width: ${breakpoints.small - 1}px)`,
    desktop: `@media (max-width: ${breakpoints.large - 1}px)`,
  },
};

export const theme = {
  rmwc,
  device,
  breakpoints,
  motion,
  columns,
};
