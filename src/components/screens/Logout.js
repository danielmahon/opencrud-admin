import React, { PureComponent } from 'react';

import { Subscribe, AuthState } from '../../state';

class Logout extends PureComponent {
  componentDidMount = () => {
    this.props.handleLogout();
  };
  render() {
    return null;
  }
}
class LogoutWrapper extends PureComponent {
  render() {
    return (
      <Subscribe to={[AuthState]}>
        {({ handleLogout }) => <Logout handleLogout={handleLogout} />}
      </Subscribe>
    );
  }
}
export default LogoutWrapper;
