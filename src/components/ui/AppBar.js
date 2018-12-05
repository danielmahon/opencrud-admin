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
import { Transition, animated } from 'react-spring';

import NavigationIcon from './NavigationIcon';
import { NetworkStatusNotifier } from '../NetworkStatusNotifier';
import { AuthConsumer } from '../../providers/AuthProvider';
import { navigate } from '@reach/router';

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
const StyledTopAppBar = styled(animated(TopAppBar))`
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
  state = { show: true };
  static defaultProps = { title: 'Title' };
  render() {
    const { title } = this.props;
    const { show } = this.state;
    return (
      <ThemeConsumer>
        {theme => (
          <AuthConsumer>
            {({ isAuth, isLoggingOut, logout }) => (
              <Transition
                native
                items={isAuth && !isLoggingOut}
                from={{ top: -200, position: 'fixed' }}
                enter={{ top: 0 }}
                leave={{ top: -200, position: 'fixed' }}>
                {show =>
                  show &&
                  (props => (
                    <Fragment>
                      <StyledTopAppBar style={props}>
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
                              <MenuItem onClick={logout}>
                                <ListItemGraphic icon="exit_to_app" />
                                Logout
                              </MenuItem>
                            </AppBarMenu>
                          </TopAppBarSection>
                          <NetworkStatusNotifier
                            render={({ loading }) => (
                              <LoadingIndicator
                                determinate={false}
                                closed={!loading}
                              />
                            )}
                          />
                        </TopAppBarRow>
                      </StyledTopAppBar>
                      <TopAppBarFixedAdjust />
                    </Fragment>
                  ))
                }
              </Transition>
            )}
          </AuthConsumer>
        )}
      </ThemeConsumer>
    );
  }
}
