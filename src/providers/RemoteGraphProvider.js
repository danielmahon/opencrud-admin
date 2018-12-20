import React, { PureComponent } from 'react';
import { TypeKind } from 'graphql';
import gql from 'graphql-tag';
import { chain, startsWith, endsWith, isPlainObject } from 'lodash';

import { remote } from '../graphs';
import AppLoader from '../components/screens/AppLoader';

const isNotGraphqlPrivateType = type => !type.name.startsWith('__');

const isSubObject = field => {
  return [TypeKind.OBJECT, TypeKind.INPUT_OBJECT].includes(
    getTypeKind(field.type)
  );
};

const isInputType = type => {
  console.log(type);
  // return [TypeKind.OBJECT, TypeKind.INPUT_OBJECT].includes(
  //   getTypeKind(field.type)
  // );
};

const getTypeName = type => {
  if (type.name === null) {
    return getTypeName(type.ofType);
  }
  return type.name;
};

const getTypeKind = type => {
  if (type.ofType !== null) {
    return getTypeKind(type.ofType);
  }
  return type.kind;
};

const buildFieldArgs = (field, fields) => {
  const hasOrderField = fields.some(f => f.name === 'order');
  const args = field.args.reduce((acc, arg) => {
    if (arg.name === 'orderBy' && hasOrderField) {
      acc.push(`orderBy: order_ASC`);
    }
    return acc;
  }, []);
  if (args.length) return `(${args.join(', ')})`;
  return '';
};

const buildFields = (fields, { excludeReferences } = {}) => {
  const queryFields = fields
    .filter(isNotGraphqlPrivateType)
    .reduce((acc, field) => {
      if (isSubObject(field)) {
        const typeToCheck = getTypeName(field.type);
        const type = getTypes().find(t => t.name === typeToCheck);
        // TODO: This can "self-reference" and become an infinite loop,
        // how many times should we recurse?
        if (type && !excludeReferences) {
          acc.push(
            `${field.name}${buildFieldArgs(field, type.fields)} { ${buildFields(
              type.fields,
              {
                excludeReferences: true,
              }
            )} }`
          );
        }
        return acc;
      }
      acc.push(field.name);
      return acc;
    }, [])
    .join(' ');
  return queryFields;
};

const buildVars = args => {
  return args
    .map(arg => {
      return arg.type.kind === TypeKind.NON_NULL
        ? `$${arg.name}: ${arg.type.ofType.name}!`
        : `$${arg.name}: ${arg.type.name}`;
    })
    .join(', ');
};

const buildArgs = args => {
  return args
    .map(arg => {
      return `${arg.name}: $${arg.name}`;
    })
    .join(', ');
};

const getQueries = () => {
  return remote.schema.types.reduce((acc, type) => {
    if (type.name !== 'Query' && type.name !== 'Mutation') return acc;
    return [...acc, ...type.fields];
  }, []);
};

const filterVariables = (name, variables) => {
  const queries = getQueries();
  const query = queries.find(q => q.name === name);

  if (!query) {
    throw new Error(
      `Unknown query/mutation ${name}. Make sure it has been declared on your server side schema. Known operations are ${queries
        .map(q => q.name)
        .join(', ')}`
    );
  }

  // Filter update data based on InputType Fields
  const dataArg = query.args.find(a => a.name === 'data');
  const inputType = remote.schema.types.find(
    ({ name }) => name === dataArg.type.ofType.name
  );
  const inputFields = inputType.inputFields.map(f => f.name);

  const validData = chain(variables)
    .pickBy((val, key) => {
      const inputField = inputType.inputFields.find(({ name }) => name === key);
      if (inputFields.includes(key)) {
        // TODO: Support connecting LISTS in the future
        if (
          inputField.type.name &&
          inputField.type.name.includes('UpdateMany')
        ) {
          return false;
        }
        return true;
      }
    })
    .mapValues((val, key) => {
      const inputField = inputType.inputFields.find(({ name }) => name === key);
      if (val && inputField && isSubObject(inputField)) {
        console.log(val, inputField);
        const id = isPlainObject(val) ? val.id : val;
        return { connect: { id } };
      }
      return val;
    })
    .value();

  return validData;
};

