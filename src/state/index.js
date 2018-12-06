import { Container, Provider, Subscribe } from 'unstated';
import { PersistContainer } from '../providers/UnstatedProvider';
import { SidebarContainer } from './SidebarContainer';
import { ResourcesContainer } from './ResourcesContainer';
import { AuthContainer } from './AuthContainer';

// Expose state containers
export const containers = [SidebarContainer, ResourcesContainer, AuthContainer];
// Expose these for convenience
export {
  SidebarContainer,
  ResourcesContainer,
  AuthContainer,
  Container,
  Provider,
  Subscribe,
  PersistContainer,
};
