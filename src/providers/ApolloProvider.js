import React, { PureComponent } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
// import { withClientState } from 'apollo-link-state';
import { ApolloLink, split } from 'apollo-link';
import apolloLogger from 'apollo-link-logger';

import { remote } from '../graphs';
import { networkStatusNotifierLink } from '../components/NetworkStatusNotifier';

class EnhancedApolloProvider extends PureComponent {
  constructor(props) {
    super(props);

    const httpLink = new HttpLink({
      uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
    });

    // const cache = new InMemoryCache({ dataIdFromObject: o => o.id });
    const cache = new InMemoryCache();
    // const stateLink = withClientState({ cache, resolvers, defaults });

    const middlewareLink = new ApolloLink((operation, forward) => {
      // get the authentication token from props if it exists
      // return the headers to the context so httpLink can read them
      operation.setContext({
        headers: {
          Authorization: `Bearer ${props.getToken()}`,
        },
      });
      return forward(operation);
    });
    // authenticated httplink
    const httpLinkAuth = middlewareLink.concat(httpLink);

    const errorLink = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error] ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      }
      if (networkError) {
        console.log(`[Network error] ${networkError}`);
      }
    });

    const wsLink = new WebSocketLink({
      uri: process.env.REACT_APP_GRAPHQL_ENDPOINT.replace('https', 'wss'),
      options: {
        reconnect: true,
        connectionParams: {
          Authorization: `Bearer ${props.getToken()}`,
        },
      },
    });

    const link = split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      wsLink,
      httpLinkAuth
    );

    // apollo client setup
    const client = new ApolloClient({
      cache,
      link:
        process.env.NODE_ENV === 'production'
          ? ApolloLink.from([
              errorLink,
              networkStatusNotifierLink,
              // stateLink,
              link,
            ])
          : ApolloLink.from([
              apolloLogger,
              errorLink,
              networkStatusNotifierLink,
              // stateLink,
              link,
            ]),
      connectToDevTools: process.env.NODE_ENV !== 'production',
    });

    // client.onResetStore(stateLink.writeDefaults);

    this._client = client;
  }
  state = { ready: false };
  componentDidMount = async () => {
    const { initGraphqlProvider } = this.props;
    // Get schema
    const result = await this._client.query({
      query: remote.query.schema,
      fetchPolicy: 'network-only',
    });
    // Store remote schema
    remote.schema = result.data.__schema;
    // Initialize GraphqlProvider, needs remote schema
    await initGraphqlProvider();
    // Show app
    console.log('[App] Ready!');
    this.setState({ ready: true });
  };
  render() {
    const { children } = this.props;
    const { ready } = this.state;
    if (!ready) return null;
    return <ApolloProvider client={this._client}>{children}</ApolloProvider>;
  }
}

export default EnhancedApolloProvider;
