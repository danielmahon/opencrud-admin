import React, { Component } from 'react';
import { navigate } from '@reach/router';
// import { AUTH_TOKEN } from '../config/constants';

const AuthContext = React.createContext();

class AuthProvider extends Component {
  state = { isAuth: false, isLoggingOut: false };
  login = fields => {
    console.log(fields);
    this.setState({ isAuth: true });
    navigate('/');
  };
  logout = () => {
    this.setState({ isLoggingOut: true });
    setTimeout(() => {
      this.setState({ isAuth: false, isLoggingOut: false });
    }, 500);
  };
  componentDidMount = () => {
    // const token = localStorage.getItem(AUTH_TOKEN);
    // if (token) {
    //   this.setState({ isAuth: true });
    // }
  };
  render() {
    return (
      <AuthContext.Provider
        value={{
          isAuth: this.state.isAuth,
          isLoggingOut: this.state.isLoggingOut,
          login: this.login,
          logout: this.logout,
        }}>
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

const AuthConsumer = AuthContext.Consumer;

export { AuthProvider, AuthConsumer };
