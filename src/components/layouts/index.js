import React, { Fragment, PureComponent } from 'react';
import { Redirect } from '@reach/router';
import { DrawerAppContent } from '@rmwc/drawer';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

import { AuthConsumer } from '../../providers/AuthProvider';
import AppBar from '../ui/AppBar';
import SideBar from '../ui/SideBar';

const StyledDrawerAppContent = styled(DrawerAppContent)`
  transition: margin-left 250ms;
`;

export class MainLayout extends PureComponent {
  state = { title: '' };
  updateTitle = ({ title }) => {
    this.setState({ title });
  };
  render() {
    const { children } = this.props;
    const { title } = this.state;
    return (
      <AuthConsumer>
        {({ isAuth }) => {
          if (!isAuth) return <Redirect to="/login" noThrow />;
          return (
            <Fragment>
              <Helmet onChangeClientState={this.updateTitle} />
              <AppBar title={title} />
              <SideBar />
              <StyledDrawerAppContent tag="main">
                {children}
              </StyledDrawerAppContent>
              <footer />
            </Fragment>
          );
        }}
      </AuthConsumer>
    );
  }
}
export class AuthLayout extends PureComponent {
  render() {
    const { children } = this.props;
    return (
      <AuthConsumer>
        {({ isAuth }) => {
          if (isAuth) return null;
          return children;
        }}
      </AuthConsumer>
    );
  }
}
