import { local } from '../graphs';
import { resources, theme } from '../config';

export const types = {
  SIDEBAR: 'Sidebar',
  RESOURCE: 'Resource',
  RESOURCE_LIST: 'ResourceList',
  RESOURCE_LIST_FIELD: 'ResourceListField',
};

export const defaults = {
  sidebar: {
    __typename: types.SIDEBAR,
    open: !theme.device.isPhone,
  },
  resources: resources.map(resource => {
    resource.__typename = types.RESOURCE;
    if (resource.list) {
      resource.list.__typename = types.RESOURCE_LIST;
      resource.list.fields = resource.list.fields.map(field => ({
        ...field,
        __typename: types.RESOURCE_LIST_FIELD,
      }));
    }
    if (resource.edit) {
      resource.edit.__typename = types.RESOURCE_LIST;
      resource.edit.fields = resource.edit.fields.map(field => ({
        ...field,
        __typename: types.RESOURCE_LIST_FIELD,
      }));
    }
    return resource;
  }),
};

export const resolvers = {
  Mutation: {
    toggleSidebar: (_, { open }, { cache }) => {
      const { sidebar } = cache.readQuery({ query: local.query.sidebar });
      const data = {
        sidebar: {
          ...sidebar,
          open: open !== undefined ? open : !sidebar.open,
        },
      };
      cache.writeData({ data });
      return null;
    },
  },
};
