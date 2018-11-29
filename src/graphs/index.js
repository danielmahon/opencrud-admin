import gql from 'graphql-tag';

const fragments = {
  resources: `
    resources @client {
      type
      icon
      list {
        fields {
          source
          type
        }
      }
      edit {
        fields {
          source
          type
        }
      }
    }
  `,
};

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
  query: {},
  mutation: {},
};

export { local, remote, fragments };
