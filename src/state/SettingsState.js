import { resources } from '../config';
import { PersistContainer } from '../providers/UnstatedProvider';

class SettingsState extends PersistContainer {
  state = { resources };
}

export { SettingsState };
