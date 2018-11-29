import React from 'react';
import { RMWCProvider } from '@rmwc/provider';
import { ThemeProvider as RMWCThemeProvider } from '@rmwc/theme';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme as defaultTheme } from '../config';

const ThemeProvider = ({ children, theme, ...props }) => {
  const options = { ...defaultTheme.rmwc, ...theme.rwmc };
  const styledTheme = { ...defaultTheme, ...theme };
  return (
    <StyledThemeProvider theme={styledTheme}>
      <RMWCProvider {...props}>
        <RMWCThemeProvider options={options}>{children}</RMWCThemeProvider>
      </RMWCProvider>
    </StyledThemeProvider>
  );
};

ThemeProvider.defaultProps = {
  buttonDefaultRipple: true,
  listItemDefaultRipple: true,
  iconStrategy: 'auto',
  theme: {},
};

export default ThemeProvider;
