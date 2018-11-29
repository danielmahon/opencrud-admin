import React, { Fragment } from 'react';
import { DrawerAppContent } from '@rmwc/drawer';
import styled from 'styled-components';

import AppBar from '../ui/AppBar';
import SideBar from '../ui/SideBar';

const StyledDrawerAppContent = styled(DrawerAppContent)`
  transition: margin-left 250ms;
`;

export const DefaultLayout = ({ children, title }) => {
  return (
    <Fragment>
      <AppBar title={title} />
      <SideBar />
      <StyledDrawerAppContent tag="main">{children}</StyledDrawerAppContent>
      <footer />
    </Fragment>
  );
};
