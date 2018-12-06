import { theme } from '../config';
import { PersistContainer } from '../providers/UnstatedProvider';

class SidebarContainer extends PersistContainer {
  state = {
    open: !theme.device.isPhone,
  };
}

export { SidebarContainer };
