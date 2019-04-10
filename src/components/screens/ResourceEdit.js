import React, { PureComponent, Fragment } from 'react';
import { Redirect, navigate } from '@reach/router';
import { Grid, GridCell, GridInner } from '@rmwc/grid';
import { Button, ButtonIcon } from '@rmwc/button';
import { TabBar, Tab } from '@rmwc/tabs';
import { IconButton } from '@rmwc/icon-button';
import { Query, Mutation } from 'react-apollo';
import {
  upperFirst,
  has,
  startCase,
  get,
  unionBy,
  camelCase,
  kebabCase,
} from 'lodash';
import { plural } from 'pluralize';
import { CircularProgress } from '@rmwc/circular-progress';
import styled from 'styled-components';
import { Fab } from '@rmwc/fab';
import { Formik, Form, Field } from 'formik';
import { Helmet } from 'react-helmet';
import * as yup from 'yup';
import { remote } from '../../graphs';
import {
  FormikSelect,
  FormikCheckbox,
  FormikTextField,
  FormikReferenceField,
  FormikDateField,
  FormikFileField,
  FormikListField,
} from '../ui/forms';
import {
  filterVariables,
  getTypeName,
  getTypeKind,
  isSubObject,
  isListObject,
} from '../../providers/RemoteGraphProvider';
import { Editor } from '../ui/Editor';
import { FormikRefMultiSelect } from '../ui/forms/FormikRefMultiSelect';

const FabActions = styled('div')`
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  z-index: 1002;
  button:not(:last-child) {
    margin-right: 1rem;
  }
`;
const Actions = styled(GridCell)`
  background-color: #f5f5f5;
  padding: 1rem;
  button:not(:last-child) {
    margin-right: 1rem;
  }
`;
const DangerButton = styled(Button)`
  --mdc-theme-primary: ${({ theme }) => theme.rmwc.error};
`;

const getInitialValues = (item, modelConfig) => {
  return modelConfig.editFields.reduce((acc, field) => {
    return { ...acc, [field.name]: item[field.name] };
  }, {});
};

