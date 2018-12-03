import React, { Fragment, PureComponent } from 'react';
import { DrawerAppContent } from '@rmwc/drawer';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

import AppBar from '../ui/AppBar';
import SideBar from '../ui/SideBar';

const StyledDrawerAppContent = styled(DrawerAppContent)`
  transition: margin-left 250ms;
`;

export class DefaultLayout extends PureComponent {
  state = { title: '' };
  updateTitle = ({ title }) => {
    this.setState({ title });
  };
  render() {
    const { children } = this.props;
    const { title } = this.state;
    return (
      <Fragment>
        <Helmet onChangeClientState={this.updateTitle} />
        <AppBar title={title} />
        <SideBar />
        <StyledDrawerAppContent tag="main">{children}</StyledDrawerAppContent>
        <footer />
      </Fragment>
    );
  }
}
