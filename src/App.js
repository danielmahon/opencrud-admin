import React from 'react';

// Fonts & Global Styles
import 'normalize.css';
import 'typeface-roboto';
import 'material-icons';
import 'react-placeholder/lib/reactPlaceholder.css';
import 'material-components-web/dist/material-components-web.min.css';
import '@rmwc/circular-progress/circular-progress.css';
import '@rmwc/data-table/data-table.css';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import './index.css';

// Relative Imports
import ApolloProvider from './providers/ApolloProvider';
import ThemeProvider from './providers/ThemeProvider';
import RouteProvider from './providers/RouteProvider';
import { initGraphqlProvider } from './providers/GraphqlProvider';
import { DefaultLayout } from './components/layouts';

const App = () => {
  return (
    <ApolloProvider initGraphqlProvider={initGraphqlProvider}>
      <ThemeProvider>
        <DefaultLayout>
          <RouteProvider />
        </DefaultLayout>
      </ThemeProvider>
    </ApolloProvider>
  );
};

export default App;
