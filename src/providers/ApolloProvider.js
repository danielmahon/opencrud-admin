import React, { PureComponent } from 'react';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink, split } from 'apollo-link';
import apolloLogger from 'apollo-link-logger';

import { networkStatusNotifierLink } from '../components/NetworkStatusNotifier';

class EnhancedApolloProvider extends PureComponent {
  constructor(props) {
    super(props);

    const httpLink = new HttpLink({
      uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
    });

    // const cache = new InMemoryCache({ dataIdFromObject: o => o.id });
    const cache = new InMemoryCache();

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
          ? ApolloLink.from([errorLink, networkStatusNotifierLink, link])
          : ApolloLink.from([
              apolloLogger,
              errorLink,
              networkStatusNotifierLink,
              link,
            ]),
      connectToDevTools: process.env.NODE_ENV !== 'production',
    });

    this._client = client;
  }
  render() {
    const { children } = this.props;
    return (
      <ApolloProvider client={this._client}>
        {children(this._client)}
      </ApolloProvider>
    );
  }
}

export default EnhancedApolloProvider;
