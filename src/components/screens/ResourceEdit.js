import React, { PureComponent, Fragment } from 'react';
import { Redirect, navigate } from '@reach/router';
import { Grid, GridCell, GridInner } from '@rmwc/grid';
import { Checkbox } from '@rmwc/checkbox';
import { Button, ButtonIcon } from '@rmwc/button';
import { Select } from '@rmwc/select';
import { TabBar, Tab } from '@rmwc/tabs';
import { IconButton } from '@rmwc/icon-button';
import { Query, Mutation } from 'react-apollo';
import { capitalize, has, startCase, get, unionBy, reject } from 'lodash';
import { DateTime } from 'luxon';
import { plural } from 'pluralize';
import { TextField, TextFieldHelperText } from '@rmwc/textfield';
import { CircularProgress } from '@rmwc/circular-progress';
import styled from 'styled-components';
import { Fab } from '@rmwc/fab';
import { buildURL } from 'react-imgix';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
import { Dashboard } from '@uppy/react';
// import Url from 'url-parse';
import { Helmet } from 'react-helmet';
import { Elevation } from '@rmwc/elevation';
import SparkMD5 from 'spark-md5';
import ChunkedFileReader from 'chunked-file-reader';
// import hasha from 'hasha';
import * as yup from 'yup';

import { remote } from '../../graphs';
// import { DefaultLayout } from '../layouts';
import {
  filterVariables,
  getType,
  isSubObject,
} from '../../providers/GraphqlProvider';
import { Subscribe, ResourcesContainer } from '../../state';

// import Text from '../ui/Text';
// import Placeholder from '../ui/Placeholder';

// const ContentGridCell = styled(GridCell)`
//   border: 2px solid ${props => lighten(0.5, props.theme.rmwc.primary)};
//   border-radius: 4px;
//   padding: 1rem;
// `;

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

const FormikDateField = ({
  field: { value, ...field }, // { name, value, onChange, onBlur }
  form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  help,
  ...props
}) => {
  let date = DateTime.fromISO(value);
  if (date.isValid) {
    date = `${date.toISODate()}T${date.toLocaleString(
      DateTime.TIME_24_SIMPLE
    )}`;
  } else {
    date = '';
  }

  return (
    <Fragment>
      <TextField type="datetime-local" value={date} {...field} {...props} />
      {help && <TextFieldHelperText persistent>{help}</TextFieldHelperText>}
      <ErrorMessage name={field.name} component={TextFieldHelperText} />
    </Fragment>
  );
};

const FormikTextField = ({
  field: { value, ...field }, // { name, value, onChange, onBlur }
  form, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  help,
  ...props
}) => {
  return (
    <Fragment>
      <TextField
        invalid={form.errors[field.name]}
        type="text"
        value={value || ''}
        {...field}
        {...props}
      />
      {help && <TextFieldHelperText persistent>{help}</TextFieldHelperText>}
      <ErrorMessage
        name={field.name}
        component={TextFieldHelperText}
        persistent
        validationMsg
      />
    </Fragment>
  );
};

