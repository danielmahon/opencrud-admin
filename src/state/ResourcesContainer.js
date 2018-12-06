import { resources } from '../config';
import { PersistContainer } from '../providers/UnstatedProvider';

class ResourcesContainer extends PersistContainer {
  state = { resources };
}

export { ResourcesContainer };
