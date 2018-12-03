import { TypeKind } from 'graphql';
import gql from 'graphql-tag';
import { camelCase, capitalize, chain } from 'lodash';
import pluralize from 'pluralize';

import { resources as configResources } from '../config';
import { remote, fragments } from '../graphs';

let introspectionResults = null;

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
  const queries = introspectionResults.types.reduce((acc, type) => {
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
  const inputType = introspectionResults.types.find(
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

const initGraphqlProvider = schema => {
  introspectionResults = schema;

  const queries = schema.types.reduce((acc, type) => {
    if (type.name !== 'Query' && type.name !== 'Mutation') return acc;
    return [...acc, ...type.fields];
  }, []);
  const types = schema.types.filter(
    type => type.name !== 'Query' && type.name !== 'Mutation'
  );
  const potentialResources = types.filter(type => {
    return queries.some(query => query.name === camelCase(type.name));
  });
  const knownResources = potentialResources.map(r => r.name);

  // Generate remote queries
  configResources.forEach(({ type }) => {
    const resource = potentialResources.find(r => r.name === type);

    if (!resource) {
      throw new Error(
        `Unknown resource ${type}. Make sure it has been declared on your server side schema. Known resources are ${knownResources.join(
          ', '
        )}`
      );
    }

    // console.log(queries);
    // console.log(resource);

    let name;
    let query;

    // CREATE ONE query
    name = `create${capitalize(type)}`;
    query = queries.find(q => q.name === name);
    if (query) {
      remote.mutation[name] = gql`
          mutation ${name}(${buildVars(query.args)}) {
            ${name}(${buildArgs(query.args)}) {
              ${buildFields(resource.fields, types)}
            }
            ${fragments.resources}
          }
        `;
    }

    // READ MANY query
    name = `${camelCase(pluralize(type))}Connection`;
    query = queries.find(q => q.name === name);
    if (query) {
      remote.query[camelCase(pluralize(type))] = gql`
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
        ${fragments.resources}
      }
    `;
    }

    // READ ONE query
    name = camelCase(type);
    query = queries.find(q => q.name === name);
    if (query) {
      remote.query[name] = gql`
      query ${name}(${buildVars(query.args)}) {
        ${name}(${buildArgs(query.args)}) {
          ${buildFields(resource.fields, types)}
        }
        ${fragments.resources}
      }
    `;
    }

    // UPDATE ONE query
    name = `update${capitalize(type)}`;
    query = queries.find(q => q.name === name);
    if (query) {
      remote.mutation[name] = gql`
      mutation ${name}(${buildVars(query.args)}) {
        ${name}(${buildArgs(query.args)}) {
          ${buildFields(resource.fields, types)}
        }
        ${fragments.resources}
      }
    `;
    }

    // DELETE ONE query
    name = `delete${capitalize(type)}`;
    query = queries.find(q => q.name === name);
    if (query) {
      remote.mutation[name] = gql`
      mutation ${name}(${buildVars(query.args)}) {
        ${name}(${buildArgs(query.args)}) {
          ${buildFields(resource.fields, types, { excludeReferences: true })}
        }
        ${fragments.resources}
      }
    `;
    }
  });

  // for (const q of Object.values(remote.query)) {
  //   console.log(q.loc.source.body);
  // }
};

export { initGraphqlProvider, filterVariables };
