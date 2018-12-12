import { theme } from '../config';
import { PersistContainer } from '../providers/UnstatedProvider';

class UIState extends PersistContainer {
  state = {
    sidebar: {
      open: !theme.device.isPhone,
    },
  };
  toggleSidebar = (e, options) => {
    if (options && options.open !== undefined) {
      return this.setState({ sidebar: { open: options.open } });
    }
    return this.setState({ sidebar: { open: !this.state.open } });
  };
  handleCloseSidebar = () => {
    return this.setState({ sidebar: { open: false } });
  };
  handleOpenSidebar = () => {
    return this.setState({ sidebar: { open: true } });
  };
}

export { UIState };
