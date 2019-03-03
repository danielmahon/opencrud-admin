import React from 'react';

// Fonts & Global Styles
import 'normalize.css';
import 'typeface-roboto';
import 'material-icons';
// import 'material-components-web/dist/material-components-web.min.css';
// import '@rmwc/circular-progress/circular-progress.css';
import 'react-placeholder/lib/reactPlaceholder.css';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import 'draft-js-inline-toolbar-plugin/lib/plugin.css';
import 'draft-js-side-toolbar-plugin/lib/plugin.css';
import 'draft-js-anchor-plugin/lib/plugin.css';
import 'draft-js-image-plugin/lib/plugin.css';
import 'draft-js-focus-plugin/lib/plugin.css';
import 'draft-js-alignment-plugin/lib/plugin.css';
import 'prismjs/themes/prism.css';
import 'react-placeholder/lib/reactPlaceholder.css';
import './styles/material.scss';
import './styles/global.scss';

// Lazyload Images
import 'lazysizes';
import 'lazysizes/plugins/attrchange/ls.attrchange';

// Relative Imports
import ApolloProvider from './providers/ApolloProvider';
import ThemeProvider from './providers/ThemeProvider';
import { PrivateRoutes, PublicRoutes } from './providers/RouteProvider';
import { UnstatedProvider } from './providers/UnstatedProvider';
import { RemoteGraphProvider } from './providers/RemoteGraphProvider';

const App = () => (
  <UnstatedProvider>
    {getToken => (
      <ApolloProvider getToken={getToken}>
        {client => (
          <RemoteGraphProvider client={client}>
            <ThemeProvider>
              <PrivateRoutes client={client} />
              <PublicRoutes />
            </ThemeProvider>
          </RemoteGraphProvider>
        )}
      </ApolloProvider>
    )}
  </UnstatedProvider>
);

export default App;
