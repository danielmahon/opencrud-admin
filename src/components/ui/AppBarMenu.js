import React from 'react';
import styled from 'styled-components';
import { TopAppBarActionItem } from '@rmwc/top-app-bar';
import { ListDivider, ListItemGraphic } from '@rmwc/list';
import { SimpleMenu, MenuItem } from '@rmwc/menu';
import { Link } from '@reach/router';

const StyledSimpleMenu = styled(SimpleMenu)`
  min-width: 192px;
`;

const AppBarMenu = ({ user }) => {
  return (
    <StyledSimpleMenu
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
      <MenuItem tag={Link} to="/settings">
        <ListItemGraphic icon="settings" />
        Settings
      </MenuItem>
      <ListDivider />
      <MenuItem tag={Link} to="/logout">
        <ListItemGraphic icon="exit_to_app" />
        Logout
      </MenuItem>
    </StyledSimpleMenu>
  );
};

export default AppBarMenu;
