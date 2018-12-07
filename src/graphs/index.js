import gql from 'graphql-tag';
import { introspectionQuery } from 'graphql';

const fragments = {};

const local = {
  query: {
    sidebar: gql`
      query _sidebar {
        sidebar @client {
          open
        }
        ${fragments.resources}
      }
    `,
  },
  mutation: {
    toggleSidebar: gql`
      mutation _toggleSidebar($open: Boolean) {
        toggleSidebar(open: $open) @client {
          open
        }
      }
    `,
  },
};

const remote = {
  schema: null,
  query: {
    schema: gql`
      ${introspectionQuery}
    `,
  },
  mutation: {},
};

export { local, remote, fragments };
