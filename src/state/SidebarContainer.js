import { theme } from '../config';
import { PersistContainer } from '../providers/UnstatedProvider';

class SidebarContainer extends PersistContainer {
  state = {
    open: !theme.device.isPhone,
  };
  toggleSidebar = (e, options) => {
    if (options && options.open !== undefined) {
      return this.setState({ open: options.open });
    }
    return this.setState({ open: !this.state.open });
  };
  handleCloseSidebar = () => {
    return this.setState({ open: false });
  };
  handleOpenSidebar = () => {
    return this.setState({ open: true });
  };
}

export { SidebarContainer };