const getMutationFields = () => {
  return remote.schema.types.find(type => type.name === 'Mutation').fields;
};
const getQueryFields = () => {
  return remote.schema.types.find(type => type.name === 'Query').fields;
};
const isMutation = query => {
  return getMutationFields().some(field => field.name === query.name);
};
const isQuery = query => {
  return getQueryFields().some(field => field.name === query.name);
};
const getTypes = () => {
  return remote.schema.types.filter(
    type => type.name !== 'Query' && type.name !== 'Mutation'
  );
};
const knownTypeNames = () => {
  return getTypes().map(r => r.name);
};

export default class RemoteGraphProvider extends PureComponent {
  state = { ready: false };
  componentDidMount = async () => {
    const { client } = this.props;
    console.log(remote);

    // Get schema
    const schemaResult = await client.query({
      query: remote.query.schema,
      fetchPolicy: 'network-only',
    });

    // Store remote schema
    remote.schema = schemaResult.data.__schema;

    const queries = getQueries();

    // Generate remote queries
    queries.forEach(query => {
      const typeName = getTypeName(query.type).replace('Connection', '');
      const queryName = query.name;
      const type = getTypes().find(r => r.name === typeName);

      if (!type) {
        throw new Error(
          `Unknown type ${typeName}. Make sure it has been declared on your server side schema. Known resources are ${knownTypeNames.join(
            ', '
          )}`
        );
      }

      // CREATE ONE mutation
      if (type && startsWith(queryName, 'create')) {
        remote.mutation[queryName] = gql`
              mutation ${queryName}(${buildVars(query.args)}) {
                ${queryName}(${buildArgs(query.args)}) {
                  ${buildFields(type.fields)}
                }
              }
            `;
        return;
      }

      // READ MANY query
      if (type && endsWith(queryName, 'Connection')) {
        remote.query[queryName] = gql`
          query ${queryName}(${buildVars(query.args)}) {
            ${queryName}(${buildArgs(query.args)}) {
              edges {
                node {
                  ${buildFields(type.fields)}
                }
              }
              aggregate {
                count
              }
            }
          }
        `;
        return;
      }

      // UPDATE ONE mutation
      // update[Resource]
      if (type && startsWith(queryName, 'update')) {
        remote.mutation[queryName] = gql`
              mutation ${queryName}(${buildVars(query.args)}) {
                ${queryName}(${buildArgs(query.args)}) {
                  ${buildFields(type.fields)}
                }
              }
            `;
        return;
      }

      // DELETE ONE/MANY mutations
      // delete[Resource], deleteMany[Resources]
      if (type && startsWith(queryName, 'delete')) {
        remote.mutation[queryName] = gql`
              mutation ${queryName}(${buildVars(query.args)}) {
                ${queryName}(${buildArgs(query.args)}) {
                  ${buildFields(type.fields, {
                    excludeReferences: true,
                  })}
                }
              }
            `;
        return;
      }

      // Add query
      if (isQuery(query)) {
        const vars = query.args.length ? `(${buildVars(query.args)})` : '';
        const args = query.args.length ? `(${buildArgs(query.args)})` : '';
        remote.query[queryName] = gql`
            query ${queryName}${vars} {
              ${queryName}${args} {
                ${buildFields(type.fields)}
              }
            }
          `;
        return;
      }

      // Add mutation
      if (isMutation(query)) {
        const vars = query.args.length ? `(${buildVars(query.args)})` : '';
        const args = query.args.length ? `(${buildArgs(query.args)})` : '';
        remote.mutation[queryName] = gql`
          mutation ${queryName}${vars} {
            ${queryName}${args} {
              ${buildFields(type.fields)}
            }
          }
        `;
        return;
      }

      // Error on any misconfigured queries or mutations
      throw new Error(`Bad query ${query.name}! Check your configuration.}`);
    });

    // All good!
    this.setState({ ready: true });
  };
  render() {
    if (!this.state.ready) return <AppLoader message="Generating graphs..." />;
    return this.props.children;
  }
}

export {
  RemoteGraphProvider,
  filterVariables,
  getTypeName,
  getTypeKind,
  isSubObject,
  isInputType,
  getQueries,
  getTypes,
};
