import React, { PureComponent, Fragment } from 'react';
import { Redirect, navigate } from '@reach/router';
import { Grid, GridCell, GridInner } from '@rmwc/grid';
import { Checkbox } from '@rmwc/checkbox';
import { Button, ButtonIcon } from '@rmwc/button';
import { Select } from '@rmwc/select';
import { TabBar, Tab } from '@rmwc/tabs';
import { IconButton } from '@rmwc/icon-button';
import { Query, Mutation } from 'react-apollo';
import { camelCase, capitalize, has, startCase, get } from 'lodash';
import { DateTime } from 'luxon';
import { plural } from 'pluralize';
import { TextField, TextFieldHelperText } from '@rmwc/textfield';
import { CircularProgress } from '@rmwc/circular-progress';
import styled from 'styled-components';
import { Fab } from '@rmwc/fab';
import Imgix from 'react-imgix';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
import { Dashboard } from '@uppy/react';
import Url from 'url-parse';
import { Helmet } from 'react-helmet';
import { Elevation } from '@rmwc/elevation';
import SparkMD5 from 'spark-md5';
import ChunkedFileReader from 'chunked-file-reader';
import hasha from 'hasha';

import { remote } from '../../graphs';
import { DefaultLayout } from '../layouts';
import { filterVariables } from '../../providers/GraphqlProvider';

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
}) => (
  <Fragment>
    <TextField type="text" value={value || ''} {...field} {...props} />
    {help && <TextFieldHelperText persistent>{help}</TextFieldHelperText>}
    <ErrorMessage name={field.name} component={TextFieldHelperText} />
  </Fragment>
);

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
              height: 480,
            }}>
            <Imgix src={value} height={480} alt="preview" />
          </Elevation>
        )}
        {value && (
          <TextField
            disabled
            type="text"
            value={value || ''}
            {...field}
            {...props}
          />
        )}
        {this.uppy && !value && (
          <Dashboard
            uppy={this.uppy}
            plugins={['AwsS3', 'GoogleDrive']}
            width={1920}
            height={400}
            // note="Images and video only, 2–3 files, up to 1 MB"
            proudlyDisplayPoweredByUppy={false}
            {...field}
            {...props}
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
  path,
  help,
  referenceType,
  referenceLabel,
  ...props
}) => (
  <Query query={remote.query[referenceType]}>
    {({ loading, data }) => {
      if (loading) return <CircularProgress />;
      const name = `${referenceType}Connection`;
      const items = data[name].edges.map(e => {
        return {
          label: get(e.node, referenceLabel),
          value: get(e.node, 'id'),
        };
      });
      return (
        <Fragment>
          <Select {...field} {...props} options={items} />
          {path && (
            <IconButton
              type="button"
              icon="link"
              onClick={() => navigate(path)}
            />
          )}
          {help && <TextFieldHelperText persistent>{help}</TextFieldHelperText>}
          <ErrorMessage name={field.name} component={TextFieldHelperText} />
        </Fragment>
      );
    }}
  </Query>
);

const filterValues = (item, resource) => {
  return Object.values(resource.edit.fields).reduce((acc, field) => {
    // Is reference
    const refField = field.source.split('.')[0];
    if (field.source.indexOf('.') !== -1) {
      acc[refField] = get(item, `${refField}.id`);
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
      <Query
        fetchPolicy="cache-and-network"
        query={remote.query[resourceParam]}
        variables={{ where: { id: resourceId } }}>
        {({ loading, data, client }) => {
          if (loading) return null;
          if (!isNew && !data[resourceParam]) {
            return <Redirect to={`/list/${plural(resourceParam)}`} noThrow />;
          }
          // Format fields
          let item = isNew ? {} : data[resourceParam];
          const resource = data.resources.find(
            r => r.type === capitalize(resourceParam)
          );
          const initialValues = filterValues(item, resource);
          const title =
            initialValues.name || initialValues.title || capitalize(resourceId);
          return (
            <Grid>
              <Helmet title={`Edit ${capitalize(resourceParam)}: ${title}`} />
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
                onSubmit={(values, { resetForm, setSubmitting }) => {
                  const name = isNew
                    ? `create${capitalize(resourceParam)}`
                    : `update${capitalize(resourceParam)}`;
                  // Call remote mutation
                  client
                    .mutate({
                      mutation: remote.mutation[name],
                      variables: {
                        where: values.id ? { id: values.id } : undefined,
                        data: filterVariables(name, values),
                      },
                      onError: error => {
                        console.log(error);
                      },
                    })
                    .then(({ data }) => {
                      if (isNew) {
                        return navigate(
                          `/edit/${resourceParam}/${data[name].id}`
                        );
                      }
                      // Reset form values with updated data
                      resetForm(filterValues(data[name], resource));
                    })
                    .catch(error => {
                      console.log(error);
                      setSubmitting(false);
                    });
                }}>
                {({ isSubmitting, dirty, resetForm, setSubmitting }) => {
                  return (
                    <GridCell span={12}>
                      <Form>
                        <GridInner>
                          {resource.edit.fields.map((field, idx) => {
                            let disabled = false;
                            switch (field.type.split(':')[0]) {
                              case 'DateTime':
                                return (
                                  <GridCell span={12} key={idx}>
                                    <Field
                                      component={FormikDateField}
                                      name={field.source}
                                      label={startCase(field.source)}
                                    />
                                  </GridCell>
                                );
                              case 'Reference':
                                const referenceObject = get(
                                  item,
                                  field.source.split('.')[0]
                                );
                                const referenceType = camelCase(
                                  field.type.split(':')[1]
                                );
                                const path = isNew
                                  ? null
                                  : `/edit/${referenceType}/${
                                      referenceObject.id
                                    }`;
                                const name = field.source.split('.')[0];
                                const referenceLabel = field.source.split(
                                  '.'
                                )[1];
                                return (
                                  <GridCell span={12} key={idx}>
                                    <Field
                                      path={path}
                                      component={FormikReferenceField}
                                      name={name}
                                      label={startCase(name)}
                                      referenceType={plural(referenceType)}
                                      referenceLabel={referenceLabel}
                                    />
                                  </GridCell>
                                );
                              case 'Boolean':
                                return (
                                  <GridCell span={12} key={idx}>
                                    <Field
                                      component={FormikCheckbox}
                                      name={field.source}
                                      label={startCase(field.source)}
                                    />
                                  </GridCell>
                                );
                              case 'Image':
                                return (
                                  <GridCell span={12} key={idx}>
                                    <Field
                                      style={{ width: '100%' }}
                                      component={FormikImageField}
                                      name={field.source}
                                      label={startCase(field.source)}
                                    />
                                  </GridCell>
                                );
                              case 'String':
                                disabled = true;
                              case 'Text':
                              default:
                                return (
                                  <GridCell span={12} key={idx}>
                                    <Field
                                      style={{ width: '100%' }}
                                      disabled={disabled}
                                      component={FormikTextField}
                                      name={field.source}
                                      label={startCase(field.source)}
                                    />
                                  </GridCell>
                                );
                            }
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
                                onCompleted={() => {
                                  navigate(`/list/${plural(resourceParam)}`);
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
                                    disabled={isSubmitting}>
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
            </Grid>
          );
        }}
      </Query>
    );
  }
}
export default ResourceEdit;
