import React from 'react';
import { Container, Provider, Subscribe } from 'unstated';
import localForage from 'localforage';
import AppLoader from '../components/screens/AppLoader';
import { containers } from '../state';

class PersistContainer extends Container {
  constructor() {
    super();
    this.rehydrate();
  }
  defaultPersist = {
    key: this.constructor.name,
    version: 1,
    storage: localForage,
  };
  rehydrate = async () => {
    this.persist = { ...this.defaultPersist, ...this.persist };
    let persistStatePartial = { _persist_version: this.persist.version };
    try {
      let serialState = await this.persist.storage.getItem(this.persist.key);
      if (serialState !== null) {
        let incomingState = JSON.parse(serialState);
        if (incomingState._persist_version !== this.persist.version) {
          if (process.env.NODE_ENV !== 'production')
            console.log(
              'unstated-persist: state version mismatch, skipping rehydration'
            );
          await this.setState(persistStatePartial);
        } else {
          await this.setState(incomingState); // state versions match, set state as is
        }
      } else {
        await this.setState(persistStatePartial);
      }
    } catch (err) {
      await this.setState(persistStatePartial);
      if (process.env.NODE_ENV !== 'production')
        console.log('err during rehydate', err);
    } finally {
      // dont start persisting until rehydration is complete
      this.subscribe(() => {
        this.persist.storage
          .setItem(this.persist.key, JSON.stringify(this.state))
          .catch(err => {
            if (process.env.NODE_ENV !== 'production')
              console.log('unstated-persist: err during store', err);
          });
      });
    }
  };
}

const isBootstrapped = container => {
  return (
    !(container instanceof PersistContainer) ||
    container.state._persist_version !== undefined
  );
};

const UnstatedProvider = ({ children }) => {
  return (
    <Provider>
      <Subscribe to={containers}>
        {(...allContainers) => {
          // Persist Gate, don't load until rehydration is complete
          if (!allContainers.every(isBootstrapped))
            return <AppLoader message="Restoring state..." />;
          // Pass token to render prop
          const getToken = allContainers[0].getToken;
          return children(getToken);
        }}
      </Subscribe>
    </Provider>
  );
};

export { UnstatedProvider, isBootstrapped, PersistContainer, Container };