class FormikImageField extends PureComponent {
  constructor(props) {
    super(props);
    this.uppy = Uppy({
      restrictions: { maxNumberOfFiles: 1 },
      autoProceed: false,
    });
    this.uppy.use(AwsS3, {
      limit: 1,
      timeout: 1000 * 60 * 60,
      getUploadParameters: async file => {
        // Add fingerprint to file
        const checksum = await this.getFileMD5(file.data);
        // Send a request to our signing endpoint.
        const response = await fetch(
          process.env.REACT_APP_GRAPHQL_ENDPOINT + '/getSignedUrl',
          {
            method: 'post',
            // Send and receive JSON.
            headers: {
              accept: 'application/json',
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              filename: file.name,
              contentType: file.type,
              checksum,
            }),
          }
        );
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        return result;
      },
    });
    this.uppy.on('upload-error', (file, error) => {
      this.uppy.info(error, 'error', 5000);
    });
    this.uppy.on('complete', result => {
      if (result.failed.length || !result.successful.length) return;
      const meta = result.successful[0].meta;
      props.form.setValues({
        src: `${process.env.REACT_APP_IMGIX_ENDPOINT}/${meta.key}`,
        filename: meta.filename,
        checksum: meta.checksum,
      });
      props.form.submitForm();
    });
  }
  getFileMD5 = file => {
    return new Promise((resolve, reject) => {
      const spark = new SparkMD5.ArrayBuffer();
      const reader = new ChunkedFileReader();
      reader.subscribe('chunk', e => {
        spark.append(e.chunk);
      });
      reader.subscribe('end', e => {
        const rawHash = spark.end();
        resolve(rawHash);
      });
      reader.readChunks(file);
    });
  };
  componentWillUnmount = () => {
    this.uppy.close();
  };
  render() {
    const {
      field: { value, ...field }, // { name, value, onChange, onBlur }
      form, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
      help,
      ...props
    } = this.props;

    return (
      <Fragment>
        {value && (
          <Elevation
            z={4}
            style={{
              display: 'inline-flex',
              borderRadius: '.25rem',
              overflow: 'hidden',
              marginBottom: '1rem',
            }}>
            <img
              src={buildURL(value, {
                height: 480,
                fit: 'max',
              })}
              alt="preview"
              style={{
                maxWidth: '100%',
              }}
            />
          </Elevation>
        )}
        {value && (
          <TextField
            {...field}
            {...props}
            type="text"
            value={value || ''}
            disabled
          />
        )}
        {this.uppy && !value && (
          <Dashboard
            {...field}
            {...props}
            uppy={this.uppy}
            plugins={['AwsS3', 'GoogleDrive']}
            width={1920}
            height={400}
            // note="Images and video only, 2–3 files, up to 1 MB"
            proudlyDisplayPoweredByUppy={false}
          />
        )}
        {help && <TextFieldHelperText persistent>{help}</TextFieldHelperText>}
        <ErrorMessage name={field.name} component={TextFieldHelperText} />
      </Fragment>
    );
  }
}

const FormikCheckbox = ({
  field: { value, ...field }, // { name, value, onChange, onBlur }
  form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  help,
  ...props
}) => (
  <Fragment>
    <Checkbox checked={!!value} {...field} {...props} />
    {help && <TextFieldHelperText persistent>{help}</TextFieldHelperText>}
    <ErrorMessage name={field.name} component={TextFieldHelperText} />
  </Fragment>
);

const FormikReferenceField = ({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  help,
  referenceType,
  referenceLabel,
  referencePath,
  ...props
}) => (
  <Query query={remote.query[`${referenceType}Connection`]}>
    {({ loading, data }) => {
      if (loading) {
        return (
          <Fragment>
            <Select
              label={field.name}
              options={['Loading...']}
              value={'Loading...'}
            />
            <IconButton disabled type="button" icon={<CircularProgress />} />
          </Fragment>
        );
      }
      const name = `${referenceType}Connection`;
      const items = data[name].edges
        .map(e => e.node)
        .map(item => {
          const label =
            item[referenceLabel] || item.name || item.title || item.id;
          return {
            label: label,
            value: item.id,
            key: item.id,
          };
        });
      return (
        <Fragment>
          <Select {...field} {...props} options={items} />
          {referencePath && (
            <IconButton
              type="button"
              icon="link"
              onClick={() => navigate(referencePath)}
            />
          )}
          {help && <TextFieldHelperText persistent>{help}</TextFieldHelperText>}
          <ErrorMessage name={field.name} component={TextFieldHelperText} />
        </Fragment>
      );
    }}
  </Query>
);

const FormikSelectField = ({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  path,
  help,
  ...props
}) => {
  const type = remote.schema.types.find(
    type => type.name.toLowerCase() === field.name
  );
  const items = type.enumValues.map(e => {
    return {
      label: e.name,
      value: e.name,
    };
  });
  return (
    <Fragment>
      <Select {...field} {...props} options={items} />
      {help && <TextFieldHelperText persistent>{help}</TextFieldHelperText>}
      <ErrorMessage name={field.name} component={TextFieldHelperText} />
    </Fragment>
  );
};

