import React, { PureComponent, Fragment } from 'react';
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarActionItem,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
} from '@rmwc/top-app-bar';
import { SimpleMenu, MenuItem } from '@rmwc/menu';
import { ListDivider, ListItemGraphic } from '@rmwc/list';
import { LinearProgress } from '@rmwc/linear-progress';
import { Typography } from '@rmwc/typography';
import styled, { ThemeConsumer } from 'styled-components';
import { darken, lighten } from 'polished';

import NavigationIcon from './NavigationIcon';
import { NetworkStatusNotifier } from '../NetworkStatusNotifier';

const LoadingIndicator = styled(LinearProgress)`
  position: absolute;
  bottom: 0;
  .mdc-linear-progress__buffering-dots,
  .mdc-linear-progress__buffer {
    background: none;
  }
  .mdc-linear-progress__bar-inner {
    background-color: ${props => lighten(0.25, props.theme.rmwc.primary)};
  }
`;
const StyledTopAppBar = styled(TopAppBar)`
  z-index: 7;
  .mdc-top-app-bar__section {
    flex-basis: ${({ theme }) => (theme.device.isPhone ? null : '33%')};
  }
`;
const AppBarMenu = styled(SimpleMenu)`
  min-width: 192px;
`;
const Title = styled(Typography).attrs({
  use: 'headline6',
})`
  text-transform: uppercase;
  text-align: center;
  width: 100%;
  color: ${props => darken(0.2, props.theme.rmwc.primary)};
`;

export default class AppBar extends PureComponent {
  static defaultProps = { title: 'Title' };
  render() {
    const { title } = this.props;
    return (
      <ThemeConsumer>
        {theme => (
          <Fragment>
            <StyledTopAppBar>
              <TopAppBarRow>
                <TopAppBarSection alignStart>
                  <NavigationIcon />
                  <TopAppBarTitle>{title}</TopAppBarTitle>
                </TopAppBarSection>
                {!theme.device.isPhone && (
                  <TopAppBarSection>
                    <Title>Mission Control</Title>
                  </TopAppBarSection>
                )}
                <TopAppBarSection alignEnd>
                  <AppBarMenu
                    handle={
                      <TopAppBarActionItem
                        aria-label="My Profile"
                        alt="My Profile"
                        icon="person"
                      />
                    }>
                    <MenuItem disabled>
                      <ListItemGraphic icon="person" />
                      My Profile
                    </MenuItem>
                    <MenuItem disabled>
                      <ListItemGraphic icon="settings" />
                      Settings
                    </MenuItem>
                    <ListDivider />
                    <MenuItem>
                      <ListItemGraphic icon="exit_to_app" />
                      Logout
                    </MenuItem>
                  </AppBarMenu>
                </TopAppBarSection>
                <NetworkStatusNotifier
                  render={({ loading }) => (
                    <LoadingIndicator determinate={false} closed={!loading} />
                  )}
                />
              </TopAppBarRow>
            </StyledTopAppBar>
            <TopAppBarFixedAdjust />
          </Fragment>
        )}
      </ThemeConsumer>
    );
  }
}
