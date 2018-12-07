import { Container, Provider, Subscribe } from 'unstated';
import { PersistContainer } from '../providers/UnstatedProvider';
import { SidebarContainer } from './SidebarContainer';
import { ResourcesContainer } from './ResourcesContainer';
import { AuthState } from './AuthState';

// Expose state containers
// AuthState must be first!
export const containers = [AuthState, SidebarContainer, ResourcesContainer];
// Expose these for convenience
export {
  SidebarContainer,
  ResourcesContainer,
  AuthState,
  Container,
  Provider,
  Subscribe,
  PersistContainer,
};
