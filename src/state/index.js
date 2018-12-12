import { Container, Provider, Subscribe } from 'unstated';
import { PersistContainer } from '../providers/UnstatedProvider';
import { UIState } from './UIState';
import { SettingsState } from './SettingsState';
import { AuthState } from './AuthState';

// Expose state containers
// AuthState must be first!
export const containers = [AuthState, UIState, SettingsState];
// Expose these for convenience
export {
  UIState,
  SettingsState,
  AuthState,
  Container,
  Provider,
  Subscribe,
  PersistContainer,
};