const getInitialValues = (item, resource, allSchemaFields) => {
  return Object.values(resource.edit.fields).reduce((acc, field) => {
    // Is reference
    const schemaField = allSchemaFields.find(f => f.name === field.source);
    if (isSubObject(schemaField)) {
      acc[field.source] = get(item, `${field.source}.id`);
    } else {
      acc[field.source] = get(item, field.source);
    }
    return acc;
  }, {});
};

class ResourceEdit extends PureComponent {
  state = { activeTab: 0 };
  render() {
    const { activeTab } = this.state;
    const { resource: resourceParam, id: resourceId } = this.props;
    const canBeDeleted = has(
      remote.mutation,
      `delete${capitalize(resourceParam)}`
    );
    const isNew = resourceId === 'new';
    return (
      <Subscribe to={[ResourcesContainer]}>
        {({ state: { resources } }) => (
          <Query
            fetchPolicy="cache-and-network"
            query={remote.query[resourceParam]}
            variables={{ where: { id: resourceId } }}>
            {({ loading, data, client }) => {
              if (loading) return null;
              if (!isNew && !data[resourceParam]) {
                return (
                  <Redirect to={`/list/${plural(resourceParam)}`} noThrow />
                );
              }
              // Format fields
              let item = isNew ? {} : data[resourceParam];
              const resource = resources.find(
                r => r.type === capitalize(resourceParam)
              );
              // Create validation schema
              const schemaFields = remote.schema.types.find(
                type => type.name === capitalize(resource.type)
              ).fields;
              const schemaInputFields = remote.schema.types.find(
                type =>
                  type.name ===
                  `${capitalize(resource.type)}${
                    isNew ? 'CreateInput' : 'UpdateInput'
                  }`
              ).inputFields;
              const allSchemaFields = unionBy(
                reject(schemaInputFields, isSubObject),
                schemaFields,
                'name'
              );
              const initialValues = getInitialValues(
                item,
                resource,
                allSchemaFields
              );
              const title =
                initialValues.name ||
                initialValues.title ||
                capitalize(resourceId);
              const ResourceEditSchema = schemaInputFields.reduce(
                (acc, field) => {
                  const typeName = getType(field).name;
                  const typeKind = field.type.kind;
                  const config = resource.edit.fields.find(
                    f => f.source === field.name
                  );
                  if (!config) return acc;
                  let schema = yup;
                  if (
                    ['String', 'ID'].includes(typeName) ||
                    ['ENUM'].includes(typeKind)
                  ) {
                    schema = schema.string('String');
                  } else if (['DateTime'].includes(typeName)) {
                    schema = schema.date('Please enter a valid date');
                  } else {
                    return acc;
                  }
                  if (['Email'].includes(config.type)) {
                    schema = schema.email('Please enter a valid email');
                  }
                  if (typeKind === 'NON_NULL') {
                    schema = schema.required('Required');
                  }

                  acc[field.name] = schema;

                  if (['Password'].includes(config.type)) {
                    schema = schema.oneOf(
                      [yup.ref(field.name)],
                      'Passwords must match'
                    );
                    acc[`${field.name}Confirm`] = schema;
                  }

                  return acc;
                },
                {}
              );
              return (
                <Grid>
                  <Helmet
                    title={`Edit ${capitalize(resourceParam)}: ${title}`}
                  />
                  <GridCell span={12}>
                    <TabBar
                      activeTabIndex={activeTab}
                      onActivate={evt =>
                        this.setState({ activeTab: evt.detail.index })
                      }>
                      <Tab icon="edit">Edit</Tab>
                      <Tab icon="pageview" disabled>
                        Preview
                      </Tab>
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
                        ? `create${capitalize(resourceParam)}`
                        : `update${capitalize(resourceParam)}`;
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
                            `/edit/${resourceParam}/${data[name].id}`
                          );
                        }
                        // Reset form values with updated data
                        resetForm(
                          getInitialValues(
                            data[name],
                            resource,
                            allSchemaFields
                          )
                        );
                      } catch ({ graphQLErrors }) {
                        setSubmitting(false);
                        if (graphQLErrors) {
                          graphQLErrors.forEach(error => {
                            setFieldError(error.data.field, error.message);
                          });
                        }
                      }
                    }}>
                    {({ isSubmitting, dirty, resetForm, setSubmitting }) => {
                      return (
                        <GridCell span={12}>
                          <Form>
                            <GridInner>
                              {resource.edit.fields.map((field, idx) => {
                                const schemaField = allSchemaFields.find(
                                  f => f.name === field.source
                                );
                                const name = schemaField.name;
                                const typeName = getType(schemaField).name;
                                const typeKind = schemaField.type.kind;
                                const type = field.type
                                  ? field.type.split(':')[0]
                                  : typeKind === 'ENUM'
                                  ? typeKind
                                  : typeName;
                                let disabled =
                                  field.disabled ||
                                  schemaField.__typename === '__Field';

                                if (isNew && disabled) return null;

                                if (type === 'ENUM') {
                                  return (
                                    <GridCell span={12} key={name}>
                                      <Field
                                        component={FormikSelectField}
                                        name={name}
                                        disabled={disabled}
                                        label={startCase(name)}
                                      />
                                    </GridCell>
                                  );
                                }
                                if (type === 'DateTime') {
                                  return (
                                    <GridCell span={12} key={name}>
                                      <Field
                                        component={FormikDateField}
                                        name={name}
                                        disabled={disabled}
                                        label={startCase(name)}
                                      />
                                    </GridCell>
                                  );
                                }
                                if (isSubObject(schemaField)) {
                                  const referenceObject = get(item, name);
                                  const referenceType = getType(
                                    schemaField
                                  ).name.toLowerCase();
                                  const referencePath = isNew
                                    ? null
                                    : `/edit/${referenceType}/${
                                        referenceObject.id
                                      }`;
                                  return (
                                    <GridCell span={12} key={name}>
                                      <Field
                                        component={FormikReferenceField}
                                        name={name}
                                        label={startCase(name)}
                                        referenceType={plural(referenceType)}
                                        referenceLabel={field.reference}
                                        referencePath={referencePath}
                                      />
                                    </GridCell>
                                  );
                                }
                                if (type === 'Boolean') {
                                  return (
                                    <GridCell span={12} key={name}>
                                      <Field
                                        component={FormikCheckbox}
                                        name={name}
                                        disabled={disabled}
                                        label={startCase(name)}
                                      />
                                    </GridCell>
                                  );
                                }
                                if (type === 'Image') {
                                  return (
                                    <GridCell span={12} key={name}>
                                      <Field
                                        style={{ width: '100%' }}
                                        component={FormikImageField}
                                        name={name}
                                        disabled={disabled}
                                        label={startCase(name)}
                                      />
                                    </GridCell>
                                  );
                                }
                                if (type === 'Password') {
                                  return (
                                    <Fragment key={name}>
                                      <GridCell span={12}>
                                        <Field
                                          style={{ width: '100%' }}
                                          type="password"
                                          autoComplete="new-password"
                                          component={FormikTextField}
                                          name={name}
                                          disabled={disabled}
                                          label={
                                            isNew
                                              ? startCase(name)
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
                                          name={`${name}Confirm`}
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
                                return (
                                  <GridCell span={12} key={name}>
                                    <Field
                                      style={{ width: '100%' }}
                                      disabled={disabled}
                                      component={FormikTextField}
                                      name={name}
                                      label={startCase(name)}
                                    />
                                  </GridCell>
                                );
                              })}
                              <Actions span={12}>
                                <Button
                                  unelevated
                                  type="submit"
                                  disabled={isSubmitting || !dirty}>
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
                                        `delete${capitalize(resourceParam)}`
                                      ]
                                    }
                                    onError={error => window.alert(error)}
                                    onCompleted={() => {
                                      navigate(
                                        `/list/${plural(resourceParam)}`
                                      );
                                    }}
                                    variables={{ where: { id: resourceId } }}>
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
      </Subscribe>
    );
  }
}
export default ResourceEdit;
