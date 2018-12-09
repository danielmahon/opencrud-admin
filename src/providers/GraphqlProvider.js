import { TypeKind } from 'graphql';
import gql from 'graphql-tag';
import { chain, startsWith, endsWith } from 'lodash';

import { remote } from '../graphs';

const isNotGraphqlPrivateType = type => !type.name.startsWith('__');

const isSubObject = field => {
  return (
    field.type.kind === TypeKind.OBJECT ||
    field.type.kind === TypeKind.INPUT_OBJECT ||
    (field.type.kind === TypeKind.LIST &&
      (field.type.ofType.kind === TypeKind.OBJECT ||
        field.type.ofType.kind === TypeKind.INPUT_OBJECT ||
        field.type.ofType.kind === TypeKind.LIST)) ||
    (field.type.kind === TypeKind.NON_NULL &&
      (field.type.ofType.kind === TypeKind.OBJECT ||
        field.type.ofType.kind === TypeKind.INPUT_OBJECT ||
        field.type.ofType.kind === TypeKind.LIST))
  );
};

const getType = field => {
  if (
    field.type.kind === TypeKind.LIST ||
    field.type.kind === TypeKind.NON_NULL
  ) {
    return field.type.ofType;
  }
  return field.type;
};

const buildFields = (fields, types, { excludeReferences } = {}) => {
  const queryFields = fields
    .filter(isNotGraphqlPrivateType)
    .map(field => {
      if (isSubObject(field)) {
        const typeToCheck = getType(field);
        const type = types.find(t => t.name === typeToCheck.name);
        if (type && !excludeReferences) {
          return `${field.name} { ${buildFields(type.fields, types)} }`;
        }
        return false;
      }
      return field.name;
    })
    .filter(f => f !== false)
    .join(' ');
  return queryFields;
};

const buildVars = args => {
  return args
    .map(arg => {
      return arg.type.kind === 'NON_NULL'
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

// const buildGetVariables = params => {
//   return {
//     where: { id: params.id },
//   };
// };

const filterVariables = (name, variables) => {
  const queries = remote.schema.types.reduce((acc, type) => {
    if (type.name !== 'Query' && type.name !== 'Mutation') return acc;
    return [...acc, ...type.fields];
  }, []);
  const query = queries.find(q => q.name === name);

  if (!query) {
    throw new Error(
      `Unknown query/mutation ${name}. Make sure it has been declared on your server side schema. Known resources are ${queries
        .map(q => q.name)
        .join(', ')}`
    );
  }

  // Filter update data based on InputType Fields
  const dataArg = query.args.find(a => a.name === 'data');
  const inputType = remote.schema.types.find(
    t => t.name === dataArg.type.ofType.name
  );

  const validData = chain(variables)
    .pick(inputType.inputFields.map(f => f.name))
    .mapValues((val, key) => {
      const inputField = inputType.inputFields.find(f => f.name === key);
      if (inputField && isSubObject(inputField)) {
        return { connect: { id: val } };
      }
      return val;
    })
    .value();

  return validData;
};

// const buildListVariables = _params => {
//   return {
//     where: _params.filter,
//     orderBy: _params.sort
//       ? `${_params.sort.field}_${_params.sort.order}`
//       : null,
//     skip: _params.pagination
//       ? _params.pagination.perPage * (_params.pagination.page - 1)
//       : null,
//     first: _params.pagination ? _params.pagination.perPage : null,
//   };
// };

const initGraphqlProvider = () =>
  new Promise(resolve => {
    const queries = remote.schema.types.reduce((acc, type) => {
      if (type.name !== 'Query' && type.name !== 'Mutation') return acc;
      return [...acc, ...type.fields];
    }, []);
    const mutationFields = remote.schema.types.find(
      type => type.name === 'Mutation'
    ).fields;
    const queryFields = remote.schema.types.find(type => type.name === 'Query')
      .fields;
    const isMutation = query => {
      return mutationFields.some(field => field.name === query.name);
    };
    const isQuery = query => {
      return queryFields.some(field => field.name === query.name);
    };
    const types = remote.schema.types.filter(
      type => type.name !== 'Query' && type.name !== 'Mutation'
    );
    // const potentialResources = types.filter(type => {
    //   return queries.some(query => query.name === camelCase(type.name));
    // });
    const knownResources = types.map(r => r.name);

    // Generate remote queries
    queries.forEach(query => {
      const type = getType(query).name.replace('Connection', '');
      const name = query.name;
      const resource = types.find(r => r.name === type);

      if (!resource) {
        throw new Error(
          `Unknown resource ${type}. Make sure it has been declared on your server side schema. Known resources are ${knownResources.join(
            ', '
          )}`
        );
      }

      // CREATE ONE query
      if (resource && startsWith(name, 'create')) {
        remote.mutation[name] = gql`
          mutation ${name}(${buildVars(query.args)}) {
            ${name}(${buildArgs(query.args)}) {
              ${buildFields(resource.fields, types)}
            }
          }
        `;
        return;
      }

      // READ MANY query
      if (resource && endsWith(name, 'Connection')) {
        remote.query[name] = gql`
      query ${name}(${buildVars(query.args)}) {
        ${name}(${buildArgs(query.args)}) {
          edges {
            node {
              ${buildFields(resource.fields, types)}
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

      // UPDATE ONE query
      if (resource && startsWith(name, 'update')) {
        remote.mutation[name] = gql`
          mutation ${name}(${buildVars(query.args)}) {
            ${name}(${buildArgs(query.args)}) {
              ${buildFields(resource.fields, types)}
            }
          }
        `;
        return;
      }

      // // DELETE MANY query
      // if (resource && startsWith(name, 'deleteMany')) {
      //   remote.mutation[name] = gql`
      //     mutation ${name}(${buildVars(query.args)}) {
      //       ${name}(${buildArgs(query.args)}) {
      //         ${buildFields(resource.fields, types, {
      //           excludeReferences: true,
      //         })}
      //       }
      //     }
      //   `;
      //   return;
      // }

      // DELETE ONE query
      if (resource && startsWith(name, 'delete')) {
        remote.mutation[name] = gql`
          mutation ${name}(${buildVars(query.args)}) {
            ${name}(${buildArgs(query.args)}) {
              ${buildFields(resource.fields, types, {
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
        remote.query[name] = gql`
        query ${name}${vars} {
          ${name}${args} {
            ${buildFields(resource.fields, types)}
          }
        }
      `;
        return;
      }

      // Add mutation
      if (isMutation(query)) {
        const vars = query.args.length ? `(${buildVars(query.args)})` : '';
        const args = query.args.length ? `(${buildArgs(query.args)})` : '';
        remote.mutation[name] = gql`
      mutation ${name}${vars} {
        ${name}${args} {
          ${buildFields(resource.fields, types)}
        }
      }
    `;
        return;
      }

      // Handle all else
      // TODO: Remove once we "know" all queries will be handled

      console.log(query);
      console.log(resource);

      throw new Error(
        `Unknown query ${query.name}! Check your configuration.}`
      );
    });
    resolve();
  });

export { initGraphqlProvider, filterVariables, getType, isSubObject };
