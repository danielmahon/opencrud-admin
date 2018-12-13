import { resources } from '../config';
import { PersistContainer } from '../providers/UnstatedProvider';

class SettingsState extends PersistContainer {
  state = { resources };
  update = (resource, idx) => {
    const updatedResources = this.state.resources;
    updatedResources[idx] = resource;
    console.log(updatedResources);
    this.setState({ resource: updatedResources });
  };
}

export { SettingsState };