class ResourceEdit extends PureComponent {
  state = { activeTab: 0 };
  render() {
    const { activeTab } = this.state;
    const { idParam } = this.props;
    const resourceParam = camelCase(this.props.resourceParam);
    const canBeDeleted = has(
      remote.mutation,
      `delete${upperFirst(resourceParam)}`
    );
    console.log(resourceParam);
    const isNew = idParam === 'new';
    return (
      <Query query={remote.query.modelConfigsConnection}>
        {({ data: { modelConfigsConnection } }) => (
          <Query
            fetchPolicy="cache-and-network"
            query={remote.query[resourceParam]}
            variables={{ where: { id: idParam } }}>
            {({ loading, data, client }) => {
              if (loading) return null;

              if (!isNew && !data[resourceParam]) {
                return (
                  <Redirect
                    to={`/list/${plural(kebabCase(resourceParam))}`}
                    noThrow
                  />
                );
              }
              // Format fields
              let item = isNew ? {} : data[resourceParam];

              const modelConfig = modelConfigsConnection.edges
                .map(e => e.node)
                .find(node => node.type === upperFirst(resourceParam));

              // Create validation schema
              const schemaType = remote.schema.types.find(
                ({ name }) => name === modelConfig.type
              );
              const schemaFields = schemaType.fields;

              const createInputFields = remote.schema.types.find(
                type =>
                  type.name === `${upperFirst(modelConfig.type)}CreateInput`
              ).inputFields;

              const updateInputFields = remote.schema.types.find(
                type =>
                  type.name === `${upperFirst(modelConfig.type)}UpdateInput`
              ).inputFields;

              const schemaInputFields = isNew
                ? createInputFields
                : updateInputFields;

              const allSchemaFields = unionBy(
                // reject(schemaInputFields, isListObject),
                schemaInputFields,
                schemaFields,
                'name'
              );
              const initialValues = getInitialValues(item, modelConfig);

              const title =
                initialValues.name ||
                initialValues.title ||
                upperFirst(idParam);

              const shouldBeRequired = (fieldName, fieldConfig) => {
                if (
                  !isNew &&
                  (['Password'].includes(fieldConfig.type) ||
                    fieldConfig.widget === 'Password')
                ) {
                  return false;
                }
                return createInputFields.some(
                  ({ name, type }) =>
                    name === fieldName && type.kind === 'NON_NULL'
                );
              };

              const ResourceEditSchema = schemaInputFields.reduce(
                (acc, inputField) => {
                  const typeName = getTypeName(inputField.type);
                  const typeKind = inputField.type.kind;
                  const fieldConfig = modelConfig.editFields.find(
                    ({ name }) => name === inputField.name
                  );
                  if (!fieldConfig) {
                    return acc;
                  }
                  let schema = yup;
                  if (
                    ['String', 'ID', 'Password'].includes(typeName) ||
                    ['ENUM'].includes(typeKind)
                  ) {
                    schema = schema.string('String');
                  } else if (
                    ['Email'].includes(typeName) ||
                    fieldConfig.widget === 'Email'
                  ) {
                    schema = schema
                      .string()
                      .email('Please enter a valid email');
                  } else if (['Boolean'].includes(typeName)) {
                    schema = schema.boolean('Value must be true or false');
                  } else if (['DateTime'].includes(typeName)) {
                    schema = schema.date('Please enter a valid date');
                  } else {
                    schema = schema.mixed();
                  }

                  if (shouldBeRequired(inputField.name, fieldConfig)) {
                    schema = schema.required('Required');
                  } else {
                    schema = schema.nullable();
                  }

                  if (
                    ['Password'].includes(typeName) ||
                    fieldConfig.widget === 'Password'
                  ) {
                    const confirmSchema = schema.oneOf(
                      [yup.ref(inputField.name)],
                      'Passwords must match'
                    );
                    acc[`${inputField.name}Confirm`] = confirmSchema;

                    schema = schema.oneOf(
                      [yup.ref(`${inputField.name}Confirm`)],
                      'Passwords must match'
                    );
                  }

                  acc[inputField.name] = schema;

                  return acc;
                },
                {}
              );

              return (
                <Grid>
                  <Helmet
                    title={`Edit ${upperFirst(resourceParam)}: ${title}`}
                  />
                  <GridCell span={1}>
                    <IconButton
                      icon="arrow_back"
                      onClick={() => navigate('back')}
                    />
                  </GridCell>
                  <GridCell span={11}>
                    <TabBar
                      activeTabIndex={activeTab}
                      onActivate={evt =>
                        this.setState({ activeTab: evt.detail.index })
                      }>
                      <Tab icon="edit">Edit</Tab>
                    </TabBar>
                  </GridCell>

                  <Formik
                    initialValues={initialValues}
                    validationSchema={yup.object().shape(ResourceEditSchema)}
                    onSubmit={async (
                      values,
                      { resetForm, setSubmitting, setFieldError }
                    ) => {
                      const name = isNew
                        ? `create${upperFirst(resourceParam)}`
                        : `update${upperFirst(resourceParam)}`;
                      // Call remote mutation
                      try {
                        const { data } = await client.mutate({
                          mutation: remote.mutation[name],
                          variables: {
                            where: values.id ? { id: values.id } : undefined,
                            data: filterVariables(name, values),
                          },
                        });
                        if (isNew) {
                          return navigate(
                            `/edit/${kebabCase(resourceParam)}/${data[name].id}`
                          );
                        }
                        // Reset form values with updated data
                        resetForm(getInitialValues(data[name], modelConfig));
                      } catch ({ graphQLErrors }) {
                        setSubmitting(false);
                        if (graphQLErrors) {
                          graphQLErrors.forEach(error => {
                            if (error.data && error.data.field) {
                              return setFieldError(
                                error.data.field,
                                error.message
                              );
                            } else if (error.path) {
                              return setFieldError(
                                error.path[error.path.length - 1],
                                error.message
                              );
                            }
                            window.alert(error.message);
                          });
                        }
                      }
                    }}>
                    {({
                      isSubmitting,
                      dirty,
                      resetForm,
                      submitForm,
                      setSubmitting,
                    }) => {
                      return (
                        <GridCell span={12}>
                          <Form
                            onKeyDown={evt => {
                              // Handle form submission via keypress
                              const { key, metaKey, ctrlKey } = evt;
                              if (key === 'Enter') {
                                evt.preventDefault();
                              } else if (
                                (key === 's' && metaKey) ||
                                (key === 's' && ctrlKey)
                              ) {
                                evt.preventDefault();
                                if (!isSubmitting && dirty) {
                                  submitForm();
                                }
                              }
                            }}>
                            <GridInner>
                              {modelConfig.editFields.map(
                                (fieldConfig, idx) => {
                                  const schemaField = allSchemaFields.find(
                                    ({ name }) => name === fieldConfig.name
                                  );
                                  const typeName = getTypeName(
                                    schemaField.type
                                  );
                                  const typeKind = getTypeKind(
                                    schemaField.type
                                  );
                                  const fieldName = fieldConfig.name;

                                  // Disable all NON input types
                                  let disabled =
                                    schemaField.__typename !== '__InputValue' ||
                                    !fieldConfig.enabled;

                                  // Hide all disabled fields in new form
                                  if (isNew && disabled) {
                                    return null;
                                  }

                                  if (fieldConfig.widget === 'Editor') {
                                    return (
                                      <GridCell span={12} key={fieldName}>
                                        <Field
                                          name={fieldName}
                                          label={startCase(fieldName)}
                                          component={Editor}
                                          config={fieldConfig}
                                        />
                                      </GridCell>
                                    );
                                  }
                                  if (typeKind === 'ENUM') {
                                    return (
                                      <GridCell span={12} key={fieldName}>
                                        <Field
                                          component={FormikSelect}
                                          name={fieldName}
                                          disabled={disabled}
                                          label={startCase(fieldName)}
                                        />
                                      </GridCell>
                                    );
                                  }
                                  if (typeName === 'DateTime') {
                                    return (
                                      <GridCell span={12} key={fieldName}>
                                        <Field
                                          component={FormikDateField}
                                          name={fieldName}
                                          disabled={disabled}
                                          label={startCase(fieldName)}
                                        />
                                      </GridCell>
                                    );
                                  }
                                  if (isListObject(schemaField)) {
                                    return (
                                      <GridCell span={12} key={fieldName}>
                                        <Field
                                          component={FormikRefMultiSelect}
                                          name={fieldName}
                                          item={item}
                                          fieldConfig={fieldConfig}
                                          schemaField={schemaField}
                                          label={startCase(fieldName)}
                                        />
                                      </GridCell>
                                    );
                                  }
                                  if (schemaField.type.kind === 'LIST') {
                                    return (
                                      <GridCell span={12} key={fieldName}>
                                        <Field
                                          component={FormikListField}
                                          name={fieldName}
                                          disabled={disabled}
                                          label={startCase(fieldName)}
                                        />
                                      </GridCell>
                                    );
                                  }
                                  if (isSubObject(schemaField)) {
                                    const referenceObject = get(
                                      item,
                                      fieldName
                                    );
                                    const referenceType = fieldConfig.type.toLowerCase();
                                    const referencePath =
                                      isNew || !referenceObject
                                        ? null
                                        : `/edit/${referenceType}/${
                                            referenceObject.id
                                          }`;
                                    return (
                                      <GridCell span={12} key={fieldName}>
                                        <Field
                                          component={FormikReferenceField}
                                          name={fieldName}
                                          label={startCase(fieldName)}
                                          referenceType={referenceType}
                                          referenceLabel={fieldConfig.reference}
                                          referencePath={referencePath}
                                        />
                                      </GridCell>
                                    );
                                  }

                                  if (typeName === 'Boolean') {
                                    return (
                                      <GridCell span={12} key={fieldName}>
                                        <Field
                                          component={FormikCheckbox}
                                          name={fieldName}
                                          disabled={disabled}
                                          label={startCase(fieldName)}
                                        />
                                      </GridCell>
                                    );
                                  }
                                  if (fieldConfig.widget === 'File') {
                                    return (
                                      <GridCell span={12} key={fieldName}>
                                        <Field
                                          style={{ width: '100%' }}
                                          component={FormikFileField}
                                          name={fieldName}
                                          disabled={disabled}
                                          label={startCase(fieldName)}
                                        />
                                      </GridCell>
                                    );
                                  }
                                  if (
                                    typeName === 'Password' ||
                                    fieldConfig.widget === 'Password'
                                  ) {
                                    return (
                                      <Fragment key={fieldName}>
                                        <GridCell span={12}>
                                          <Field
                                            style={{ width: '100%' }}
                                            type="password"
                                            autoComplete="new-password"
                                            component={FormikTextField}
                                            name={fieldName}
                                            disabled={disabled}
                                            label={
                                              isNew
                                                ? startCase(fieldName)
                                                : 'Enter New Password'
                                            }
                                          />
                                        </GridCell>
                                        <GridCell span={12}>
                                          <Field
                                            style={{ width: '100%' }}
                                            type="password"
                                            disabled={disabled}
                                            autoComplete="new-password"
                                            component={FormikTextField}
                                            name={`${fieldName}Confirm`}
                                            label={
                                              isNew
                                                ? 'Confirm Password'
                                                : 'Confirm New Password'
                                            }
                                          />
                                        </GridCell>
                                      </Fragment>
                                    );
                                  }
                                  // Render FormikTextField by default
                                  return (
                                    <GridCell span={12} key={fieldName}>
                                      <Field
                                        style={{ width: '100%' }}
                                        disabled={disabled}
                                        component={FormikTextField}
                                        name={fieldName}
                                        label={startCase(fieldName)}
                                      />
                                    </GridCell>
                                  );
                                }
                              )}
                              <Actions span={12}>
                                <Button
                                  unelevated
                                  type="submit"
                                  disabled={isSubmitting || !dirty}
                                  onClick={submitForm}>
                                  {isSubmitting ? (
                                    <span>
                                      <ButtonIcon icon={<CircularProgress />} />{' '}
                                      Saving...
                                    </span>
                                  ) : (
                                    <span>
                                      <ButtonIcon icon="save" /> Save
                                    </span>
                                  )}
                                </Button>
                                <Button
                                  outlined
                                  type="reset"
                                  disabled={isSubmitting || !dirty}
                                  onClick={() => resetForm(initialValues)}>
                                  <ButtonIcon icon="undo" /> Undo
                                </Button>
                                {canBeDeleted && (
                                  <Mutation
                                    mutation={
                                      remote.mutation[
                                        `delete${upperFirst(resourceParam)}`
                                      ]
                                    }
                                    onError={error => window.alert(error)}
                                    onCompleted={() => {
                                      navigate(
                                        `/list/${plural(
                                          kebabCase(resourceParam)
                                        )}`
                                      );
                                    }}
                                    variables={{ where: { id: idParam } }}>
                                    {handleDelete => (
                                      <DangerButton
                                        type="button"
                                        outlined
                                        onClick={() => {
                                          setSubmitting(true);
                                          handleDelete();
                                        }}
                                        disabled={isNew || isSubmitting}>
                                        <ButtonIcon icon="delete" /> Delete
                                      </DangerButton>
                                    )}
                                  </Mutation>
                                )}
                              </Actions>
                              <FabActions>
                                <Fab
                                  icon="save"
                                  label="Save"
                                  exited={isSubmitting || !dirty}
                                  type="submit"
                                />
                                <Fab
                                  icon="add"
                                  type="button"
                                  onClick={() => {
                                    navigate(`/edit/${resourceParam}/new`);
                                    resetForm();
                                  }}
                                />
                              </FabActions>
                            </GridInner>
                          </Form>
                        </GridCell>
                      );
                    }}
                  </Formik>
                  <GridCell style={{ height: 64 }} />
                </Grid>
              );
            }}
          </Query>
        )}
      </Query>
    );
  }
}
export default ResourceEdit;
