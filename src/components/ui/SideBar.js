import React, { PureComponent } from 'react';
import {
  Drawer,
  DrawerHeader,
  DrawerContent,
  DrawerTitle,
  DrawerSubtitle,
} from '@rmwc/drawer';
import { List, ListItem, ListItemGraphic, ListDivider } from '@rmwc/list';
import styled, { ThemeConsumer } from 'styled-components';
import { capitalize, lowerCase } from 'lodash';
import pluralize from 'pluralize';
import { Location, Link } from '@reach/router';
import { Query } from 'react-apollo';

import Text from '../ui/Text';
import { Subscribe, AuthState, UIState, SettingsState } from '../../state';
import { remote } from '../../graphs';
import pkg from '../../../package.json';

const StyledDrawer = styled(Drawer)`
  position: fixed;
  /* padding-top: 56px; */
  top: 0;
  z-index: 8;
  ${({ theme }) => theme.device.gt.mobile} {
    /* padding-top: 64px; */
    z-index: 6;
    /* max-height: calc(100vh - 64px); */
  }
  .mdc-list-item--disabled {
    opacity: 0.25;
  }
`;

const DrawerFooter = styled(DrawerContent)`
  margin: 0 1rem;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
`;

const ProfileHeader = styled(DrawerHeader)`
  background-color: #f5f5f5;
  padding-top: 56px;
  ${({ theme }) => theme.device.gt.mobile} {
    padding-top: 64px;
  }
`;

class SideBar extends PureComponent {
  render() {
    return (
      <ThemeConsumer>
        {theme => (
          <Subscribe to={[AuthState, UIState, SettingsState]}>
            {(
              { state: { isAuth, isLoggingOut, user }, logout },
              { state: { sidebar }, toggleSidebar, handleCloseSidebar },
              { state: { resources } }
            ) => {
              const isPhone = theme.device.isPhone;
              return (
                <Location>
                  {({ location }) => (
                    <StyledDrawer
                      modal={isPhone && sidebar.open}
                      dismissible={!isPhone || !sidebar.open}
                      open={isLoggingOut ? false : sidebar.open}
                      onClose={() => {
                        if (!isLoggingOut) handleCloseSidebar();
                      }}>
                      <ProfileHeader>
                        <DrawerTitle>{user.name}</DrawerTitle>
                        <DrawerSubtitle>{user.email}</DrawerSubtitle>
                        <Text use="body2">
                          Role: {user.role}
                          <br />
                        </Text>
                      </ProfileHeader>
                      <DrawerContent style={{ flex: 'none', height: 'auto' }}>
                        <List>
                          <ListItem
                            tag={Link}
                            to={'/'}
                            onClick={() => {
                              if (isPhone) handleCloseSidebar();
                            }}
                            activated={'/' === location.pathname}>
                            <ListItemGraphic icon="dashboard" /> Dashboard
                          </ListItem>
                          <Query query={remote.query.modelConfigsConnection}>
                            {({ data, loading }) => {
                              if (loading) return null;
                              const models = data.modelConfigsConnection.edges.reduce(
                                (acc, e) => {
                                  if (e.node.enabled) acc.push(e.node);
                                  return acc;
                                },
                                []
                              );
                              if (!models.length) {
                                return (
                                  <Text padded use="body2">
                                    You haven't configured your models yet!
                                    Click the "Configure" button to get started.
                                  </Text>
                                );
                              }
                              return models.map(model => {
                                const label = capitalize(pluralize(model.type));
                                const pathname = `/list/${lowerCase(
                                  pluralize(model.type)
                                )}`;
                                return (
                                  <ListItem
                                    onClick={() => {
                                      if (isPhone) handleCloseSidebar();
                                    }}
                                    activated={pathname === location.pathname}
                                    key={model.type}
                                    tag={Link}
                                    to={pathname}>
                                    <ListItemGraphic icon={model.icon} />
                                    {label}
                                  </ListItem>
                                );
                              });
                            }}
                          </Query>
                          <ListDivider />
                          <ListItem
                            tag={Link}
                            to={'/settings'}
                            onClick={() => {
                              if (isPhone) handleCloseSidebar();
                            }}
                            activated={'/settings' === location.pathname}>
                            <ListItemGraphic icon="settings" /> Configure
                          </ListItem>
                        </List>
                      </DrawerContent>
                      <DrawerFooter>
                        <Text use="body2" theme="textHintOnBackground">{`v${
                          pkg.version
                        }`}</Text>
                      </DrawerFooter>
                    </StyledDrawer>
                  )}
                </Location>
              );
            }}
          </Subscribe>
        )}
      </ThemeConsumer>
    );
  }
}

export default SideBar;
