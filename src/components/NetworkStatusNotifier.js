import { createNetworkStatusNotifier } from 'react-apollo-network-status';

const {
  NetworkStatusNotifier,
  link: networkStatusNotifierLink,
} = createNetworkStatusNotifier();

export { NetworkStatusNotifier, networkStatusNotifierLink };
