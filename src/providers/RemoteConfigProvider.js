import React, { Component } from 'react';
import { plural } from 'pluralize';

import { getQueries, getTypeName, getTypes } from './RemoteGraphProvider';
import { remote } from '../graphs';
import AppLoader from '../components/screens/AppLoader';

class RemoteConfigProvider extends Component {
  state = { ready: false };
  componentDidMount = async () => {
    const { client } = this.props;
    /**
     * GENERATE MODEL CONFIGs
     */

    const validModels = getQueries().reduce((acc, query) => {
      if (
        query.name.endsWith('Connection') &&
        !query.name.startsWith('modelConfig')
      ) {
        acc.push(getTypeName(query.type).replace('Connection', ''));
      }
      return acc;
    }, []);

    const {
      data: { modelConfigsConnection },
    } = await client.query({
      query: remote.query.modelConfigsConnection,
    });

    let modelConfigs = modelConfigsConnection.edges.map(e => e.node);

    // Check for default model configs
    const promises = validModels.map(async modelTypeName => {
      const type = getTypes().find(r => r.name === modelTypeName);
      const modelConfig = modelConfigs.find(
        ({ type }) => type === modelTypeName
      );
      if (!modelConfig) {
        const result = await client.mutate({
          mutation: remote.mutation.createModelConfig,
          refetchQueries: [{ query: remote.query.modelConfigsConnection }],
          variables: {
            data: {
              type: modelTypeName,
              description: `Model config for ${modelTypeName}`,
              icon: 'library_books',
              enabled: true,
              listFields: {
                create: type.fields.map((field, index) => ({
                  identifier: `${modelTypeName.toLowerCase()}-list-${
                    field.name
                  }`,
                  name: field.name,
                  description:
                    field.description !== '' ? field.description : undefined,
                  type: getTypeName(field.type),
                  order: index,
                })),
              },
              editFields: {
                create: type.fields.map((field, index) => ({
                  identifier: `${modelTypeName.toLowerCase()}-edit-${
                    field.name
                  }`,
                  name: field.name,
                  description:
                    field.description !== '' ? field.description : undefined,
                  type: getTypeName(field.type),
                  order: index,
                })),
              },
            },
          },
        });
        modelConfigs.push(result.data.createModelConfig);
      } else if (
        modelConfig.listFields.length !== type.fields.length ||
        modelConfig.editFields.length !== type.fields.length
      ) {
        await client.mutate({
          mutation: remote.mutation.updateModelConfig,
          refetchQueries: [{ query: remote.query.modelConfigsConnection }],
          variables: {
            where: { id: modelConfig.id },
            data: {
              listFields: {
                upsert: type.fields.map((field, index) => {
                  const name = field.name;
                  const identifier = `${modelTypeName.toLowerCase()}-list-${name}`;
                  const description =
                    field.description !== '' ? field.description : undefined;
                  const type = getTypeName(field.type);
                  return {
                    where: { identifier },
                    create: {
                      order: index,
                      identifier,
                      name,
                      description,
                      type,
                    },
                    update: {},
                  };
                }),
              },
              editFields: {
                upsert: type.fields.map((field, index) => {
                  const name = field.name;
                  const identifier = `${modelTypeName.toLowerCase()}-edit-${name}`;
                  const description =
                    field.description !== '' ? field.description : undefined;
                  const type = getTypeName(field.type);
                  return {
                    where: { identifier },
                    create: {
                      order: index,
                      identifier,
                      name,
                      description,
                      type,
                    },
                    update: {},
                  };
                }),
              },
            },
          },
        });
      }
    });
    // wait until all promises are resolved
    await Promise.all(promises);

    /**
     * CHECK for required queries/mutations
     */
    const requiredQueries = ['', 'sConnection'];
    const requiredMutations = ['create', 'update', 'delete', 'deleteMany'];
    modelConfigs.forEach(model => {
      requiredQueries.forEach(method => {
        let resourceType = model.type.toLowerCase();
        if (!remote.query[`${resourceType}${method}`]) {
          throw new Error(
            `Missing ${resourceType}${method} query in remote schema!`
          );
        }
      });
      requiredMutations.forEach(method => {
        let resourceType = model.type;
        if (method.includes('Many')) {
          resourceType = plural(resourceType);
        }
        if (!remote.mutation[`${method}${resourceType}`]) {
          throw new Error(
            `Missing ${method}${resourceType} mutation in remote schema!`
          );
        }
      });
    });

    this.setState({ ready: true });
  };
  render() {
    if (!this.state.ready) return <AppLoader message="Setting up models..." />;
    return this.props.children;
  }
}
export { RemoteConfigProvider };
