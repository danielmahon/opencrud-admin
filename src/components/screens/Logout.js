import React, { PureComponent } from 'react';

import { AuthConsumer } from '../../providers/AuthProvider';

class Logout extends PureComponent {
  componentDidMount = () => {
    this.props.logout();
  };
  render() {
    return null;
  }
}
class LogoutWrapper extends PureComponent {
  render() {
    return (
      <AuthConsumer>{({ logout }) => <Logout logout={logout} />}</AuthConsumer>
    );
  }
}
export default LogoutWrapper;
