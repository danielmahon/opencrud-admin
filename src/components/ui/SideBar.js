import React, { PureComponent } from 'react';
import {
  Drawer,
  DrawerHeader,
  DrawerContent,
  DrawerTitle,
  DrawerSubtitle,
} from '@rmwc/drawer';
import { List, ListItem, ListItemGraphic } from '@rmwc/list';
import { Query, Mutation } from 'react-apollo';
import styled, { withTheme } from 'styled-components';
import { capitalize, lowerCase } from 'lodash';
import pluralize from 'pluralize';
import { Location, Link } from '@reach/router';

import { local } from '../../graphs';

const StyledDrawer = styled(Drawer)`
  position: fixed;
  padding-top: 56px;
  top: 0;
  z-index: 8;
  ${({ theme }) => theme.device.gt.mobile} {
    padding-top: 64px;
    z-index: 6;
    /* max-height: calc(100vh - 64px); */
  }
`;

class SideBar extends PureComponent {
  render() {
    const { theme } = this.props;
    const isPhone = theme.device.isPhone;
    return (
      <Query query={local.query.sidebar}>
        {({ data: { sidebar, resources }, error }) => {
          return (
            <Mutation mutation={local.mutation.toggleSidebar} ignoreResults>
              {toggleSidebar => (
                <StyledDrawer
                  modal={isPhone && sidebar.open}
                  dismissible={!isPhone || !sidebar.open}
                  open={sidebar.open}
                  onClose={sidebar.open && toggleSidebar}>
                  <DrawerHeader>
                    <DrawerTitle>Resources</DrawerTitle>
                    <DrawerSubtitle>Editable Content Types</DrawerSubtitle>
                  </DrawerHeader>
                  <DrawerContent>
                    <Location>
                      {({ location }) => (
                        <List>
                          {resources.map(resource => {
                            const label = capitalize(pluralize(resource.type));
                            const pathname = `/list/${lowerCase(
                              pluralize(resource.type)
                            )}`;
                            return (
                              <ListItem
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
                      )}
                    </Location>
                  </DrawerContent>
                </StyledDrawer>
              )}
            </Mutation>
          );
        }}
      </Query>
    );
  }
}

export default withTheme(SideBar);
