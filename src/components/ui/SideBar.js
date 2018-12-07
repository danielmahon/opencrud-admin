import React, { PureComponent } from 'react';
import {
  Drawer,
  DrawerHeader,
  DrawerContent,
  DrawerTitle,
  DrawerSubtitle,
} from '@rmwc/drawer';
import { List, ListItem, ListItemGraphic } from '@rmwc/list';
import styled, { withTheme } from 'styled-components';
import { capitalize, lowerCase } from 'lodash';
import pluralize from 'pluralize';
import { Location, Link } from '@reach/router';

import Text from '../ui/Text';
import {
  Subscribe,
  AuthState,
  SidebarContainer,
  ResourcesContainer,
} from '../../state';

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

const ProfileHeader = styled(DrawerHeader)`
  background-color: #f5f5f5;
  padding-top: 56px;
  ${({ theme }) => theme.device.gt.mobile} {
    padding-top: 64px;
  }
`;

class SideBar extends PureComponent {
  render() {
    const { theme } = this.props;
    const isPhone = theme.device.isPhone;
    return (
      <Subscribe to={[AuthState, SidebarContainer, ResourcesContainer]}>
        {(
          { state: { isAuth, isLoggingOut, user }, logout },
          { state: sidebar, toggleSidebar, handleCloseSidebar },
          { state: { resources } }
        ) => {
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
                        <ListItemGraphic icon="home" /> Home
                      </ListItem>
                      <ListItem
                        disabled
                        onClick={() => {
                          if (isPhone) handleCloseSidebar();
                        }}
                        activated={'/help' === location.pathname}>
                        <ListItemGraphic icon="help" /> How to Use
                      </ListItem>
                    </List>
                  </DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Resources</DrawerTitle>
                    <DrawerSubtitle>Editable Content Types</DrawerSubtitle>
                  </DrawerHeader>
                  <DrawerContent style={{ flex: 'auto' }}>
                    <List>
                      {resources.map(resource => {
                        const label = capitalize(pluralize(resource.type));
                        const pathname = `/list/${lowerCase(
                          pluralize(resource.type)
                        )}`;
                        return (
                          <ListItem
                            onClick={() => {
                              if (isPhone) handleCloseSidebar();
                            }}
                            activated={pathname === location.pathname}
                            key={resource.type}
                            tag={Link}
                            to={pathname}>
                            <ListItemGraphic icon={resource.icon} />
                            {label}
                          </ListItem>
                        );
                      })}
                    </List>
                  </DrawerContent>
                </StyledDrawer>
              )}
            </Location>
          );
        }}
      </Subscribe>
    );
  }
}

export default withTheme(SideBar);
