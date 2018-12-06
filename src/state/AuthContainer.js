import { PersistContainer } from './index';

class AuthContainer extends PersistContainer {
  state = { isAuth: false, isLoggingOut: false, token: null };
  login = token => {
    return this.setState({ isAuth: true, token: token });
  };
  logout = async () => {
    await this.setState({ isLoggingOut: true });
    return new Promise(resolve => {
      // Wait until logout animations complete
      // TODO: Hook this up to animation, so we arent guessing timeout?
      setTimeout(async () => {
        await this.setState({
          isAuth: false,
          isLoggingOut: false,
          token: null,
        });
        resolve();
      }, 375);
    });
  };
}

export { AuthContainer };
