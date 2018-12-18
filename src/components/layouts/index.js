import React, { Fragment, PureComponent } from 'react';
import { DrawerAppContent } from '@rmwc/drawer';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

import AppBar from '../ui/AppBar';
import SideBar from '../ui/SideBar';
import { Subscribe, AuthState } from '../../state';

const StyledDrawerAppContent = styled(DrawerAppContent)`
  transition: margin-left 250ms;
`;

export class MainLayout extends PureComponent {
  state = { title: '' };
  updateTitle = ({ title }) => {
    if (title) {
      this.setState({ title: title.split('|')[0].trim() });
    }
  };
  render() {
    const { children } = this.props;
    const { title } = this.state;
    return (
      <Fragment>
        <Helmet
          onChangeClientState={this.updateTitle}
          titleTemplate={`%s${
            window.location.pathname === '/' ? '' : ' | Mission Control'
          }`}
        />
        <AppBar title={title} />
        <SideBar />
        <StyledDrawerAppContent tag="main">{children}</StyledDrawerAppContent>
        <footer />
      </Fragment>
    );
  }
}
export class AuthLayout extends PureComponent {
  render() {
    const { children } = this.props;
    return (
      <Subscribe to={[AuthState]}>
        {({ state: { isAuth } }) => {
          if (isAuth) return null;
          return children;
        }}
      </Subscribe>
    );
  }
}
