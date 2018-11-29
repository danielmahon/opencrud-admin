import React, { PureComponent } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { withClientState } from 'apollo-link-state';
import { ApolloLink, split } from 'apollo-link';
import apolloLogger from 'apollo-link-logger';
import { introspectionQuery } from 'graphql';
import gql from 'graphql-tag';

import { resolvers, defaults } from '../state';
import { networkStatusNotifierLink } from '../components/NetworkStatusNotifier';
import { AUTH_TOKEN } from '../config';

class EnhancedApolloProvider extends PureComponent {
  constructor(props) {
    super(props);

    const httpLink = new HttpLink({
      uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
    });

    // const cache = new InMemoryCache({ dataIdFromObject: o => o.id });
    const cache = new InMemoryCache();
    const stateLink = withClientState({ cache, resolvers, defaults });

    const middlewareLink = new ApolloLink((operation, forward) => {
      // get the authentication token from local storage if it exists
      const tokenValue = localStorage.getItem(AUTH_TOKEN);
      // return the headers to the context so httpLink can read them
      operation.setContext({
        headers: {
          Authorization: tokenValue ? `Bearer ${tokenValue}` : '',
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
          Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN)}`,
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
              stateLink,
              link,
            ])
          : ApolloLink.from([
              apolloLogger,
              errorLink,
              networkStatusNotifierLink,
              stateLink,
              link,
            ]),
      connectToDevTools: process.env.NODE_ENV !== 'production',
    });

    client.onResetStore(stateLink.writeDefaults);

    this._client = client;
  }
  state = { ready: false };
  componentDidMount = async () => {
    const { initGraphqlProvider } = this.props;
    // Get schema
    const result = await this._client.query({
      query: gql`
        ${introspectionQuery}
      `,
      fetchPolicy: 'network-only',
    });
    initGraphqlProvider(result.data.__schema);
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
