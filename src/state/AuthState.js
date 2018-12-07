import { PersistContainer } from './index';

class AuthState extends PersistContainer {
  state = { isAuth: false, isLoggingOut: false, token: null, user: null };
  handleLogin = ({ token, user }) => {
    return this.setState({ isAuth: true, token, user });
  };
  getToken = () => {
    return this.state.token;
  };
  handleLogout = async () => {
    await this.setState({ isLoggingOut: true });
    return new Promise(resolve => {
      // Wait until logout animations complete
      // TODO: Hook this up to animation, so we arent guessing timeout?
      setTimeout(async () => {
        await this.setState({
          isAuth: false,
          isLoggingOut: false,
          token: null,
          user: null,
        });
        resolve();
      }, 375);
    });
  };
}

export { AuthState };
